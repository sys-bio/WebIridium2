cmake_minimum_required(VERSION 3.22)

project(cvodeBindings LANGUAGES CXX)

include(FetchContent)

FetchContent_Declare(
    SUNDIALS
    GIT_REPOSITORY https://github.com/llnl/sundials
    GIT_TAG v7.7.0
)

set(SUNDIALS_PRECISION "double" CACHE STRING "" FORCE)
set(SUNDIALS_INDEX_SIZE 32 CACHE STRING "" FORCE)

set(SUNDIALS_ENABLE_ARKODE OFF CACHE BOOL "" FORCE)
set(SUNDIALS_ENABLE_CVODE ON CACHE BOOL "" FORCE)
set(SUNDIALS_ENABLE_CVODES OFF CACHE BOOL "" FORCE)
set(SUNDIALS_ENABLE_IDA OFF CACHE BOOL "" FORCE)
set(SUNDIALS_ENABLE_IDAS OFF CACHE BOOL "" FORCE)
set(SUNDIALS_ENABLE_KINSOL OFF CACHE BOOL "" FORCE)

set(SUNDIALS_ENABLE_C_EXAMPLES OFF CACHE BOOL "" FORCE)
set(SUNDIALS_ENABLE_CXX_EXAMPLES OFF CACHE BOOL "" FORCE)
set(SUNDIALS_ENABLE_CUDA_EXAMPLES OFF CACHE BOOL "" FORCE)
set(SUNDIALS_ENABLE_FORTRAN_EXAMPLES OFF CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(SUNDIALS)

file(GLOB_RECURSE sources CONFIGURE_DEPENDS src/bindings/*.cc)
file(GLOB_RECURSE headers CONFIGURE_DEPENDS src/bindings/*.h)

add_executable(cvodeBindings ${sources} ${headers})

target_compile_features(cvodeBindings PRIVATE cxx_std_20)
target_link_options(cvodeBindings PRIVATE
    "-lembind"
    "--emit-tsd=cvodeBindings.d.ts"
    "-sMODULARIZE"
    "-sALLOW_TABLE_GROWTH" # we need this so we can use `addFunction`
    "-sEXPORT_ES6"
    "-sEXPORTED_RUNTIME_METHODS=addFunction,removeFunction,wasmMemory"
)
target_link_libraries(cvodeBindings PUBLIC SUNDIALS::cvode)
