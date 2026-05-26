/**
 * Atoms for the current simulator instance and its name.
 */

import { atom } from "jotai";

import { type Simulator } from "@/features/simulation/Simulator";
import { CopasiSimulator } from "@/features/simulation/CopasiSimulator";
import { LibSbmlSimSimulator } from "@/features/simulation/LibSbmlSimSimulator";
import { RoadrunnerServerSimulator } from "@/features/simulation/RoadrunnerServerSimulator";
import { IridiumSimulator } from "@/features/simulation/IridiumSimulator";

import { editorContentAtom, updateEditorContentAtom } from "./model";
import { parameterScanOptionsAtom } from "./settings";

export const SIMULATOR_CONSTRUCTORS: Record<string, { new (): Simulator }> = {
  COPASI: CopasiSimulator,
  "Iridium (Preview)": IridiumSimulator,
  "RoadRunner (Server)": RoadrunnerServerSimulator,
  libsbmlsim: LibSbmlSimSimulator,
};
export const SIMULATOR_LIST = Object.keys(SIMULATOR_CONSTRUCTORS);

export const getSimulatorName = (simulator: Simulator): string => {
  for (const [name, constructor] of Object.entries(SIMULATOR_CONSTRUCTORS)) {
    if (simulator instanceof constructor) {
      return name;
    }
  }

  throw new Error(`Unknown simulator: ${simulator.constructor.name}`);
};

const _simulatorNameAtom = atom("Iridium (Preview)");

export const simulatorAtom = atom((get) => {
  return new SIMULATOR_CONSTRUCTORS[get(_simulatorNameAtom)]();
});

export const updateSimulatorAtom = atom(null, (get, set, name: string) => {
  const currentSimulator = get(simulatorAtom);
  if (getSimulatorName(currentSimulator) !== name) {
    set(_simulatorNameAtom, name);

    // reset mode to time course, since some simulators don't support steady state
    set(parameterScanOptionsAtom, {
      ...get(parameterScanOptionsAtom),
      mode: "timeCourse",
    });

    // force model reload
    void set(updateEditorContentAtom, {
      content: get(editorContentAtom),
      skipDebounce: true,
    });
  }
});
