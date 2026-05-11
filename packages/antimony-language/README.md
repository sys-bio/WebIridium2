This provides tools for analysis of Antimony source code.

# Generating Grammar

Use `npm run --workspace antimony-language antlr4ts`.

ANTLR will generate TypeScript that does not match our TypeScript config. To fix this, just
add `// @ts-nocheck` to the top of every generated file in `packages/antimony-language/src/generated/`.

Here is a command that will do that: `sed -i '' '1s;^;// @ts-nocheck\n;' packages/antimony-language/src/generated/*.ts`
