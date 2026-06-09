#include "event.h"
#include <algorithm>
#include <functional>
#include <iostream>

EventQueue::EventQueue(std::function<void(EventInvocation&)> update_priority_fn)
    : update_priority_fn_(update_priority_fn) {}

double EventQueue::GetNextInvocationTime() const {
    if (!priority_heap_.empty()) {
        return priority_heap_.front().time;
    } else if (!delay_heap_.empty()) {
        return delay_heap_.front().time;
    } else {
        return -1;
    }
}

void EventQueue::AddInvocation(EventInvocation invocation) {
    if (invocation.time <= time_) {
        update_priority_fn_(invocation);
        priority_heap_.push_back(invocation);
        std::push_heap(
            priority_heap_.begin(),
            priority_heap_.end(),
            ComparePriority()
        );
    } else {
        delay_heap_.push_back(invocation);
        std::push_heap(
            delay_heap_.begin(),
            delay_heap_.end(),
            CompareDelay()
        );
    }
}

void EventQueue::RemoveInvocationsOf(const EventInfo &event) {
    auto new_delay_end = std::remove_if(
        delay_heap_.begin(),
        delay_heap_.end(),
        [&event](auto &invocation) {
            return invocation.event_info == &event;
        }
    );

    delay_heap_.erase(new_delay_end, delay_heap_.end());
    std::make_heap(delay_heap_.begin(), delay_heap_.end(), CompareDelay());

    auto new_priority_end = std::remove_if(
        priority_heap_.begin(),
        priority_heap_.end(),
        [&event](auto &invocation) {
            return invocation.event_info == &event;
        }
    );

    priority_heap_.erase(new_priority_end, priority_heap_.end());
    std::make_heap(priority_heap_.begin(), priority_heap_.end(), ComparePriority());
}

void EventQueue::AdvanceTime(double time) {
    time_ = time;
    while (!delay_heap_.empty() && delay_heap_.front().time <= time) {
        std::pop_heap(delay_heap_.begin(), delay_heap_.end(), CompareDelay());
        priority_heap_.push_back(std::move(delay_heap_.back()));
        update_priority_fn_(priority_heap_.back());
        std::push_heap(priority_heap_.begin(), priority_heap_.end(), ComparePriority());
        delay_heap_.pop_back();
    }
}

bool EventQueue::IsInvocationAvailable() const {
    // when we advance the time, we move any available invocations into the priority_heap
    return !priority_heap_.empty();
}

EventInvocation EventQueue::PopInvocation() {
    std::pop_heap(
        priority_heap_.begin(),
        priority_heap_.end(),
        ComparePriority()
    );

    EventInvocation got = std::move(priority_heap_.back());

    priority_heap_.pop_back();

    return got;
}

void EventQueue::UpdatePriorities() {
    for (EventInvocation &invocation : priority_heap_) {
        update_priority_fn_(invocation);
    }

    std::make_heap(priority_heap_.begin(), priority_heap_.end(), ComparePriority());
}

void EventQueue::Reset() {
    time_ = 0.0;
    delay_heap_.clear();
    priority_heap_.clear();
}
