#include <iostream>
#include <sstream>

#include "cvode/cvode.h"
#include "nvector/nvector_serial.h"
#include "sundials/sundials_types.h"
#include "sunlinsol/sunlinsol_dense.h"
#include "sunnonlinsol/sunnonlinsol_newton.h"

#include "cvode_model.h"
#include "context.h"

// #define DEBUG_LOG

static double const kEpsilon = std::numeric_limits<double>::epsilon();

int delegating_cvode_rhs(double t, N_Vector y, N_Vector ydot, CvodeModel *model) {
    int result = model->rhs_fn_(
        t,
        NV_DATA_S(y),
        NV_DATA_S(ydot),
        model->p_.data(),
        model->current_triggered_events_.data()
    );
#ifdef DEBUG_LOG
        for (int i = 0; i < NV_LENGTH_S(ydot); i++) {
            if (i == 0) std::cout << "[time " << t << "] {";
            else std::cout << ", ";

            std::cout << NV_Ith_S(ydot, i);
        
            if (i == NV_LENGTH_S(ydot) - 1) std::cout << "}" << std::endl;
        }
#endif
    return result;
}

int empty_rhs(double t, N_Vector y, N_Vector ydot, CvodeModel *model) {
    NV_Ith_S(ydot, 0) = 0;
    return CV_SUCCESS;
}

int delegating_cvode_roots(double t, N_Vector y, double *gout, CvodeModel *model) {
    model->HandleRoots(t, y, gout);
    return CV_SUCCESS;
}

CvodeModel::CvodeModel(
    std::vector<double> y,
    std::vector<double> p,
    int num_reactions,
    uintptr_t rhs,
    uintptr_t update_p,
    uintptr_t convert_to_amounts,
    uintptr_t convert_from_amounts,
    uintptr_t convert_reset,
    std::optional<EventParams> event_params
) : Model(
        y,
        std::move(p),
        num_reactions,
        y.size(),
        update_p,
        convert_to_amounts,
        convert_from_amounts,
        convert_reset,
        event_params
    ),
    rhs_fn_((CvodeRhsFunc*)rhs)
{
    SUNContext ctx = get_ctx();

    // TODO: error hnadling?
    cvode_mem_ = CVodeCreate(CV_BDF, ctx);

    matrix_ = SUNDenseMatrix(NV_LENGTH_S(y_), NV_LENGTH_S(y_), ctx);
    non_lin_solver_ = SUNNonlinSol_Newton(y_, ctx);
    linear_solver_ = SUNLinSol_Dense(y_, matrix_, ctx);
}

CvodeModel::~CvodeModel() {
    SUNNonlinSolFree(non_lin_solver_);
    SUNLinSolFree_Dense(linear_solver_);
    SUNMatDestroy_Dense(matrix_);
    CVodeFree(&cvode_mem_);
}

void CvodeModel::DumpStats() {
    CVodePrintAllStats(cvode_mem_, stdout, SUN_OUTPUTFORMAT_TABLE);
}

void CvodeModel::InitIntegrator(int num_roots) {
    if (HasEmptyY()) {
        CVodeInit(cvode_mem_, (CVRhsFn)empty_rhs, time_, y_);
    } else {
        CVodeInit(cvode_mem_, (CVRhsFn)delegating_cvode_rhs, time_, y_);
    }

    CVodeSetNonlinearSolver(cvode_mem_, non_lin_solver_);
    CVodeSetLinearSolver(cvode_mem_, linear_solver_, matrix_);
    CVodeSetUserData(cvode_mem_, this);

    if (num_roots > 0) {
        CVodeRootInit(cvode_mem_, num_roots, (CVRootFn)delegating_cvode_roots);
    }
}

void CvodeModel::ReinitIntegrator() {
    CVodeReInit(cvode_mem_, time_, y_);
}

void CvodeModel::UpdateTolerances() {
    if (HasEmptyY()) {
        CVodeSStolerances(cvode_mem_, rel_tol_, abs_tol_factor_);
    } else {
        for (int i = 0; i < NV_LENGTH_S(y_); i++) {
            double y_i = std::abs(NV_Ith_S(y_, i));
            NV_Ith_S(abs_tol_v_, i) =
                (y_i == 0)
                    ? abs_tol_factor_
                    : y_i * abs_tol_factor_;
        }

        CVodeSVtolerances(cvode_mem_, rel_tol_, abs_tol_v_);
    }
}

void CvodeModel::Integrate(double target_time) {
    while (target_time - time_ >= kEpsilon) {
        double event_time = event_queue_.GetNextInvocationTime();
        bool go_to_event = event_time > 0 && event_time < target_time;
        int result =
            go_to_event
                ? CVode(cvode_mem_, event_time, y_, &time_, CV_NORMAL)
                : CVode(cvode_mem_, target_time, y_, &time_, CV_NORMAL);

        if (result == CV_SUCCESS) {
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
        } else if (result == CV_ROOT_RETURN) {
#ifdef DEBUG_LOG
            std::cout << "hit root at " << time_ << std::endl;
#endif
            CVodeGetRootInfo(cvode_mem_, roots_found_.data());
            HandleRootsFound();
        } else {
            // TODO: actual error handling? useful error message?!?!
            std::stringstream ss;
            ss << "CVODE Error: " << result << std::endl;
            throw std::runtime_error(ss.str());
            break;
        }
    }
}
