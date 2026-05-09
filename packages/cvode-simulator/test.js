import { createWrapper } from "./src/wrapper.ts";

const wrapper = await createWrapper();

wrapper.setModel({
  floatingSpecies: [
    { name: "A", initialValue: 0.5 },
    { name: "B", initialValue: 2 },
    { name: "C", initialValue: 3 },
  ],
  boundarySpecies: [],
  parameters: [
    { name: "k1", initialValue: 0.5 },
    { name: "k2", initialValue: 0.5 },
  ],
  rhsWasm: new ArrayBuffer(5),
});

const result = wrapper.simulate(0, 10, 30);

console.log(wrapper.resultToString(result));
