#include "event.h"
#include <queue>
#include <stdexcept>

double EventQueue::GetNextInvocationTime() const {
    if (queue_.empty()) {
        return -1;
    } else {
        return queue_.top().time;
    }
}

void EventQueue::AddInvocation(EventInvocation event_invocation) {
    queue_.emplace(std::move(event_invocation));
}

void EventQueue::RemoveInvocationsOf(const EventInfo &event) {
    throw std::runtime_error("not implemented");
}

bool EventQueue::IsInvocationAvailable(double time) const {
    if (queue_.empty()) {
        return false;
    } else {
        return queue_.top().time <= time;
    }
}

EventInvocation EventQueue::PopInvocation() {
    EventInvocation got = std::move(queue_.top());
    queue_.pop();
    return got;
}

void EventQueue::Clear() {
    queue_ = std::priority_queue<
        EventInvocation,
        std::vector<EventInvocation>,
        EventQueue::CompareQueuedEvent
    >();
}
