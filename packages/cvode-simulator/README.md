# Building

To build the bindings, navigate into the package: `cd packages/cvode-simulator`.

You will need CMake and Emscripten. You also need a TypeScript less than version 6 on your PATH.

Run these commands:

- `emcmake cmake -S . -B build`
- `cmake --build build`

This will build the bindings into `./build`. After this, you just need to run `cmake --build build` to rebuild.

If you are building for release, add this flag to the `emcmake` command: `-DCMAKE_BUILD_TYPE=Release`.

If your IDE is flagging errors, you might also also have to add this flag to the `emcmake` command: `-DCMAKE_EXPORT_COMPILE_COMMANDS=on`.
This adds `compile_commands.json` to the build directory. It will help your IDE identify that you are using Emscripten plus some other stuff.
You will probably get some errors in your IDE still, but you can just ignore them, as long as everything still compiles.
