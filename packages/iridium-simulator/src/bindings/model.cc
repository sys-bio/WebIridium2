#include <cstdint>
#include <limits>
#include <stdexcept>
#include <vector>
#include <algorithm>

#include "model.h"
#include "context.h"
#include "event.h"

#include "nvector/nvector_serial.h"
#include "sundials/sundials_nvector.h"
#include "sundials/sundials_types.h"

// #define DEBUG_LOG

static double const kEpsilon = std::numeric_limits<double>::epsilon();

static int const kMaxInvocationsInOneStep = 16777216;

// i added _parma before some parameteres since they get moved (don't want to re-use them)
Model::Model(
    std::vector<double> y_param,
    std::vector<double> p_param,
    int num_reactions,
    uintptr_t update_p,
    uintptr_t convert_to_amounts,
    uintptr_t convert_to_concentrations,
    uintptr_t convert_reset,
    std::optional<EventParams> event_params_param
) : original_y_(std::move(y_param)),
    original_p_(std::move(p_param)),
    event_params_(std::move(event_params_param)),
    num_reactions_(num_reactions),
    update_p_fn_((UpdatePFunc*)update_p),
    convert_to_amounts_fn_((ConvertFunc*)convert_to_amounts),
    convert_to_concentrations_fn_((ConvertFunc*)convert_to_concentrations),
    convert_reset_fn_((ConvertFunc*)convert_reset),
    event_queue_([this](EventInvocation &invocation) {
        invocation.priority = CalculatePriority(invocation);
    })
{
    SUNContext ctx = get_ctx();

    if (HasEmptyY()) {
        // Make a dummy 1d state vector.
        y_ = N_VNew_Serial(1, ctx);
    } else {
        y_ = N_VNew_Serial(original_y_.size(), ctx);
    }

    p_.resize(
        original_p_.size() +
        num_reactions_ +
        original_y_.size()
    );
    abs_tol_v_ = N_VNew_Serial(NV_LENGTH_S(y_), ctx);

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
    N_VDestroy_Serial(y_);
    N_VDestroy_Serial(abs_tol_v_);
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
    UpdateP(time_);

    if (!has_init_) {
        InitIntegrator(num_roots_);
        has_init_ = true;
    } else {
        ReinitIntegrator();
    }

    // Update tolerances using scaling factor
    UpdateTolerances();

    InitializeOutputArray(num_points);

    if (event_params_.has_value()) {
        UpdateEvents();
        RunPendingEventInvocations();
    }

    double target_time = time_ + start_time;

    if (start_time > 0.0) {
        Integrate(target_time);
    }

    UpdateP(time_);

    RecordToOutputArray(time_);

    int num_steps = num_points - 1; // minus 1 because 0 counts as the first
    double time_step = (end_time - start_time) / num_steps;
    double sim_start_time = time_;

    for (int i = 0; i < num_steps; i++) {
        // Do multiplication like this to avoid accumulating floating-point errors.
        target_time = sim_start_time + (i + 1) * time_step;

        Integrate(target_time);

        UpdateP(time_);

        RecordToOutputArray(time_);
    }

    // convert back to concentrations in case the user runs another time course with same state
    convert_reset_fn_(NV_DATA_S(y_), p_.data());

    return Float64Array(
        emscripten::val(emscripten::typed_memory_view(num_points * num_variables(), output_array_))
    );
}

void Model::HandleRoots(double time, N_Vector y, double *gout) {
    UpdateP(time);

    roots_fn_(
        time,
        NV_DATA_S(y),
        gout,
        p_.data(),
        current_triggered_events_.data()
    );
}

void Model::HandleRootsFound() {
    UpdateP(time_);

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
}

void Model::UpdateP(double time) {
    update_p_fn_(time, NV_DATA_S(y_), p_.data(), current_triggered_events_.data());
};

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
        ReinitIntegrator();
    }
}

void Model::RunEventInvocation(const EventInvocation &invocation) {
    const EventInfo *info = invocation.event_info;

    ((SetAssignmentsFn*)info->set_assignments_fn)(NV_DATA_S(y_), p_.data(), invocation.y_values.data(), invocation.p_values.data());

    UpdateP(time_);

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
        p_.data() + p_.size() - original_y_.size(),
        output_array_ + start + original_y_.size()
    );
    output_array_[start + original_y_.size() + p_.size() - original_y_.size()] = time;

    convert_to_concentrations_fn_(
        output_array_ + start,
        output_array_ + start + original_y_.size()
    );

    current_output_row_ += 1;
}
