#pragma once

#include <vector>
#include <functional>

#include "wasm.h"

// Events may have multiple roots, so len(gout) >= len(events)
// Expresses every event condition as a root-finding problem.
using RootsFn = void(double time, double y[], double gout[], double p[], WasmBool events[]);

// Updates which event triggers hold when CVODE indicates a root found.
// The conditions array is to hold state about which conditions hold between root finds.
using CheckRootsFn = void(
    double time,
    double y[],
    double p[],
    int roots[],
    WasmBool conditionsout[],
    WasmBool eventout[]
);

// Updates the conditions array and events.
using UpdateConditionsFn = void(
    double time,
    double y[],
    double p[],
    WasmBool conditionsout[],
    WasmBool eventsout[]
);

// Used for getting delay/priority.
using GetOptionFn = double(double time, double y[], double p[], WasmBool events[]);

// Generated for each event. Runs the events assignments and adds them to the pre-allocated
// yout[] and pout[] array.
using GetAssignmentsFn = void(
    double time,
    double y[],
    double p[],
    WasmBool events[],
    double yout[],
    double pout[]
);

struct EventInfo {
    // Special tag for events that just exist to flag piecewise functions.
    // An event with this will never be run.
    bool is_for_piecewise;

    bool is_persistent;
    bool is_t0;
    bool is_from_trigger;
    int num_roots;
    std::vector<int> y_indices;
    std::vector<int> p_indices;
    uintptr_t get_delay_fn;
    uintptr_t get_priority_fn;
    uintptr_t get_assignments_fn;
};

struct EventInvocation {
    const EventInfo *event_info;
    double time;
    double priority;
    std::vector<double> y_values;
    std::vector<double> p_values;
};

class EventQueue {
public:
    EventQueue(std::function<void(EventInvocation&)> update_priority_fn);
    ~EventQueue() = default;
    EventQueue(const EventQueue&) = delete;
    EventQueue& operator=(const EventQueue&) = delete;

    double time() const { return time_; }

    // Returns the time for the next event, or `-1` if there is none.
    double GetNextInvocationTime() const;

    // Adds an invocation for an event.
    void AddInvocation(EventInvocation event_invocation);

    // Removes all EventInvocation associated with the given Event.
    void RemoveInvocationsOf(const EventInfo &event_info);

    // Sets the internal time of the EventQueue.
    void AdvanceTime(double time);

    // Returns if an invocation is available to run at the event queues time.
    bool IsInvocationAvailable() const;

    // Pops and returns the highest priority invocation that is available.
    EventInvocation PopInvocation();

    // Update the priorities of everything that can run at this time.
    void UpdatePriorities();

    // Reset the EventQueue's time to 0 and clear all events.
    void Reset();

private:
    class ComparePriority {
    public:
        bool operator()(const EventInvocation &a, const EventInvocation &b) const {
            return a.priority < b.priority;
        }
    };

    class CompareDelay {
    public:
        bool operator()(const EventInvocation &a, const EventInvocation &b) const {
            return a.time > b.time;
        }
    };

    double time_ = 0.0;

    std::function<void(EventInvocation&)> update_priority_fn_;

    // Heap for invocations that are now available at the current time, sorted by
    // priority.
    std::vector<EventInvocation> priority_heap_;

    // Heap for invocations that are delayed, will be moved to priority_heap_ when
    // ready.
    std::vector<EventInvocation> delay_heap_;
};
