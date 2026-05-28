import {
  createCvodeWrapper,
  type ModelSpec,
  type CvodeWrapper,
} from "iridium-simulator";
import type { Action, ErrorResult, Result } from "@/features/taskPool";
import type { SimulateTimeCourseOptions } from "@/features/simulation/Simulator";
import { compile } from "iridium-simulator";
import { errorToDisplayString } from "@/features/formatUtils";

export type IridiumCompileAction = Action<"compile", string>;
export type IridiumCompileResult = Result<ModelSpec>;

export type IridiumTimeCourseAction = Action<
  "timeCourse",
  SimulateTimeCourseOptions
>;
export type IridiumTimeCourseResult = Result<Float64Array>;

export type IridiumSimulatorAction =
  | IridiumCompileAction
  | IridiumTimeCourseAction;
export type IridiumSimulatorResult =
  | IridiumCompileResult
  | IridiumTimeCourseResult;

let wrapperPromise: Promise<CvodeWrapper> | undefined;

const ensureWrapper = (): Promise<CvodeWrapper> => {
  if (!wrapperPromise) {
    wrapperPromise = createCvodeWrapper();
    return wrapperPromise;
  } else {
    return wrapperPromise;
  }
};

const simulateTimeCourse = async ({
  parameters,
  parameterScanOptions,
  variableValues,
}: IridiumTimeCourseAction["payload"]): Promise<
  IridiumTimeCourseResult["data"]
> => {
  const wrapper = await ensureWrapper();

  if (parameters.resetInitialConditions) {
    wrapper.resetState();
  }

  if (parameterScanOptions?.varyingParameter) {
    wrapper.setVariable(
      parameterScanOptions.varyingParameter,
      parameterScanOptions.varyingParameterValue,
    );
  }

  for (const [name, value] of Object.entries(variableValues)) {
    if (name !== parameterScanOptions?.varyingParameter) {
      wrapper.setVariable(name, value);
    }
  }

  // TODO: implement resetInitialConditions

  const array = wrapper.simulate(
    parameters.startTime,
    parameters.endTime,
    parameters.numberOfPoints,
  );

  return array;
};

const wrapResult = <T>(action: Action, data: T): Result<T> => ({
  id: action.id,
  data: data,
});

self.onmessage = async (e: MessageEvent<unknown>) => {
  try {
    const action = e.data as IridiumSimulatorAction;
    if (action.internalState) {
      await (await ensureWrapper()).setModel(action.internalState as ModelSpec);
    }

    switch (action.type) {
      case "compile": {
        const spec = await compile(action.payload);
        if (!spec) throw new Error("Unable to compile model.");

        self.postMessage(wrapResult(action, spec));

        break;
      }

      case "timeCourse": {
        const result = wrapResult(
          action,
          await simulateTimeCourse(action.payload),
        );
        self.postMessage(result, { transfer: [result.data.buffer] });
        break;
      }

      default:
        throw new Error("unknown action type");
    }
  } catch (err) {
    self.postMessage({
      id: (e.data as IridiumSimulatorAction).id,
      errorMessage: errorToDisplayString(err),
    } satisfies ErrorResult);

    throw err;
  }
};
