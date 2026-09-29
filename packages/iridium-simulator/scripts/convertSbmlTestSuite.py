# Used to generate antimony files for the sbmltestsuite.

from dataclasses import dataclass
from pathlib import Path
import re
import antimony


VER_REGEX = re.compile(r"l(\d+)v(\d+)")
SETTINGS_REGEX = re.compile(r"^(\w+)\s*:\s*(.*)$")
COMPONENT_TAGS_REGEX = re.compile(r"^\s*componentTags:\s*(.*)$", flags=re.MULTILINE)
TEST_TAGS_REGEX = re.compile(r"^\s*testTags:\s*(.*)$", flags=re.MULTILINE)


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


def convert(case_dir: Path) -> None:
    existing_antimony = next(case_dir.glob("*-antimony.txt"), None)
    output_model_file = case_dir / f"{case_dir.name}.ant"

    if existing_antimony is not None:
        antimony_code = existing_antimony.read_text()
    else:
        m_file = case_dir / f"{case_dir.name}-model.m"
        model_file = choose_model_file(case_dir)
        if not model_file:
            raise RuntimeError("Missing model.")

        antimony.clearPreviousLoads()
        if antimony.loadSBMLString(model_file.read_text()) < 0:
            raise RuntimeError(antimony.getLastError())

        antimony_code = antimony.getAntimonyString().strip()
    
    output_model_file.write_text(antimony_code)

    print(f"Wrote {output_model_file.name} for {case_dir.name}")


def main() -> None:
    root_dir = Path(__file__).resolve().parent.parent / "src" / "__tests__" / "sbmlTestSuite" / "semantic"

    if not root_dir.exists():
        raise FileNotFoundError(f"Missing input directory: {root_dir}")

    for case_dir in sorted(root_dir.iterdir()):
        if not case_dir.is_dir():
            continue

        try:
            convert(case_dir)
        except Exception as exc:
            print(f"Failed to convert {case_dir.name}: {exc}")


if __name__ == "__main__":
    main()
