# Building

To build the bindings, navigate into the package: `cd packages/iridium-simulator`.

You will need CMake and Emscripten. You also need a TypeScript less than version 6 on your PATH.

Run these commands:

- `emcmake cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug`
- `cmake --build build`

This will build the bindings into `./build`. After this, you just need to run `cmake --build build` to rebuild.

If you are building for release, change the last flag in the `emcmake` command to `-DCMAKE_BUILD_TYPE=Release`.

If your IDE is flagging errors, you might also also have to add this flag to the `emcmake` command: `-DCMAKE_EXPORT_COMPILE_COMMANDS=on`.
This adds `compile_commands.json` to the build directory. It will help your IDE identify that you are using Emscripten plus some other stuff.
You will probably get some errors in your IDE still, but you can just ignore them, as long as everything still compiles.

# Testing

You have to use `npm run test-sim`.
