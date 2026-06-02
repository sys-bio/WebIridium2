cmake_minimum_required(VERSION 3.22)

project(cvodeBindings LANGUAGES CXX)

include(FetchContent)

FetchContent_Declare(
    SUNDIALS
    GIT_REPOSITORY https://github.com/llnl/sundials
    GIT_TAG v7.7.0
)

if(CMAKE_BUILD_TYPE STREQUAL "Release")
    set(SUNDIALS_LOGGING_LEVEL 0 CACHE STRING "" FORCE)
endif()

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
set(SUNDIALS_ENABLE_EXAMPLES_INSTALL OFF CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(SUNDIALS)

file(GLOB_RECURSE sources CONFIGURE_DEPENDS src/bindings/*.cc)
file(GLOB_RECURSE headers CONFIGURE_DEPENDS src/bindings/*.h)

set(target_name "cvodeBindings")

add_executable(${target_name} ${sources} ${headers})

target_compile_features(${target_name} PUBLIC cxx_std_20) 
target_link_options(${target_name} PRIVATE
    "-lembind"
    "--emit-tsd=${target_name}.d.ts"
    "-sMODULARIZE"
    "-sALLOW_TABLE_GROWTH" # we need this so we can use `addFunction`
    "-sALLOW_MEMORY_GROWTH" # for super large models
    "-sEXPORT_ES6"
    "-sENVIRONMENT=web,worker,node"
    "-sEXPORTED_RUNTIME_METHODS=addFunction,removeFunction,wasmMemory"
)

if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    target_link_options(${target_name} PRIVATE
        "-sASSERTIONS"
        "-sDISABLE_EXCEPTION_CATCHING=0"
        "-g3"
    )
endif()

target_link_libraries(${target_name} PUBLIC SUNDIALS::cvode)

execute_process(COMMAND em++ --cflags
OUTPUT_VARIABLE EM_CFLAGS)
set_target_properties(cvodeBindings PROPERTIES COMPILE_FLAGS "${EM_CFLAGS}")
