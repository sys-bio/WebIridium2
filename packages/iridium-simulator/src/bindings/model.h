#pragma once

#include <cstdint>
#include <optional>
#include <vector>

#include <emscripten/val.h>
#include "sundials/sundials_linearsolver.h"
#include "sundials/sundials_matrix.h"
#include "sundials/sundials_types.h"
#include "sundials/sundials_nvector.h"

#include "event.h"

EMSCRIPTEN_DECLARE_VAL_TYPE(Float64Array)

using RHSFunc = int(double t, double y[], double ydot[], double p[]);

struct UserData {
    RHSFunc *rhs;
    // Concatentating [ boundary species | parameters | reaction rates]
    // Everything after the parameters is just for recording. It should NOT be set.
    double *p;
    size_t p_len;

    RootsFn *roots;
};

struct EventParams {
    std::vector<EventInfo> event_info;
    uintptr_t roots_fn;
    uintptr_t check_events_fn;
};

class Model {
public:
    // Parameters:
    //  - y: Vector of values to integrate
    //  - p: Vector of values accessible to the RHS but not integrated
    //  - num_reactions: Number of reactions in the model
    //  - rhs: the RHS function
    Model(
        std::vector<double> y,
        std::vector<double> p,
        int num_reactions,
        uintptr_t rhs,
        std::optional<EventParams> event_params
    );

    ~Model();

    Model(const Model&) = delete;
    Model& operator=(const Model&) = delete;

    size_t num_variables() const {
        // plus 1 for the time
        return
            1 +
            original_y_.size() +
            original_p_.size() +
            num_reactions_;
    }

    // Reset all variables to their original values.
    void ResetAllVariables();

    void SetYValue(int i, double value);

    void SetPValue(int i, double value);

    void SetAbsoluteTolerance(double value);

    void SetRelativeTolerance(double value);

    // WARNING: The returned array will be invalidated the next time you call Simulate.
    Float64Array SimulateTimeCourse(double start_time, double end_time, int num_points);

private:
    void InitializeOutputArray(int num_points);

    void RecordToOutputArray(double time);

    SUNContext ctx_;
    void *cvode_mem_;
    SUNMatrix matrix_;
    SUNLinearSolver linear_solver_;

    std::vector<double> original_y_;
    std::vector<double> original_p_;

    N_Vector y_;
    UserData user_data_;
    const int num_reactions_;

    bool has_init_ = false;
    double *output_array_ = nullptr; // row-major
    int current_output_row_ = -1;

    std::optional<EventParams> event_params_;
    int num_roots_;

    // Should be set by the wrapper
    double abs_tol_ = 1;
    double rel_tol_ = 1;
};
