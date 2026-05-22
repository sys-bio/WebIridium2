#pragma once

#include <functional>
#include <queue>
#include <vector>

// Events may have multiple roots, so len(gout) >= len(events)
// Expresses every event condition as a root-finding problem.
using RootsFn = std::function<void(double time, double y[], double gout[], double p[])>;

// Updates which event triggers hold when CVODE indicates a root found.
// The conditions array is to hold state about which conditions hold between root finds.
using CheckEventsFn = std::function<void(double time, int roots[], int conditions[], int eventout[])>;

// Generated for each event with a delay. Returns the events delay.
using GetDelayFn = std::function<double(double time, double y[], double p[])>;

// Generated for each event. Runs the events assignments.
using GetAssignmentsFn = std::function<void(double time, double y[], double p[])>;

struct EventInfo {
    bool is_persistent;
    bool is_t0;
    bool is_from_trigger;
    int num_roots;
    int priority;
    std::vector<int> y_indices;
    std::vector<int> p_indices;
    GetDelayFn *get_delay_fn;
    GetAssignmentsFn *get_assignments_fn;
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
    const Event *event;
    bool has_assignments;
    std::vector<int> y_values;
    std::vector<int> p_values;
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
    double GetNextEventTime() const;

    // Adds an invocation for an event that should run at the given time.
    void AddEventInvocation(double time, EventInvocation event_invocation);

    // Removes all EventInvocation associated with the given Event.
    void RemoveEvent(const Event &event);

    // Returns if an invocation is available to run at this time.
    bool IsInvocationAvailable(double time) const;

    // Pops and returns the most recent event invocation.
    EventInvocation PopEventInvocation();

private:
    class CompareQueuedEvent {
    public:
        bool operator()(const QueuedEvent &a, const QueuedEvent &b) {
            return a.time - b.time;
        }
    };

    std::priority_queue<
        QueuedEvent,
        std::vector<QueuedEvent>,
        CompareQueuedEvent
    > queue_;
};
