#include "event.h"
#include <stdexcept>

double EventQueue::GetNextEventTime() const {
    if (queue_.empty()) {
        return -1;
    } else {
        return queue_.top().time;
    }
}

void EventQueue::AddEventInvocation(
    double time,
    EventInvocation event_invocation
) {
    queue_.emplace(time, event_invocation);
}

void EventQueue::RemoveEvent(const EventInfo &event) {
    throw std::runtime_error("not implemented");
}

bool EventQueue::IsInvocationAvailable(double time) const {
    if (queue_.empty()) {
        return false;
    } else {
        return queue_.top().time <= time;
    }
}

EventInvocation EventQueue::PopEventInvocation() {
    const QueuedEvent &got = queue_.top();
    queue_.pop();
    return got.invocation;
}
