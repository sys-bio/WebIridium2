import { describe, bench } from "vitest";
import { parse } from "../parse";
import {
  buildAntimonyDocument,
  buildAntimonyFromParseTree,
} from "../semantic/semantic";
import { compileToIridium } from "../compile/compile";
import { compile, createSimulator } from "../../index";

const modelFiles = import.meta.glob("./benchModels/*.ant", {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("parse", () => {
  for (const [name, code] of Object.entries(modelFiles)) {
    bench(`parse ${name}`, () => {
      parse(code as string);
    });
  }
});

describe("building", () => {
  for (const [name, code] of Object.entries(modelFiles)) {
    const parseTree = parse(code as string);
    bench(`build ${name}`, () => {
      buildAntimonyFromParseTree(parseTree);
    });
  }
});

describe("lowering", () => {
  for (const [name, code] of Object.entries(modelFiles)) {
    const document = buildAntimonyDocument(code as string);
    bench(`lower ${name}`, () => {
      compileToIridium(document);
    });
  }
});

describe("compiling", () => {
  for (const [name, code] of Object.entries(modelFiles)) {
    const iridium = compileToIridium(buildAntimonyDocument(code as string));
    bench(`compile ${name}`, async () => {
      await compile(iridium);
    });
  }
});

describe("fully compile", () => {
  for (const [name, code] of Object.entries(modelFiles)) {
    bench(`fully compile ${name}`, async () => {
      await compile(compileToIridium(buildAntimonyDocument(code as string)));
    });
  }
});

describe("load", async () => {
  for (const [name, code] of Object.entries(modelFiles)) {
    const model = await compile(
      compileToIridium(buildAntimonyDocument(code as string)),
    );
    bench(`load ${name}`, async () => {
      const simulator = await createSimulator();
      await simulator.setModel(model);
    });
  }
});

describe("compile and load", () => {
  for (const [name, code] of Object.entries(modelFiles)) {
    bench(`compile and load ${name}`, async () => {
      const model = await compile(
        compileToIridium(buildAntimonyDocument(code as string)),
      );
      const simulator = await createSimulator();
      await simulator.setModel(model);
    });
  }
});
