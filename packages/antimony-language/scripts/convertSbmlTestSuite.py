# Used for generating test data from sbml-test-suite.
# Add a folder to src/__tests__/ called `sbmlTestSuiteOriginal` with the cases/semantic from the sbml-test-suite
# repository. Then run this script and it will make a sibling folder called `sbmlTestSuite` with the results
# converted to something we can use.
# Make sure to delete the `sbmlTestSuiteOriginal` after.

from dataclasses import dataclass
from pathlib import Path
import re
import antimony
from generateData import TestParams


VER_REGEX = re.compile(r"l(\d+)v(\d+)")
SETTINGS_REGEX = re.compile(r"^(\w+)\s*:\s*(.*)$")
COMPONENT_TAGS_REGEX = re.compile(r"^\s*componentTags:\s*(.*)$", flags=re.MULTILINE)
TEST_TAGS_REGEX = re.compile(r"^\s*testTags:\s*(.*)$", flags=re.MULTILINE)


def parse_settings(settings_file: Path) -> TestParams:
    settings: dict[str, str] = {}
    for line in settings_file.read_text().splitlines():
        match = SETTINGS_REGEX.match(line.strip())
        if match:
            settings[match.group(1)] = match.group(2).strip()

    if "start" not in settings or "duration" not in settings or "steps" not in settings:
        raise ValueError(f"Missing required settings in {settings_file}")

    start = float(settings["start"])
    duration = float(settings["duration"])
    steps = int(settings["steps"])
    absolute = settings.get("absolute", "1e-12")
    relative = settings.get("relative", "1e-6")

    selections = [part.strip()
                  for part in settings.get("variables").split(",")
                  if part.strip()]
    amounts = [part.strip()
               for part in settings.get("amount").split(",")
               if part.strip()]

    return TestParams(
        start_time=float(start),
        end_time=float(start + duration),
        num_points=int(steps),
        absolute_tolerance=float(absolute),
        relative_tolerance=float(relative),
        selections=selections,
        amounts=amounts,
    )


def choose_model_file(case_dir: Path) -> Path | None:
    highest_version: tuple[int, int] = (0, 0)
    best_model: Path | None = None

    for model_file in case_dir.glob("*.xml"):
        match = VER_REGEX.search(model_file.name)
        if match:
            minor = int(match[2])
            major = int(match[1])
            if (major, minor) > highest_version:
                highest_version = (major, minor)
                best_model = model_file

    return best_model


def parse_tags(content: str) -> list[str]:
    component_match = COMPONENT_TAGS_REGEX.search(content)
    if component_match is None:
        component_tags = []
    else:
        component_tags = list([s.strip() for s in component_match.group(1).split(",")])

    test_match = TEST_TAGS_REGEX.search(content)
    if test_match is None:
        test_tags = []
    else:
        test_tags = list([s.strip() for s in test_match.group(1).split(",")])

    return component_tags + test_tags


def convert(case_dir: Path, out_dir: Path) -> None:
    m_file = case_dir / f"{case_dir.name}-model.m"
    m_contents = m_file.read_text()
    if "TimeCourse" not in m_contents:
        print(f"Skipped {case_dir.name} because not TimeCourse")
        return

    tags = parse_tags(m_contents)
    settings_file = case_dir / f"{case_dir.name}-settings.txt"
    model_file = choose_model_file(case_dir)
    settings = parse_settings(settings_file)

    antimony.clearPreviousLoads()
    if antimony.loadSBMLString(model_file.read_text()) < 0:
        raise RuntimeError(antimony.getLastError())

    antimony_code = antimony.getAntimonyString().strip()

    header = f"## start={settings.start_time} end={settings.end_time} points={settings.num_points} atol={settings.absolute_tolerance} rtol={settings.relative_tolerance}"
    header += f" selections={','.join(settings.selections)}"
    header += f" amounts={','.join(settings.amounts)}"
    header += f"\n## tags={",".join(tags)}"

    output_model_file = out_dir / f"{case_dir.name}.ant"
    output_model_file.write_text(f"{header}\n\n{antimony_code}\n")

    results_file = case_dir / f"{case_dir.name}-results.csv"
    output_results_file = out_dir / f"{case_dir.name}.csv"
    output_results_file.write_text(results_file.read_text())

    print(f"Wrote {output_model_file.name} and {output_results_file.name} for {case_dir.name}")


def main() -> None:
    root_dir = Path(__file__).resolve().parent.parent / "src" / "__tests__"
    og_dir = root_dir / "sbmlTestSuiteOriginal"
    out_dir = root_dir / "sbmlTestSuite"
    out_dir.mkdir(parents=True, exist_ok=True)

    if not og_dir.exists():
        raise FileNotFoundError(f"Missing input directory: {og_dir}")

    for case_dir in sorted(og_dir.iterdir()):
        if not case_dir.is_dir():
            continue

        try:
            convert(case_dir, out_dir)
        except Exception as exc:
            print(f"Failed to convert {case_dir.name}: {exc}")


if __name__ == "__main__":
    main()
