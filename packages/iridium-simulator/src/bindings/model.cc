#include <cstdint>
#include <vector>

#include "model.h"

#include "cvode/cvode_ls.h"
#include "nvector/nvector_serial.h"
#include "cvode/cvode.h"
#include "sundials/sundials_context.h"
#include "sundials/sundials_nvector.h"
#include "sundials/sundials_types.h"
#include "sunlinsol/sunlinsol_dense.h"
#include "sunmatrix/sunmatrix_dense.h"

static int delegating_rhs(double t, N_Vector y, N_Vector ydot, UserData *data) {
    return data->rhs(t, NV_DATA_S(y), NV_DATA_S(ydot), data->p);
}

Model::Model(
    std::vector<double> y,
    std::vector<double> p,
    int num_reactions,
    uintptr_t rhs
) : original_y_(y),
    original_p_(p),
    num_reactions_(num_reactions)
{
    // TODO: handle errors?
    SUNContext_Create(SUN_COMM_NULL, &ctx_);

    cvode_mem_ = CVodeCreate(CV_BDF, ctx_);
    y_ = N_VNew_Serial(y.size(), ctx_);
    user_data_.p_len = p.size() + num_reactions_;
    user_data_.p = new double[user_data_.p_len];
    user_data_.rhs = (RHSFunc)rhs;
    matrix_ = SUNDenseMatrix(original_y_.size(), original_y_.size(), ctx_);
    linear_solver_ = SUNLinSol_Dense(y_, matrix_, ctx_);

    ResetAllVariables();
}

Model::~Model() {
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

// Reset all variables to their default values.
void Model::ResetAllVariables() {
    for (int i = 0; i < original_y_.size(); i++) {
        NV_Ith_S(y_, i) = original_y_[i];
    }

    for (int i = 0; i < original_p_.size(); i++) {
        user_data_.p[i] = original_p_[i];
    }
}

void Model::SetYValue(int i, double value) {
    NV_Ith_S(y_, i) = value;
}

void Model::SetPValue(int i, double value) {
    user_data_.p[i] = value;
}

Float64Array Model::SimulateTimeCourse(double start_time, double end_time, int num_points) {
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
        double *temp = new double[original_y_.size()];
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

void Model::InitializeOutputArray(int num_points) {
    if (output_array_) {
        delete[] output_array_;
    }

    output_array_ = new double[num_points * num_variables()];
    current_output_row_ = 0;
}

void Model::RecordToOutputArray(double time) {
    int start = current_output_row_ * num_variables();

    std::copy(NV_DATA_S(y_), NV_DATA_S(y_) + original_y_.size(), output_array_ + start);
    std::copy(
        user_data_.p,
        user_data_.p + user_data_.p_len,
        output_array_ + start + original_y_.size()
    );
    output_array_[start + original_y_.size() + user_data_.p_len] = time;

    current_output_row_ += 1;
}
