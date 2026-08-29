#include <cstdint>
#include <cstdio>
#include <limits>
#include <sstream>
#include <stdexcept>
#include <vector>
#include <iostream>
#include <algorithm>

#include "model.h"
#include "event.h"

#include "cvode/cvode_ls.h"
#include "nvector/nvector_serial.h"
#include "cvode/cvode.h"
#include "sundials/sundials_context.h"
#include "sundials/sundials_nvector.h"
#include "sundials/sundials_types.h"
#include "sunlinsol/sunlinsol_dense.h"
#include "sunnonlinsol/sunnonlinsol_newton.h"
#include "sunmatrix/sunmatrix_dense.h"

// #define DEBUG_LOG

int delegating_rhs(double t, N_Vector y, N_Vector ydot, Model *model) {
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

// For the empty RHS, there will be one dummy value in the state vector. We just set it to 0.
int empty_rhs(double t, N_Vector y, N_Vector ydot, Model *model) {
    NV_Ith_S(ydot, 0) = 0;
    return CV_SUCCESS;
}

int delegating_roots(double t, N_Vector y, double *gout, Model *model) {
    // TODO: we need to optimize this so we aren't recalculating everything for each event
    model->rhs_fn_(t, NV_DATA_S(y), model->dummy_y_dot_, model->p_.data(), model->current_triggered_events_.data());

    model->roots_fn_(
        t,
        NV_DATA_S(y),
        gout,
        model->p_.data(),
        model->current_triggered_events_.data()
    );
    return 0;
}

static double const kEpsilon = std::numeric_limits<double>::epsilon();

static int const kMaxInvocationsInOneStep = 16777216;

Model::Model(
    std::vector<double> y,
    std::vector<double> p,
    int num_reactions,
    uintptr_t rhs,
    uintptr_t convert_to_amounts,
    uintptr_t convert_to_concentrations,
    uintptr_t convert_reset,
    std::optional<EventParams> event_params
) : original_y_(y),
    original_p_(p),
    event_params_(event_params),
    num_reactions_(num_reactions),
    rhs_fn_((RHSFunc*)rhs),
    convert_to_amounts_fn_((ConvertFunc*)convert_to_amounts),
    convert_to_concentrations_fn_((ConvertFunc*)convert_to_concentrations),
    convert_reset_fn_((ConvertFunc*)convert_reset),
    event_queue_([this](EventInvocation &invocation) {
        invocation.priority = CalculatePriority(invocation);
    })
{
    // TODO: handle errors?
    SUNContext_Create(SUN_COMM_NULL, &ctx_);

    cvode_mem_ = CVodeCreate(CV_BDF, ctx_);

    if (original_y_.empty()) {
        // Make a dummy 1d state vector.
        y_ = N_VNew_Serial(1, ctx_);
    } else {
        y_ = N_VNew_Serial(y.size(), ctx_);
    }

    p_.resize(original_p_.size() + num_reactions_);
    dummy_y_dot_ = new double[NV_LENGTH_S(y_)];
    abs_tol_v_ = N_VNew_Serial(NV_LENGTH_S(y_), ctx_);

    matrix_ = SUNDenseMatrix(NV_LENGTH_S(y_), NV_LENGTH_S(y_), ctx_);
    non_lin_solver_ = SUNNonlinSol_Newton(y_, ctx_);
    linear_solver_ = SUNLinSol_Dense(y_, matrix_, ctx_);

    if (!event_params_.has_value()) {
        num_roots_ = 0;
    } else {
        const EventParams &event_params = event_params_.value();
        int total_conditions = 0;
        for (const EventInfo &info : event_params.event_info) {
            total_conditions += info.num_roots;
        }

        num_roots_ = total_conditions;
        roots_fn_ = (RootsFn*)event_params.roots_fn;
        events_swap_ = std::vector<WasmBool>(event_params.event_info.size());
        current_triggered_events_ = std::vector<WasmBool>(event_params.event_info.size());
    }

    ResetState();
}

Model::~Model() {
    if (output_array_) {
        delete[] output_array_;
    }
    SUNNonlinSolFree(non_lin_solver_);
    SUNLinSolFree_Dense(linear_solver_);
    SUNMatDestroy_Dense(matrix_);
    delete[] dummy_y_dot_;
    N_VDestroy_Serial(y_);
    N_VDestroy_Serial(abs_tol_v_);
    CVodeFree(&cvode_mem_);
    SUNContext_Free(&ctx_);
}

void Model::ResetState() {
    time_ = 0.0;

    if (original_y_.empty()) {
        // Reset the dummy value.
        NV_Ith_S(y_, 0) = 0;
    } else {
        for (int i = 0; i < original_y_.size(); i++) {
            NV_Ith_S(y_, i) = original_y_[i];
        }
    }

    for (int i = 0; i < original_p_.size(); i++) {
        p_[i] = original_p_[i];
    }

    event_queue_.Reset();

    if (event_params_.has_value()) {
        const EventParams &params = event_params_.value();

        roots_found_ = std::vector<int>(num_roots_);
        conditions_state_ = std::vector<WasmBool>(num_roots_);

        for (int i = 0; i < params.event_info.size(); i++) {
            current_triggered_events_[i] = params.event_info[i].is_t0;
        }
    }
}

void Model::SetYValue(int i, double value) {
    NV_Ith_S(y_, i) = value;
}

void Model::SetPValue(int i, double value) {
    p_[i] = value;
}

void Model::SetAbsoluteToleranceFactor(double value) {
    abs_tol_factor_ = value;
}

void Model::SetRelativeTolerance(double value) {
    rel_tol_ = value;
}

Float64Array Model::SimulateTimeCourse(double start_time, double end_time, int num_points) {
    if (start_time < 0) throw std::invalid_argument("required: start_time > 0");
    if (start_time >= end_time) throw std::invalid_argument("required: start_time < end_time");
    if (num_points <= 1) throw std::invalid_argument("required: num_points > 1");

    convert_to_amounts_fn_(NV_DATA_S(y_), p_.data());
    rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data(), current_triggered_events_.data());

    if (!has_init_) {
        if (original_y_.empty()) {
            CVodeInit(cvode_mem_, (CVRhsFn)empty_rhs, time_, y_);
        } else {
            CVodeInit(cvode_mem_, (CVRhsFn)delegating_rhs, time_, y_);
        }

        CVodeSetNonlinearSolver(cvode_mem_, non_lin_solver_);
        CVodeSetLinearSolver(cvode_mem_, linear_solver_, matrix_);
        CVodeSetUserData(cvode_mem_, this);

        has_init_ = true;
    } else {
        CVodeReInit(cvode_mem_, time_, y_);
    }

    // Update tolerances using scaling factor
    if (original_y_.empty()) {
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

    InitializeOutputArray(num_points);

    if (event_params_.has_value()) {
        CVodeRootInit(cvode_mem_, num_roots_, (CVRootFn)delegating_roots);

        rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data(), current_triggered_events_.data());

        UpdateEvents();
        RunPendingEventInvocations();
    }

    double target_time = time_ + start_time;

    if (start_time > 0.0) {
        Integrate(target_time);
    }

    // TODO: temporary hack to get the RHS to update the `p` variables
    //       later should make separate update function
    rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data(), current_triggered_events_.data());

    RecordToOutputArray(time_);

    int num_steps = num_points - 1; // minus 1 because 0 counts as the first
    double time_step = (end_time - start_time) / num_steps;
    double sim_start_time = time_;

    for (int i = 0; i < num_steps; i++) {
        // Do multiplication like this to avoid accumulating floating-point errors.
        target_time = sim_start_time + (i + 1) * time_step;

        Integrate(target_time);

        // dumb hack to update p values like above
        rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data(), current_triggered_events_.data());

        RecordToOutputArray(time_);
    }

    // convert back to concentrations in case the user runs another time course with same state
    convert_reset_fn_(NV_DATA_S(y_), p_.data());

    return Float64Array(
        emscripten::val(emscripten::typed_memory_view(num_points * num_variables(), output_array_))
    );
}

void Model::DumpStats() {
    long int nsteps, nfevals, nlinsteps, netfails;
    int qlast, qcur;
    double hinused, hlast, hcur, tcur;

    CVodePrintAllStats(cvode_mem_, stdout, SUN_OUTPUTFORMAT_TABLE);

    // CVodeGetIntegratorStats(
    //     cvode_mem_,
    //     &nsteps, &nfevals, &nlinsteps, &netfails,
    //     &qlast, &qcur,
    //     &hinused, &hlast, &hcur, &tcur
    // );
    //
    // std::cout
    //     << "Number of Steps: " << nsteps << "\n"
    //     << "Number of RHS calls: " << nfevals << "\n"
    //     << "Number of linear solver setups: " << nlinsteps << "\n"
    //     << "Number of error test failures: " << netfails << "\n"
    //     << "Method order in last step: " << qlast << "\n"
    //     << "Initial step size: " << hinused << "\n"
    //     << "Last step size: " << hlast << "\n"
    //     << "Next step size: " << hcur << "\n"
    //     << "Internal time: " << tcur << std::endl;
}

void Model::Integrate(double target_time) {
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

            // TODO: replace this with better
            rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data(), current_triggered_events_.data());

            ((CheckRootsFn*)event_params_.value().check_roots_fn)(
                time_,
                NV_DATA_S(y_),
                p_.data(),
                roots_found_.data(),
                conditions_state_.data(),
                events_swap_.data()
            );

            EnqueueEventsFromSwap();

            RunPendingEventInvocations();
        } else {
            // TODO: actual error handling? useful error message?!?!
            std::stringstream ss;
            ss << "CVODE Error: " << result << std::endl;
            throw std::runtime_error(ss.str());
            break;
        }
    }
}

void Model::EnqueueEventsFromSwap() {
#ifdef DEBUG_LOG
    std::cout << "time: " << time_ << std::endl;

    for (int i = 0; i < num_roots_; i++) {
        std::cout << "r[" << i << "] = " << conditions_state_[i] << std::endl;
    }

    for (int i = 0 ; i < events_swap_.size(); i++) {
        std::cout << "e[" << i << "] = " << events_swap_[i] << std::endl;
    }
#endif

    // NOTE: we don't actually swap the events_swap_ since both need to have
    //       the exact same state or some things won't work in some edge-cases.
    for (int i = 0; i < events_swap_.size(); i++) {
        if (events_swap_[i]) {
            if (!current_triggered_events_[i]) {
                current_triggered_events_[i] = events_swap_[i];
                const EventInfo &info = event_params_.value().event_info[i];
                EnqueueEvent(info);
            }
        } else if (!events_swap_[i]) {
            if (current_triggered_events_[i]) {
                current_triggered_events_[i] = events_swap_[i];
                const EventInfo &info = event_params_.value().event_info[i];
                if (info.is_for_piecewise) {
                    // Always for piecewise we need to enqueue a dummy invocation in case
                    // we switched branches
                    EnqueueEvent(info);
                } else if (!info.is_persistent) {
                    event_queue_.RemoveInvocationsOf(info);
                }
            }
        }
    }
}

double Model::CalculatePriority(const EventInvocation &invocation) {
    if (
        invocation.event_info->is_for_piecewise ||
        reinterpret_cast<GetOptionFn*>(invocation.event_info->get_priority_fn) == nullptr
    ) {
        return 0.0;
    } else {
        return reinterpret_cast<GetOptionFn*>(invocation.event_info->get_priority_fn)(
            time_,
            NV_DATA_S(y_),
            p_.data(),
            current_triggered_events_.data()
        );
    }
}

void Model::UpdateEvents() {
    ((UpdateConditionsFn*)event_params_.value().update_conditions_fn)(
        time_,
        NV_DATA_S(y_),
        p_.data(),
        conditions_state_.data(),
        events_swap_.data()
    );

    EnqueueEventsFromSwap();
}

void Model::EnqueueEvent(const EventInfo &info) {
    const double delay =
        info.is_for_piecewise || reinterpret_cast<GetOptionFn*>(info.get_delay_fn) == nullptr
            ? 0
            : ((GetOptionFn*)info.get_delay_fn)(time_, NV_DATA_S(y_), p_.data(), current_triggered_events_.data());


    EventInvocation invocation{
        &info,
        time_ + delay,
        0.0, // dummy value
        std::vector<double>(info.y_indices.size()),
        std::vector<double>(info.p_indices.size()),
    };

    if (info.is_from_trigger && !info.is_for_piecewise) {
        ((GetAssignmentsFn*)info.get_assignments_fn)(
            time_,
            NV_DATA_S(y_),
            p_.data(),
            current_triggered_events_.data(),
            invocation.y_values.data(),
            invocation.p_values.data()
        );
    }

    event_queue_.AddInvocation(std::move(invocation));
}

void Model::RunPendingEventInvocations() {
    int invocation_count = 0;
    bool updated = false;

    event_queue_.AdvanceTime(time_);

    while (event_queue_.IsInvocationAvailable()) {
        invocation_count++;
        EventInvocation invocation = event_queue_.PopInvocation();

        // For piecewise, just set updated to true so we know to re-init.
        if (invocation.event_info->is_for_piecewise) {
            updated = true;
            continue;
        }

        if (!invocation.event_info->is_from_trigger) {
            ((GetAssignmentsFn*)invocation.event_info->get_assignments_fn)(
                time_,
                NV_DATA_S(y_),
                p_.data(),
                current_triggered_events_.data(),
                invocation.y_values.data(),
                invocation.p_values.data()
            );
        }

        RunEventInvocation(invocation);

        updated = true;

        if (invocation_count > kMaxInvocationsInOneStep) {
            throw std::runtime_error("Max events exceeded in one step.");
        }
    }

    if (updated) {
#ifdef DEBUG_LOG
        std::cout << "Re-init at " << time_ << std::endl;
#endif
        CVodeReInit(cvode_mem_, time_, y_);
    }
}

void Model::RunEventInvocation(const EventInvocation &invocation) {
    const EventInfo *info = invocation.event_info;

    ((SetAssignmentsFn*)info->set_assignments_fn)(NV_DATA_S(y_), p_.data(), invocation.y_values.data(), invocation.p_values.data());

    rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data(), current_triggered_events_.data());

    UpdateEvents();

    event_queue_.UpdatePriorities();
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
        p_.data(),
        p_.data() + p_.size(),
        output_array_ + start + original_y_.size()
    );
    output_array_[start + original_y_.size() + p_.size()] = time;

    convert_to_concentrations_fn_(
        output_array_ + start,
        output_array_ + start + original_y_.size()
    );

    current_output_row_ += 1;
}
