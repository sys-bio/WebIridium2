/*
 * Wrapper for CVODE.
 *
 * TODO: how are errors handled?
 */

#include <algorithm>
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

typedef int(*RHSFunc)(double t, double y[], double ydot[], double p[]);

struct UserData {
    RHSFunc rhs;
    // Concatentating [ boundary species | parameters | reaction rates]
    // Everything after the parameters is just for recording. It should NOT be set.
    double *p;
    size_t p_len;
};

static int delegating_rhs(double t, N_Vector y, N_Vector ydot, UserData *data) {
    return data->rhs(t, NV_DATA_S(y), NV_DATA_S(ydot), data->p);
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
        int num_reactions,
        uintptr_t rhs
    ) : original_floating_species_(floating_species),
        original_boundary_species_(boundary_species),
        original_parameters_(parameters),
        num_reactions_(num_reactions)
    {
        // TODO: handle errors?
        SUNContext_Create(SUN_COMM_NULL, &ctx_);

        cvode_mem_ = CVodeCreate(CV_BDF, ctx_);
        y_ = N_VNew_Serial(floating_species.size(), ctx_);
        user_data_.p_len = boundary_species.size() + parameters.size() + num_reactions_;
        user_data_.p = new double[user_data_.p_len];
        user_data_.rhs = (RHSFunc)rhs;
        matrix_ = SUNDenseMatrix(original_floating_species_.size(), original_floating_species_.size(), ctx_);
        linear_solver_ = SUNLinSol_Dense(y_, matrix_, ctx_);

        ResetAllVariables();
    }

    ~Model() {
        if (output_array_) {
            delete[] output_array_;
        }
        SUNLinSolFree_Dense(linear_solver_);
        SUNMatDestroy_Dense(matrix_);
        delete[] user_data_.p;
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
            original_floating_species_.size() +
            original_boundary_species_.size() +
            original_parameters_.size() +
            num_reactions_;
    }

    // Reset all variables to their default values.
    void ResetAllVariables() {
        for (int i = 0; i < original_floating_species_.size(); i++) {
            NV_Ith_S(y_, i) = original_floating_species_[i];
        }

        for (int i = 0; i < original_boundary_species_.size(); i++) {
            user_data_.p[i] = original_boundary_species_[i];
        }

        for (int i = 0; i < original_parameters_.size(); i++) {
            user_data_.p[original_boundary_species_.size() + i] = original_parameters_[i];
        }
    }

    void SetFloatingSpecies(int i, double value) {
        NV_Ith_S(y_, i) = value;
    }

    void SetBoundarySpecies(int i, double value) {
        user_data_.p[i] = value;
    }

    void SetParameter(int i, double value) {
        user_data_.p[original_boundary_species_.size() + i] = value;
    }

    // WARNING: The returned array will be invalidated the next time you call Simulate.
    Float64Array SimulateTimeCourse(double start_time, double end_time, int num_points) {
        if (start_time < 0) throw std::invalid_argument("required: start_time > 0");
        if (start_time >= end_time) throw std::invalid_argument("required: start_time < end_time");
        if (num_points <= 0) throw std::invalid_argument("required: num_points > 0");

        if (!has_init_) {
            CVodeInit(cvode_mem_, (CVRhsFn)delegating_rhs, 0.0, y_);

            CVodeSetLinearSolver(cvode_mem_, linear_solver_, matrix_);
            CVodeSetUserData(cvode_mem_, &user_data_);

            has_init_ = true;
        } else {
            CVodeReInit(cvode_mem_, 0.0, y_);
        }

        // TODO: what tolerances to set?
        CVodeSStolerances(cvode_mem_, 1e-8, 1e-12);

        double t_out = start_time;
        double t_return = 0.0;

        InitializeOutputArray(num_points);

        if (start_time > 0.0) {
            CVode(cvode_mem_, t_out, y_, &t_return, CV_NORMAL);
        } else {
            // run the rhs one time to get the reaction rates
            double *temp = new double[original_floating_species_.size()];
            user_data_.rhs(t_out, NV_DATA_S(y_), temp, user_data_.p);
            delete[] temp;
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

        std::copy(NV_DATA_S(y_), NV_DATA_S(y_) + original_floating_species_.size(), output_array_ + start);
        std::copy(
            user_data_.p,
            user_data_.p + user_data_.p_len,
            output_array_ + start + original_floating_species_.size()
        );
        output_array_[start + original_floating_species_.size() + user_data_.p_len] = time;

        current_output_row_ += 1;
    }

    SUNContext ctx_;
    void *cvode_mem_;
    SUNMatrix matrix_;
    SUNLinearSolver linear_solver_;

    std::vector<double> original_floating_species_;
    std::vector<double> original_boundary_species_;
    std::vector<double> original_parameters_;

    N_Vector y_;
    UserData user_data_;
    const int num_reactions_;

    bool has_init_ = false;
    double *output_array_ = nullptr; // row-major
    int current_output_row_ = -1;
};

EMSCRIPTEN_BINDINGS(cvodeBindings) {
    emscripten::register_vector<double>("DoubleVector");
    emscripten::register_type<Float64Array>("Float64Array");

    emscripten::class_<Model>("Model")
        .constructor<std::vector<double>, std::vector<double>, std::vector<double>, int, uintptr_t>(
            emscripten::allow_raw_pointers())
        .function("num_variables", &Model::num_variables)
        .function("ResetAllVariables", &Model::ResetAllVariables)
        .function("SetFloatingSpecies", &Model::SetFloatingSpecies)
        .function("SetBoundarySpecies", &Model::SetBoundarySpecies)
        .function("SetParameter", &Model::SetParameter)
        .function("SimulateTimeCourse", &Model::SimulateTimeCourse);
}
