#include <cstdint>
#include <limits>
#include <sstream>
#include <stdexcept>
#include <vector>
#include <iostream>

#include "model.h"
#include "event.h"

#include "cvode/cvode_ls.h"
#include "nvector/nvector_serial.h"
#include "cvode/cvode.h"
#include "sundials/sundials_context.h"
#include "sundials/sundials_nvector.h"
#include "sundials/sundials_types.h"
#include "sunlinsol/sunlinsol_dense.h"
#include "sunmatrix/sunmatrix_dense.h"

int delegating_rhs(double t, N_Vector y, N_Vector ydot, Model *data) {
    return data->rhs_fn_(t, NV_DATA_S(y), NV_DATA_S(ydot), data->p_.data());
}

int delegating_roots(double t, N_Vector y, double *gout, Model *data) {
    // TODO: we need to optimize this so we aren't recalculating everything for each event
    data->rhs_fn_(t, NV_DATA_S(y), data->dummy_y_dot_, data->p_.data());

    data->roots_fn_(t, NV_DATA_S(y), gout, data->p_.data());
    return 0;
}

static double const kEpsilon = std::numeric_limits<double>::epsilon();

Model::Model(
    std::vector<double> y,
    std::vector<double> p,
    int num_reactions,
    uintptr_t rhs,
    std::optional<EventParams> event_params
) : original_y_(y),
    original_p_(p),
    event_params_(event_params),
    num_reactions_(num_reactions)
{
    // TODO: handle errors?
    SUNContext_Create(SUN_COMM_NULL, &ctx_);

    cvode_mem_ = CVodeCreate(CV_BDF, ctx_);
    y_ = N_VNew_Serial(y.size(), ctx_);
    p_.resize(original_p_.size() + num_reactions_);
    rhs_fn_ = (RHSFunc*)rhs;
    dummy_y_dot_ = new double[original_y_.size()];
    matrix_ = SUNDenseMatrix(original_y_.size(), original_y_.size(), ctx_);
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
    SUNLinSolFree_Dense(linear_solver_);
    SUNMatDestroy_Dense(matrix_);
    delete[] dummy_y_dot_;
    N_VDestroy_Serial(y_);
    CVodeFree(&cvode_mem_);
    SUNContext_Free(&ctx_);
}

void Model::ResetState() {
    time_ = 0.0;

    for (int i = 0; i < original_y_.size(); i++) {
        NV_Ith_S(y_, i) = original_y_[i];
    }

    for (int i = 0; i < original_p_.size(); i++) {
        p_[i] = original_p_[i];
    }

    event_queue_.Clear();

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

void Model::SetAbsoluteTolerance(double value) {
    abs_tol_ = value;
}

void Model::SetRelativeTolerance(double value) {
    rel_tol_ = value;
}

Float64Array Model::SimulateTimeCourse(double start_time, double end_time, int num_points) {
    if (start_time < 0) throw std::invalid_argument("required: start_time > 0");
    if (start_time >= end_time) throw std::invalid_argument("required: start_time < end_time");
    if (num_points <= 0) throw std::invalid_argument("required: num_points > 0");

    if (!has_init_) {
        CVodeInit(cvode_mem_, (CVRhsFn)delegating_rhs, time_, y_);

        CVodeSetLinearSolver(cvode_mem_, linear_solver_, matrix_);
        CVodeSetUserData(cvode_mem_, this);

        has_init_ = true;
    } else {
        CVodeReInit(cvode_mem_, time_, y_);
    }

    CVodeSStolerances(cvode_mem_, rel_tol_, abs_tol_);

    if (event_params_.has_value()) {
        CVodeRootInit(cvode_mem_, num_roots_, (CVRootFn)delegating_roots);

        rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data());

        UpdateEvents();
        RunPendingEventInvocations();
    }

    double target_time = time_ + start_time;

    InitializeOutputArray(num_points);

    if (start_time > 0.0) {
        Integrate(target_time);
    }

    // TODO: temporary hack to get the RHS to update the `p` variables
    //       later should make separate update function
    rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data());

    RecordToOutputArray(time_);

    int num_steps = num_points - 1; // minus 1 because 0 counts as the first
    double time_step = (end_time - start_time) / num_steps;

    for (int i = 0; i < num_steps; i++) {
        target_time += time_step;

        Integrate(target_time);

        // dumb hack to update p values like above
        rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data());

        RecordToOutputArray(time_);
    }

    return Float64Array(
        emscripten::val(emscripten::typed_memory_view(num_points * num_variables(), output_array_))
    );
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
            std::cout << "hit root at " << time_ << std::endl;
            CVodeGetRootInfo(cvode_mem_, roots_found_.data());

            // TODO: replace this with better
            rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data());

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
            // TODO: error handling?
            break;
        }
    }
}

void Model::EnqueueEventsFromSwap() {
    for (int i = 0; i < events_swap_.size(); i++) {
        if (events_swap_[i]) {
            if (!current_triggered_events_[i]) {
                const EventInfo &info = event_params_.value().event_info[i];
                if (!info.is_for_piecewise) {
                    EnqueueEvent(info);
                }
            }
        } else if (!events_swap_[i]) {
            if (current_triggered_events_[i]) {
                const EventInfo &info = event_params_.value().event_info[i];
                if (!info.is_persistent && !info.is_for_piecewise) {
                    event_queue_.RemoveInvocationsOf(info);
                }
            }
        }
    }

    current_triggered_events_.swap(events_swap_);
}

void Model::UpdateEvents() {
    ((UpdateConditionsFn*)event_params_.value().update_conditions_fn)(
        time_,
        NV_DATA_S(y_),
        p_.data(),
        conditions_state_.data(),
        events_swap_.data()
    );

    std::cout << "time: " << time_ << std::endl;
    for (int i = 0 ; i < events_swap_.size(); i++) {
        std::cout << "[" << i << "] = " << events_swap_[i] << std::endl;
    }

    EnqueueEventsFromSwap();
}

void Model::EnqueueEvent(const EventInfo &info) {
    const double delay =
        reinterpret_cast<GetOptionFn*>(info.get_delay_fn) == nullptr
            ? 0
            : ((GetOptionFn*)info.get_delay_fn)(time_, NV_DATA_S(y_), p_.data());

    const double priority =
        reinterpret_cast<GetOptionFn*>(info.get_priority_fn) == nullptr
            ? 0
            : ((GetOptionFn*)info.get_priority_fn)(time_, NV_DATA_S(y_), p_.data());

    EventInvocation invocation{
        &info,
        time_ + delay,
        priority,
        std::vector<double>(info.y_indices.size()),
        std::vector<double>(info.p_indices.size()),
    };

    if (info.is_from_trigger) {
        ((GetAssignmentsFn*)info.get_assignments_fn)(
            time_,
            NV_DATA_S(y_),
            p_.data(),
            invocation.y_values.data(),
            invocation.p_values.data()
        );
    }

    event_queue_.AddInvocation(std::move(invocation));
}

void Model::RunPendingEventInvocations() {
    bool updated = false;

    while (event_queue_.IsInvocationAvailable(time_)) {
        EventInvocation invocation = event_queue_.PopInvocation();
        if (!invocation.event_info->is_from_trigger) {
            ((GetAssignmentsFn*)invocation.event_info->get_assignments_fn)(
                time_,
                NV_DATA_S(y_),
                p_.data(),
                invocation.y_values.data(),
                invocation.p_values.data()
            );
        }

        RunEventInvocation(invocation);

        updated = true;
    }

    if (updated) {
        CVodeReInit(cvode_mem_, time_, y_);
    }
}

void Model::RunEventInvocation(const EventInvocation &invocation) {
    const EventInfo *info = invocation.event_info;

    for (int iy = 0; iy < info->y_indices.size(); iy++) {
        NV_Ith_S(y_, info->y_indices[iy]) = invocation.y_values[iy];
        std::cout << "y[" << info->y_indices[iy] << "] = " << invocation.y_values[iy] << std::endl;
    }

    for (int ip = 0; ip < info->p_indices.size(); ip++) {
        p_[info->p_indices[ip]] = invocation.p_values[ip];
        std::cout << "p[" << info->p_indices[ip] << "] = " << invocation.p_values[ip] << std::endl;
    }


    rhs_fn_(time_, NV_DATA_S(y_), dummy_y_dot_, p_.data());
    UpdateEvents();
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

    current_output_row_ += 1;
}
