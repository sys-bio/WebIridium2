#include "sundials/sundials_context.h"
#include "sundials/sundials_types.h"

#include "context.h"

SUNContext ctx = nullptr;

SUNContext get_ctx() {
    if (ctx == nullptr) {
        // TODO: error handling?
        SUNContext_Create(SUN_COMM_NULL, &ctx);
    }

    return ctx;
}
