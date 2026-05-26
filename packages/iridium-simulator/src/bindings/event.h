#pragma once

#include <queue>
#include <vector>

// Events may have multiple roots, so len(gout) >= len(events)
// Expresses every event condition as a root-finding problem.
using RootsFn = void(double time, double y[], double gout[], double p[]);

// Updates which event triggers hold when CVODE indicates a root found.
// The conditions array is to hold state about which conditions hold between root finds.
using CheckEventsFn = void(double time, int roots[], int conditions[], int eventout[]);

// Generated for each event with a delay. Returns the events delay.
using GetDelayFn = double(double time, double y[], double p[]);

// Generated for each event. Runs the events assignments.
using GetAssignmentsFn = void(
    double time,
    double y[],
    double p[],
    double yout[],
    double pout[]
);

struct EventInfo {
    bool is_persistent;
    bool is_t0;
    bool is_from_trigger;
    int num_roots;
    int priority;
    std::vector<int> y_indices;
    std::vector<int> p_indices;
    uintptr_t get_delay_fn;
    uintptr_t get_assignments_fn;
};

struct EventInvocation {
    const EventInfo *event_info;
    double time;
    bool has_assignments;
    std::vector<int> y_values;
    std::vector<int> p_values;
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
    void RemoveInvocationsOf(const EventInfo &event_info);

    // Returns if an invocation is available to run at this time.
    bool IsInvocationAvailable(double time) const;

    // Pops and returns the most recent event invocation.
    EventInvocation PopEventInvocation();

private:
    class CompareQueuedEvent {
    public:
        bool operator()(const EventInvocation &a, const EventInvocation &b) {
            if (a.time == b.time) {
                return a.event_info->priority > b.event_info->priority;
            } else {
                return a.time < b.time;
            }
        }
    };

    std::priority_queue<
        EventInvocation,
        std::vector<EventInvocation>,
        CompareQueuedEvent
    > queue_;
};
