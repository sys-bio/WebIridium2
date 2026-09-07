#pragma once

#include "sundials/sundials_linearsolver.h"
#include "sundials/sundials_matrix.h"
#include "sundials/sundials_nonlinearsolver.h"

#include "model.h"
#include "sundials/sundials_nvector.h"

using IdaResFunc = int(
    double t,
    double y[],
    double ydot[],
    double residualout[],
    double p[],
    WasmBool events[]
);

class IdaModel : public Model {
public:
    IdaModel(
        std::vector<double> y,
        std::vector<double> p,
        int num_reactions,
        uintptr_t res,
        int algebraic_variables_start_index,
        uintptr_t update_p,
        uintptr_t convert_to_amounts,
        uintptr_t convert_from_amounts,
        uintptr_t convert_reset,
        std::optional<EventParams> event_params
    );

    virtual ~IdaModel();

    virtual void DumpStats() override;

protected:
    virtual void InitIntegrator(int num_roots) override;

    virtual void ReinitIntegrator() override;

    virtual void UpdateTolerances() override;

    virtual void Integrate(double target_time) override;

    virtual void UpdateAfterDiscontinuity() override;

private:
    void *ida_mem_;
    N_Vector ydot_;
    N_Vector id_;
    SUNMatrix matrix_;
    SUNNonlinearSolver non_lin_solver_;
    SUNLinearSolver linear_solver_;

    IdaResFunc *res_fn_;
    int algebraic_variables_start_index_;

    friend int delegating_ida_res(double t, N_Vector y, N_Vector ydot, N_Vector residualout, IdaModel *model);
    friend int delegating_ida_roots(double t, N_Vector y, N_Vector ydot, double *gout, IdaModel *model);
};
