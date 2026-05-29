#include <cstdint>
#include <limits>
#include <sstream>
#include <stdexcept>
#include <vector>

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

static int delegating_rhs(double t, N_Vector y, N_Vector ydot, UserData *data) {
    return data->rhs(t, NV_DATA_S(y), NV_DATA_S(ydot), data->p);
}

static int delegating_roots(double t, N_Vector y, double *gout, UserData *data) {
    data->roots(t, NV_DATA_S(y), gout, data->p);
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
    user_data_.p_len = p.size() + num_reactions_;
    user_data_.p = new double[user_data_.p_len];
    user_data_.rhs = (RHSFunc*)rhs;
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
        user_data_.roots = (RootsFn*)event_params.roots_fn;
    }

    ResetState();
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

void Model::ResetState() {
    time_ = 0.0;

    for (int i = 0; i < original_y_.size(); i++) {
        NV_Ith_S(y_, i) = original_y_[i];
    }

    for (int i = 0; i < original_p_.size(); i++) {
        user_data_.p[i] = original_p_[i];
    }

    event_queue_.Clear();

    if (event_params_.has_value()) {
        const EventParams &params = event_params_.value();
        current_triggered_events_ = std::vector<bool>();

        roots_found_ = std::vector<int>(num_roots_);
        conditions_state_ = std::vector<WasmBool>(num_roots_);
        current_triggered_events_ = std::vector<bool>(params.event_info.size());
    }
}

void Model::SetYValue(int i, double value) {
    NV_Ith_S(y_, i) = value;
}

void Model::SetPValue(int i, double value) {
    user_data_.p[i] = value;
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
        CVodeSetUserData(cvode_mem_, &user_data_);

        has_init_ = true;
    } else {
        CVodeReInit(cvode_mem_, time_, y_);
    }

    CVodeSStolerances(cvode_mem_, rel_tol_, abs_tol_);

    if (event_params_.has_value()) {
        CVodeRootInit(cvode_mem_, num_roots_, (CVRootFn)delegating_roots);

        UpdateEvents(time_ == 0.0);
        ApplyPendingEvents();
    }

    double target_time = time_ + start_time;

    InitializeOutputArray(num_points);

    if (start_time > 0.0) {
        Integrate(target_time);
    }

    // TODO: temporary hack to get the RHS to update the `p` variables
    //       later should make separate update function
    std::vector<double> dummy_y_dot(original_y_.size());
    user_data_.rhs(time_, NV_DATA_S(y_), dummy_y_dot.data(), user_data_.p);

    RecordToOutputArray(time_);

    int num_steps = num_points - 1; // minus 1 because 0 counts as the first
    double time_step = (end_time - start_time) / num_steps;

    for (int i = 0; i < num_steps; i++) {
        target_time += time_step;

        Integrate(target_time);

        // dumb hack to update p values like above
        user_data_.rhs(time_, NV_DATA_S(y_), dummy_y_dot.data(), user_data_.p);

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
                // TOOD: do we know that CVODE guarantees we will always go at or past the target time?
                if (time_ >= event_time) {
                    ApplyPendingEvents();
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
            CVodeGetRootInfo(cvode_mem_, roots_found_.data());

            std::vector<WasmBool> triggered_events(num_roots_);

            ((CheckEventsFn*)event_params_.value().check_events_fn)(
                time_,
                roots_found_.data(),
                conditions_state_.data(),
                triggered_events.data()
            );

            for (int i = 0; i < triggered_events.size(); i++) {
                if (triggered_events[i]) {
                    if (!current_triggered_events_[i]) {
                        current_triggered_events_[i] = true;

                        EnqueueEvent(event_params_.value().event_info[i]);
                    }
                } else if (!triggered_events[i]) {
                    if (current_triggered_events_[i]) {
                        current_triggered_events_[i] = false;

                        const EventInfo &info = event_params_.value().event_info[i];
                        if (info.is_persistent) {
                            // TODO: persistent
                        }
                    }
                }
            }

            ApplyPendingEvents();
        } else {
            // TODO: error handling?
            break;
        }
    }
}

void Model::UpdateEvents(bool is_t0) {

}

void Model::EnqueueEvent(const EventInfo &info) {
    const double delay =
        reinterpret_cast<GetOptionFn*>(info.get_delay_fn) == nullptr
            ? 0
            : ((GetOptionFn*)info.get_delay_fn)(time_, NV_DATA_S(y_), user_data_.p);

    const double priority =
        reinterpret_cast<GetOptionFn*>(info.get_priority_fn) == nullptr
            ? 0
            : ((GetOptionFn*)info.get_priority_fn)(time_, NV_DATA_S(y_), user_data_.p);

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
            user_data_.p,
            invocation.y_values.data(),
            invocation.p_values.data()
        );
    }

    event_queue_.AddInvocation(std::move(invocation));
}

void Model::ApplyPendingEvents() {
    bool updated = false;

    while (event_queue_.IsInvocationAvailable(time_)) {
        EventInvocation invocation = event_queue_.PopInvocation();
        if (!invocation.event_info->is_from_trigger) {
            ((GetAssignmentsFn*)invocation.event_info->get_assignments_fn)(
                time_,
                NV_DATA_S(y_),
                user_data_.p,
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
    }

    for (int ip = 0; ip < info->p_indices.size(); ip++) {
        user_data_.p[info->p_indices[ip]] = invocation.p_values[ip];
    }

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
        user_data_.p,
        user_data_.p + user_data_.p_len,
        output_array_ + start + original_y_.size()
    );
    output_array_[start + original_y_.size() + user_data_.p_len] = time;

    current_output_row_ += 1;
}
