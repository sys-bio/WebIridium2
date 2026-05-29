#include "event.h"
#include <queue>

double EventQueue::GetNextInvocationTime() const {
    if (queue_.empty()) {
        return -1;
    } else {
        return queue_.top().time;
    }
}

void EventQueue::AddInvocation(EventInvocation event_invocation) {
    queue_.push(std::move(event_invocation));
}

void EventQueue::RemoveInvocationsOf(const EventInfo &event) {
    // Is there a more efficient way to do this :(

    std::priority_queue<
        EventInvocation,
        std::vector<EventInvocation>,
        CompareEventInvocation
    > new_queue{};

    while (!queue_.empty()) {
        if (queue_.top().event_info != &event) {
            new_queue.push(
                std::move(const_cast<EventInvocation &>(queue_.top()))
            );
        }
        queue_.pop();
    }

    queue_ = std::move(new_queue);
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
        EventQueue::CompareEventInvocation
    >();
}
