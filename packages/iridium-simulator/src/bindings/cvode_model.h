#include "sundials/sundials_linearsolver.h"
#include "sundials/sundials_matrix.h"
#include "sundials/sundials_nonlinearsolver.h"

#include "model.h"

using RhsFunc = int(double t, double y[], double ydot[], double p[], WasmBool events[]);

class CvodeModel : public Model {
public:
    CvodeModel(
        std::vector<double> y,
        std::vector<double> p,
        int num_reactions,
        uintptr_t rhs,
        uintptr_t update_p,
        uintptr_t convert_to_amounts,
        uintptr_t convert_from_amounts,
        uintptr_t convert_reset,
        std::optional<EventParams> event_params
    );

    virtual ~CvodeModel();

    virtual void DumpStats() override;

protected:
    virtual void InitIntegrator(int num_roots) override;

    virtual void ReinitIntegrator() override;

    virtual void UpdateTolerances() override;

    virtual void Integrate(double target_time) override;

private:
    void *cvode_mem_;
    SUNMatrix matrix_;
    SUNNonlinearSolver non_lin_solver_;
    SUNLinearSolver linear_solver_;

    RhsFunc *rhs_fn_;

    friend int delegating_cvode_rhs(double t, N_Vector y, N_Vector ydot, CvodeModel *model);
    friend int delegating_cvode_roots(double t, N_Vector y, double *gout, CvodeModel *model);
};
