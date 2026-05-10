/*
 * Wrapper for CVODE.
 *
 * TODO: how are errors handled?
 */

#include <cstdint>
#include <cstdlib>
#include <emscripten/wire.h>
#include <stdexcept>
#include <vector>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "cvode/cvode_ls.h"
#include "nvector/nvector_serial.h"
#include "cvode/cvode.h"
#include "sundials/sundials_context.h"
#include "sundials/sundials_nvector.h"
#include "sundials/sundials_types.h"
#include "sunlinsol/sunlinsol_dense.h"
#include "sunmatrix/sunmatrix_dense.h"

EMSCRIPTEN_DECLARE_VAL_TYPE(Float64Array)

int DummyAiRhs(sunrealtype t, N_Vector y, N_Vector ydot, void *user_data) {
    // Access state variables
    sunrealtype *y_data = NV_DATA_S(y);
    sunrealtype *ydot_data = NV_DATA_S(ydot);
    
    // Access parameters from userData
    sunrealtype *params = static_cast<double *>(user_data);
    sunrealtype k1 = params[0];
    sunrealtype k2 = params[1];

    // Species mapping
    sunrealtype A = y_data[0];
    sunrealtype B = y_data[1];
    // C is y_data[2], but only needed if it affects rates

    // Define reaction rates
    sunrealtype reaction1 = k1 * A;
    sunrealtype reaction2 = k2 * B;

    // Calculate derivatives (RHS)
    ydot_data[0] = -reaction1;             // dA/dt
    ydot_data[1] =  reaction1 - reaction2; // dB/dt
    ydot_data[2] =  reaction2;             // dC/dt

    return 0; // Success
}

class Model {
public:
    // Parameters:
    //  - floating_species: Vector of floating species and their initial values. Variable are identified
    //                      by their indices. You are responsible for keeping track of names separately.
    //  - boundary_species: Same details as floating species.
    //  - parameters: Same as floating species.
    //  - rhs: the RHS function
    Model(
        std::vector<double> floating_species,
        std::vector<double> boundary_species,
        std::vector<double> parameters,
        uintptr_t rhs
    ) : default_floating_species_(floating_species),
        default_boundary_species_(boundary_species),
        default_parameters_(parameters),
        rhs_(DummyAiRhs)
    {
        // TODO: handle errors?
        SUNContext_Create(SUN_COMM_NULL, &ctx_);

        cvode_mem_ = CVodeCreate(CV_BDF, ctx_);
        y_ = N_VNew_Serial(floating_species.size(), ctx_);
        p_ = new double[boundary_species.size() + parameters.size()];
        matrix_ = SUNDenseMatrix(default_floating_species_.size(), default_floating_species_.size(), ctx_);
        linear_solver_ = SUNLinSol_Dense(y_, matrix_, ctx_);

        ResetAllVariables();
    }

    ~Model() {
        if (output_array_) {
            delete[] output_array_;
        }
        SUNLinSolFree_Dense(linear_solver_);
        SUNMatDestroy_Dense(matrix_);
        delete[] p_;
        N_VDestroy_Serial(y_);
        CVodeFree(&cvode_mem_);
        SUNContext_Free(&ctx_);
    }

    Model(const Model&) = delete;
    Model& operator=(const Model&) = delete;

    size_t num_variables() const {
        // plus 1 for the time
        return
            1 +
            default_floating_species_.size() +
            default_boundary_species_.size() +
            default_parameters_.size();
    }

    // Reset all variables to their default values.
    void ResetAllVariables() {
        for (int i = 0; i < default_floating_species_.size(); i++) {
            NV_Ith_S(y_, i) = default_floating_species_[i];
        }

        for (int i = 0; i < default_boundary_species_.size(); i++) {
            p_[i] = default_boundary_species_[i];
        }

        for (int i = 0; i < default_parameters_.size(); i++) {
            p_[default_boundary_species_.size() + i] = default_parameters_[i];
        }
    }

    // Set default value for floating species. If you want to set the floating species to
    // this value, you will have to call `ResetAllVariables`.
    void SetFloatingSpeciesDefault(int i, double value) {
        default_floating_species_.at(i) = value;
    }

    void SetBoundarySpeciesDefault(int i, double value) {
        default_boundary_species_.at(i) = value;
    }

    void SetParameterDefault(int i, double value) {
        default_parameters_.at(i) = value;
    }

    // WARNING: The returned array will be invalidated the next time you call Simulate.
    Float64Array SimulateTimeCourse(double start_time, double end_time, int num_points) {
        if (start_time < 0) throw std::invalid_argument("required: start_time > 0");
        if (start_time >= end_time) throw std::invalid_argument("required: start_time < end_time");
        if (num_points <= 0) throw std::invalid_argument("required: num_points > 0");

        if (!has_init_) {
            CVodeInit(cvode_mem_, rhs_, 0.0, y_);

            CVodeSetLinearSolver(cvode_mem_, linear_solver_, matrix_);
            CVodeSetUserData(cvode_mem_, p_);

            has_init_ = true;
        } else {
            CVodeReInit(cvode_mem_, 0.0, y_);
        }

        // TODO: what tolerances to set?
        CVodeSStolerances(cvode_mem_, 1e-4, 1e-8);

        double t_out = start_time;
        double t_return = 0.0;

        InitializeOutputArray(num_points);

        if (start_time > 0.0) {
            CVode(cvode_mem_, t_out, y_, &t_return, CV_NORMAL);
        }

        RecordToOutputArray(t_return);

        int num_steps = num_points - 1; // minus 1 because 0 counts as the first
        double time_step = (end_time - start_time) / num_steps;
        for (int i = 0; i < num_steps; i++) {
            t_out += time_step;

            CVode(cvode_mem_, t_out, y_, &t_return, CV_NORMAL);
            RecordToOutputArray(t_return);
        }

        return Float64Array(
            emscripten::val(emscripten::typed_memory_view(num_points * num_variables(), output_array_))
        );
    }

private:
    void InitializeOutputArray(int num_points) {
        if (output_array_) {
            delete[] output_array_;
        }

        output_array_ = new double[num_points * num_variables()];
        current_output_row_ = 0;
    }

    void RecordToOutputArray(double time) {
        int start = current_output_row_ * num_variables();
        int col = 0;

        for (int i = 0; i < default_floating_species_.size(); i++, col++) {
            output_array_[start + col] = NV_Ith_S(y_, i);
        }

        for (int i = 0; i < default_boundary_species_.size(); i++, col++) {
            output_array_[start + col] = p_[i];
        }

        for (int i = 0; i < default_parameters_.size(); i++, col++) {
            output_array_[start + col] = p_[default_boundary_species_.size() + i];
        }

        output_array_[start + col] = time;

        current_output_row_ += 1;
    }

    SUNContext ctx_;
    void *cvode_mem_;
    SUNMatrix matrix_;
    SUNLinearSolver linear_solver_;

    std::vector<double> default_floating_species_;
    std::vector<double> default_boundary_species_;
    std::vector<double> default_parameters_;

    N_Vector y_;
    CVRhsFn rhs_;
    // array of concat(boundary, parameters)
    double *p_;

    bool has_init_ = false;
    double *output_array_ = nullptr;
    int current_output_row_ = -1;
};

EMSCRIPTEN_BINDINGS(cvodeBindings) {
    emscripten::register_vector<double>("DoubleVector");
    emscripten::register_type<Float64Array>("Float64Array");

    emscripten::class_<Model>("Model")
        .constructor<std::vector<double>, std::vector<double>, std::vector<double>, uintptr_t>(
            emscripten::allow_raw_pointers())
        .function("num_variables", &Model::num_variables)
        .function("ResetAllVariables", &Model::ResetAllVariables)
        .function("SetFloatingSpeciesDefault", &Model::SetFloatingSpeciesDefault)
        .function("SetBoundarySpeciesDefault", &Model::SetBoundarySpeciesDefault)
        .function("SetParameterDefault", &Model::SetParameterDefault)
        .function("SimulateTimeCourse", &Model::SimulateTimeCourse);
}
