#pragma once

#include <functional>
#include <queue>

// Events may have multiple roots, so len(gout) >= len(events)
// Expresses every event condition as a root-finding problem.
using RootsFn = std::function<void(double time, double y[], double gout[], double p[])>;

// Updates which event triggers hold when CVODE indicates a root found.
// The conditions array is to hold state about which conditions hold between root finds.
using CheckEventsFn = std::function<void(double time, double y[], int roots[], bool conditions[], bool eventout[])>;

// Generated for each event with a delay. Returns the events delay.
using GetDelayFn = std::function<double(double time, double y[], double p[])>;

// Generated for each event. Runs the events assignments.
using AssignFn = std::function<void(double time, double y[], double p[])>;

struct EventInfo {
    bool is_persistent;
    bool is_t0;
    bool is_from_trigger;
    int num_roots;
    int priority;
    GetDelayFn *get_delay_fn;
    AssignFn *assign_fn;
};

struct EventState {
    // conditions[i] = 1 means the condition has been triggered.
    // conditions[i] = 0 means the condition has not been triggered.
    // This is `num_roots` long.
    bool *conditions;
    bool *is_triggered;
};

struct Event {
    EventInfo info;
    EventState state;
};

struct EventInvocation {
    const Event &event;
    bool has_assignments;
    int *y_indices;
    double *y_assignments;
    int *p_indices;
    double *p_assignments;
};

struct QueuedEvent {
    double time;
    EventInvocation invocation;
};

class EventQueue {
public:
    EventQueue() = default;
    ~EventQueue() = default;
    EventQueue(const EventQueue&) = delete;
    EventQueue& operator=(const EventQueue&) = delete;

    // Returns the time for the next event, or `-1` if there is none.
    double GetNextEventTime();

    // Adds an invocation for an event that should run at the given time.
    void AddEventInvocation(double time, EventInvocation event_invocation);

    // Removes all EventInvocation associated with the given Event.
    void RemoveEvent(const Event &event);

    // Gets and removes an event from the queue if it is available at the given time.
    EventInvocation* GetEventInvocationIfAvailable(double time);

private:
    std::priority_queue<EventInvocation, std::vector<EventInvocation>> queue_;
};
