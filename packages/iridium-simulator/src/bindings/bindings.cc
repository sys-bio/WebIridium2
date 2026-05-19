/*
 * Wrapper for CVODE.
 *
 * TODO: how are errors handled?
 */

#include <cstdlib>
#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "model.h"
#include "event.h"

EMSCRIPTEN_BINDINGS(cvodeBindings) {
    emscripten::register_vector<double>("DoubleVector");
    emscripten::register_type<Float64Array>("Float64Array");

    emscripten::class_<Model>("Model")
        .constructor<std::vector<double>, std::vector<double>, int, uintptr_t>(
            emscripten::allow_raw_pointers())
        .function("num_variables", &Model::num_variables)
        .function("ResetAllVariables", &Model::ResetAllVariables)
        .function("SetYValue", &Model::SetYValue)
        .function("SetPValue", &Model::SetPValue)
        .function("SimulateTimeCourse", &Model::SimulateTimeCourse);
}
