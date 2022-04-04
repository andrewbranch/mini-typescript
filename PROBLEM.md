# Exercise

Add `const` variable declarations. Currently, `var` is supported. `const` should behave the same, but trigger a checker error when reassigned.

```ts
// Already implemented:
var x: number = 0;
x = 1;

// Your task is to make this compile:
const y: number = 1;
y = 2; // This should be an error
```

**_Hint_**: It’s easier if you don’t make a new `Node` kind.

## Test

A simple test has already been added at [tests/const.ts](./tests/const.ts).

Running `npm test` (or `npm test -- --tests const` to run just that test) will generate snapshots of compiler data structures and output in `./baselines/local`. These baselines will have to be manually checked for correctness:

- `./baselines/local/const.errors.baseline` shows compiler errors. There should be two errors; one for each of the reassignments of `x`.
- `./baselines/local/const.js.baseline` should contain valid JavaScript - same as the test file, but with the type annotation removed. (The variable statements should be written as `const`s, not `var`s.)
- The other baseline shows the AST. If the other two baselines look right, it probably means this one is acceptable.

## Debugging

A VS Code launch configuration has been provided to debug the `const.ts` test. Set a breakpoint somewhere in the compiler, then press F5 to start debugging. [compile.ts](./src/compile.ts) is the main entrypoint of the compiler.
