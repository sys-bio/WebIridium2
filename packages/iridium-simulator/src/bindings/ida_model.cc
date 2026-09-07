#include <iostream>
#include <sstream>

#include "ida/ida.h"
#include "nvector/nvector_serial.h"

#include "ida_model.h"
#include "context.h"
#include "sunlinsol/sunlinsol_dense.h"
#include "sunnonlinsol/sunnonlinsol_newton.h"
#include <cstdio>
#include <stdexcept>

static double const kEpsilon = std::numeric_limits<double>::epsilon();

int delegating_ida_res(double t, N_Vector y, N_Vector ydot, N_Vector residualout, IdaModel *model) {
    return model->res_fn_(
        t,
        NV_DATA_S(y),
        NV_DATA_S(ydot),
        NV_DATA_S(residualout),
        model->p_.data(),
        model->current_triggered_events_.data()
    );
}

int empty_res(double t, N_Vector y, N_Vector ydot, N_Vector residualout, IdaModel *model) {
    NV_Ith_S(residualout, 0) = 0;
    return IDA_SUCCESS;
}

int delegating_ida_roots(double t, N_Vector y, N_Vector ydot, double *gout, IdaModel *model) {
    model->HandleRoots(t, y, gout);
    return IDA_SUCCESS;
}

IdaModel::IdaModel(
    std::vector<double> y,
    std::vector<double> p,
    int num_reactions,
    uintptr_t res,
    int algebraic_variables_start_index,
    uintptr_t update_p,
    uintptr_t convert_to_amounts,
    uintptr_t convert_from_amounts,
    uintptr_t convert_reset,
    std::optional<EventParams> event_params
) : Model(
        std::move(y),
        std::move(p),
        num_reactions,
        update_p,
        convert_to_amounts,
        convert_from_amounts,
        convert_reset,
        event_params
    ),
    res_fn_((IdaResFunc*)res)
{
    SUNContext ctx = get_ctx();

    // TODO: error hnadling?
    ida_mem_ = IDACreate(ctx);

    ydot_ = N_VNew_Serial(NV_LENGTH_S(y_), ctx);
    id_ = N_VNew_Serial(NV_LENGTH_S(y_), ctx);
    matrix_ = SUNDenseMatrix(NV_LENGTH_S(y_), NV_LENGTH_S(y_), ctx);
    non_lin_solver_ = SUNNonlinSol_Newton(y_, ctx);
    linear_solver_ = SUNLinSol_Dense(y_, matrix_, ctx);

    for (int i = 0; i < NV_LENGTH_S(y_); i++) {
        NV_Ith_S(id_, i) = i < algebraic_variables_start_index ? 1 : 0;
    }
}

IdaModel::~IdaModel() {
    N_VDestroy_Serial(ydot_);
    N_VDestroy_Serial(id_);
    SUNNonlinSolFree(non_lin_solver_);
    SUNLinSolFree_Dense(linear_solver_);
    SUNMatDestroy_Dense(matrix_);
    IDAFree(&ida_mem_);
}

void IdaModel::DumpStats() {
    IDAPrintAllStats(ida_mem_, stdout, SUN_OUTPUTFORMAT_TABLE);
}

void IdaModel::InitIntegrator(int num_roots) {
    if (HasEmptyY()) {
        IDAInit(ida_mem_, (IDAResFn)empty_res, time_, y_, ydot_);
    } else {
        IDAInit(ida_mem_, (IDAResFn)delegating_ida_res, time_, y_, ydot_);
    }

    IDASetNonlinearSolver(ida_mem_, non_lin_solver_);
    IDASetLinearSolver(ida_mem_, linear_solver_, matrix_);
    IDASetUserData(ida_mem_, this);

    IDASetId(ida_mem_, id_);

    if (num_roots > 0) {
        IDARootInit(ida_mem_, num_roots, (IDARootFn)delegating_ida_roots);
    }
}

void IdaModel::ReinitIntegrator() {
    IDAReInit(ida_mem_, time_, y_, ydot_);
}

void IdaModel::UpdateTolerances() {
    if (HasEmptyY()) {
        IDASStolerances(ida_mem_, rel_tol_, abs_tol_factor_);
    } else {
        for (int i = 0; i < NV_LENGTH_S(y_); i++) {
            double y_i = std::abs(NV_Ith_S(y_, i));
            NV_Ith_S(abs_tol_v_, i) =
                (y_i == 0)
                    ? abs_tol_factor_
                    : y_i * abs_tol_factor_;
        }

        IDASVtolerances(ida_mem_, rel_tol_, abs_tol_v_);
    }
}

void IdaModel::Integrate(double target_time) {
    while (target_time - time_ >= kEpsilon) {
        double event_time = event_queue_.GetNextInvocationTime();
        bool go_to_event = event_time > 0 && event_time < target_time;
        int result =
            go_to_event
                ? IDASolve(ida_mem_, event_time, &time_, y_, ydot_, IDA_NORMAL)
                : IDASolve(ida_mem_, target_time, &time_, y_, ydot_, IDA_NORMAL);

        if (result == IDA_SUCCESS) {
            if (!go_to_event) {
                break;
            } else {
                // TODO: do we know that CVODE guarantees we will always go at or past the target time?
                if (time_ >= event_time) {
                    RunPendingEventInvocations();
                    continue;
                } else {
                    // what happened??
                    std::stringstream ss;
                    ss << "Missed event!? At " << time_ << " wanted " << event_time << std::endl;
                    throw std::runtime_error(ss.str());
                    continue;
                }
            }
        } else if (result == IDA_ROOT_RETURN) {
#ifdef DEBUG_LOG
            std::cout << "hit root at " << time_ << std::endl;
#endif
            IDAGetRootInfo(ida_mem_, roots_found_.data());
            HandleRootsFound();
        } else {
            // TODO: actual error handling? useful error message?!?!
            std::stringstream ss;
            ss << "IDASolve Error: " << result << std::endl;
            throw std::runtime_error(ss.str());
            break;
        }
    }
}

void IdaModel::UpdateAfterDiscontinuity() {
    // Always integrate forward so we use time_ + 0.1.
    // NOTE: this might not always the best thing to do.
    //       Change if issues arise.
    int result = IDACalcIC(ida_mem_, IDA_YA_YDP_INIT, time_ + 0.1);
    if (result != IDA_SUCCESS) {
        std::stringstream ss;
        ss << "IDACalcIC Error: " << result << std::endl;
        throw std::runtime_error(ss.str());
    }
}
