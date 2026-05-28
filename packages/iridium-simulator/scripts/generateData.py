# Run without any arguments to generate data for every test.
# Run with <substring> to generate data only for tests with names containing the substring.

from typing import Any
from dataclasses import dataclass
from pathlib import Path
import re
import sys

import roadrunner
import antimony
import numpy as np
from numpy.typing import NDArray


test_dir = (Path(__file__).parent / Path("../src/__tests__/results/")).resolve()


@dataclass
class TestParams:
    start_time: float
    end_time: float
    num_points: int
    absolute_tolerance: float
    relative_tolerance: float
    selections: list[str] | None


param_regex = re.compile(r"\b([A-Za-z]+)=([A-Za-z0-9,-\[\]]+)\b")

def parse_test_params(code: str) -> TestParams:
    first_line = code.splitlines()[0]

    if not first_line.startswith("##"):
        raise Exception("Needs to start with ## then list parameters")

    params: dict[str, str] = {}

    for match in param_regex.finditer(code):
        params[match.group(1)] = match.group(2)

    selections = None
    if "selections" in params:
        selections = ["time"] + params["selections"].split(",")

    return TestParams(start_time=float(params["start"]),
                      end_time=float(params["end"]),
                      num_points=int(params["points"]),
                      absolute_tolerance=float(params["atol"]),
                      relative_tolerance=float(params["rtol"]),
                      selections=selections)


def simulate(code: str, params: TestParams) -> Any:
    antimony.clearPreviousLoads()

    if antimony.loadAntimonyString(code) < 0:
        raise Exception(antimony.getLastError())

    sbml = antimony.getSBMLString()
    rr = roadrunner.RoadRunner(sbml)
    rr.integrator.setValue("absolute_tolerance", params.absolute_tolerance)
    rr.integrator.setValue("relative_tolerance", params.relative_tolerance)
    if params.selections:
        rr.selections = params.selections
    return rr.simulate(params.start_time, params.end_time, params.num_points)


def fix_name(name: str) -> str:
    if name == "time":
        return "Time"
    elif name.startswith("["):
        return name.removeprefix("[").removesuffix("]")
    else:
        return name


def try_generate_results(file: Path) -> None:
    try:
        code = file.read_text()
        params = parse_test_params(code)
        result = simulate(code, params)
        result_file = file.parent / Path(file.name.removesuffix(".ant") + ".csv")

        print(f"Simulating {file.name}")

        with result_file.open(mode="w") as f:
            f.write(",".join(map(fix_name, result.colnames)))
            f.write("\n")
            for row in result:
                f.write(",".join(map(str, row)) + "\n")

        print(f"\x1b[32mWrote to {result_file.name}\x1b[0m")

    except Exception as e:
        print(f"\x1b[31mFailed to generate results for {file}:\x1b[0m {e}")


def main(filter: str = ""):
    if filter:
        print(f"Using filter: {filter}")

    for test_file in test_dir.iterdir():
        if test_file.is_file() and test_file.name.endswith(".ant"):
            if filter in test_file.name:
                try_generate_results(test_file)
            else:
                print(f"Skipped {test_file.name}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1])
    else:
        main()
