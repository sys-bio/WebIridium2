/**
 * Use this to make workers.
 * Mostly meant to be mocked.
 */

import FileSystemWorker from "@/workers/FileSystemWorker?worker";
import AntimonyWorker from "@/workers/AntimonyWorker?worker";
import LibSbmlSimWorker from "@/workers/LibSbmlSimWorker?worker";
import CopasiWorker from "@/workers/CopasiWorker?worker";
import IridiumSimulatorWorker from "@/workers/IridiumSimulatorWorker?worker";

export type WorkerType =
  | "fileSystem"
  | "copasi"
  | "antimony"
  | "iridiumSimulator"
  | "libsbmlsim";

export const createWorker = (type: WorkerType): Worker => {
  switch (type) {
    case "fileSystem":
      return new FileSystemWorker();
    case "copasi":
      return new CopasiWorker();
    case "antimony":
      return new AntimonyWorker();
    case "iridiumSimulator":
      return new IridiumSimulatorWorker();
    case "libsbmlsim":
      return new LibSbmlSimWorker();
  }
};
