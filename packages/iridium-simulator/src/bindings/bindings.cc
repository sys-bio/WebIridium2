/*
 * Wrapper for CVODE.
 *
 * TODO: how are errors handled?
 */

#include <cstdint>
#include <cstdlib>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <sys/types.h>

#include "model.h"
#include "event.h"

EMSCRIPTEN_BINDINGS(cvodeBindings) {
    emscripten::class_<Model>("Model")
        .constructor<std::vector<double>, std::vector<double>, int, uintptr_t, uintptr_t, uintptr_t, std::optional<EventParams>>(
            emscripten::allow_raw_pointers())
        .function("num_variables", &Model::num_variables)
        .function("ResetState", &Model::ResetState)
        .function("SetYValue", &Model::SetYValue)
        .function("SetPValue", &Model::SetPValue)
        .function("SetAbsoluteTolerance", &Model::SetAbsoluteTolerance)
        .function("SetRelativeTolerance", &Model::SetRelativeTolerance)
        .function("SimulateTimeCourse", &Model::SimulateTimeCourse)
        .function("DumpStats", &Model::DumpStats);
    
    emscripten::value_object<EventInfo>("EventInfo")
        .field("is_for_piecewise", &EventInfo::is_for_piecewise)
        .field("is_persistent", &EventInfo::is_persistent)
        .field("is_t0", &EventInfo::is_t0)
        .field("is_from_trigger", &EventInfo::is_from_trigger)
        .field("num_roots", &EventInfo::num_roots)
        .field("y_indices", &EventInfo::y_indices)
        .field("p_indices", &EventInfo::p_indices)
        .field("get_priority_fn", &EventInfo::get_priority_fn)
        .field("get_delay_fn", &EventInfo::get_delay_fn)
        .field("get_assignments_fn", &EventInfo::get_assignments_fn);

    emscripten::value_object<EventParams>("EventParams")
        .field("event_info", &EventParams::event_info)
        .field("roots_fn", &EventParams::roots_fn)
        .field("check_roots_fn", &EventParams::check_roots_fn)
        .field("update_conditions_fn", &EventParams::update_conditions_fn);

    emscripten::register_vector<double>("DoubleVector");
    emscripten::register_vector<int>("IntVector");
    emscripten::register_vector<EventInfo>("EventInfoVector");
    emscripten::register_type<Float64Array>("Float64Array");
    emscripten::register_optional<EventParams>();
}
