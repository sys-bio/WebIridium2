#pragma once

#include <vector>
#include <optional>
#include <cstdint>

#include <emscripten/val.h>

#include "nvector/nvector_serial.h"
#include "sundials/sundials_nvector.h"

#include "event.h"
#include "wasm.h"

EMSCRIPTEN_DECLARE_VAL_TYPE(Float64Array);

using UpdatePFunc = void(double time, double y[], double p[], WasmBool events[]);
using ConvertFunc = void(double y[], double p[]);

struct EventParams {
    std::vector<EventInfo> event_info;
    uintptr_t roots_fn;
    uintptr_t check_roots_fn;
    uintptr_t update_conditions_fn;
};

class Model {
public:
    Model(
        std::vector<double> y,
        std::vector<double> p,
        int num_reactions,
        int num_differential_variables,
        uintptr_t update_p,
        uintptr_t convert_to_amounts,
        uintptr_t convert_from_amounts,
        uintptr_t convert_reset,
        std::optional<EventParams> event_params
    );

    virtual ~Model();

    Model(const Model&) = delete;
    Model& operator=(const Model&) = delete;

    size_t num_variables() const {
        // plus 1 for the time
        return
            1 +
            original_y_.size() +
            p_.size();
    }

    // Reset all variables to their original values.
    void ResetState();

    void SetYValue(int i, double value);

    void SetPValue(int i, double value);

    void SetAbsoluteToleranceFactor(double value);

    void SetRelativeTolerance(double value);

    Float64Array SimulateTimeCourse(double start_time, double end_time, int num_points);

    virtual void DumpStats() = 0;

protected:
    virtual void InitIntegrator(int num_roots) = 0;

    virtual void ReinitIntegrator() = 0;

    virtual void UpdateTolerances() = 0;

    virtual void Integrate(double target_time) = 0;

    // Optional method derived classes can implement to update themselves
    // after a discontinuity such as an event invocation.
    // Default implementation does nothing.
    virtual void UpdateAfterDiscontinuity();

    // Applies any pending events, reinits CVODE if necessary.
    void RunPendingEventInvocations();

    void HandleRoots(double time, N_Vector y, double *gout);

    void HandleRootsFound();

    bool HasEmptyY() const { return original_y_.size() == 0; }

    std::vector<double> original_y_;
    std::vector<double> original_p_;
    int num_reactions_;

    // Tolerances should be set by the wrapper.

    // "absolute tolerance adjustment factor"
    // When we initialize the tolerances, we scale each variable by this number.
    // If the variable is initially 0, we just set it directly to this.
    // This seems to be a sufficient heuristic for most cases, and is what roadrunner does.
    double abs_tol_factor_ = 1;
    double rel_tol_ = 1;
    N_Vector abs_tol_v_;

    double time_;
    N_Vector y_;
    std::vector<double> p_;

    // the state of each condition (multiple conditions can make up one event)
    std::vector<WasmBool> conditions_state_;
    // the output vector for CVodeGetRootInfo (re-use to save allocations)
    std::vector<int> roots_found_;
    std::vector<WasmBool> current_triggered_events_;

    EventQueue event_queue_;

private:
    void UpdateP(double time);

    // Enqueues any events as indicated by the event swap buffer.
    void EnqueueEventsFromSwap();

    double CalculatePriority(const EventInvocation &invocation);

    // Updates all event states, adds any to the queue.
    // This is meant to be used whenever any discontinuous changes are made.
    // Rely on Integrate for event updates during simulation.
    void UpdateEvents();

    // Creates an invocation of an event to the event queue.
    void EnqueueEvent(const EventInfo &info);

    // Runs an instance of an event invocation.
    void RunEventInvocation(const EventInvocation &invocation);

    void InitializeOutputArray(int num_points);

    void RecordToOutputArray(double time);

    ConvertFunc *convert_to_amounts_fn_;
    ConvertFunc *convert_to_concentrations_fn_;
    ConvertFunc *convert_reset_fn_;
    UpdatePFunc *update_p_fn_;
    RootsFn *roots_fn_;

    bool has_init_ = false;
    double *output_array_ = nullptr; // row-major
    int current_output_row_ = -1;

    std::optional<EventParams> event_params_;
    int num_roots_;

    // Every time we update which events are active, tell the generated function to put
    // its results here. Then we will compare this with current_triggered_events
    // and update as necessary.
    std::vector<WasmBool> events_swap_;
};
