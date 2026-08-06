import json
import sys
from collections import defaultdict
from pathlib import Path


def compare_test_files(file_paths):
    # Mapping: test_num -> { filename: {"status": status, "error": error_msg} }
    test_results = defaultdict(dict)
    file_names = []

    for file_path in file_paths:
        path = Path(file_path)
        file_names.append(path.name)

        if not path.exists():
            print(f"Error: File '{file_path}' not found.", file=sys.stderr)
            continue

        with open(path, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    test_num = data.get("number")
                    status = data.get("pass")
                    
                    # Capture potential error, failure message, or reason fields
                    error_msg = (
                        data.get("error") 
                        or data.get("message") 
                        or data.get("reason")
                    )

                    if test_num is not None:
                        test_results[test_num][path.name] = {
                            "status": status,
                            "error": error_msg
                        }
                except json.JSONDecodeError:
                    print(
                        f"Warning: Skipping invalid JSON on line {line_num} in {path.name}",
                        file=sys.stderr,
                    )

    # Identify discrepancies ONLY (status mismatch or missing test across files)
    discrepancies = []
    total_files = len(file_names)

    for test_num in sorted(test_results.keys()):
        file_data_map = test_results[test_num]
        statuses = {info["status"] for info in file_data_map.values()}

        status_mismatch = len(statuses) > 1
        missing_in_file = len(file_data_map) < total_files

        # Trigger ONLY on discrepancies (mismatched statuses or missing files)
        if status_mismatch or missing_in_file:
            discrepancies.append((test_num, file_data_map))

    return file_names, discrepancies


def print_report(file_names, discrepancies):
    print("=" * 60)
    print(" TEST DISCREPANCY REPORT")
    print("=" * 60)
    print(f"Files Compared ({len(file_names)}): {', '.join(file_names)}\n")

    if not discrepancies:
        print("✓ No discrepancies found across files.")
        return

    print(f"Found {len(discrepancies)} test(s) with discrepancies:\n")

    for test_num, file_map in discrepancies:
        print(f"--- Test #{test_num} ---")
        for fname in file_names:
            if fname in file_map:
                status = file_map[fname]["status"]
                err = file_map[fname]["error"]
                print(f"  [{fname}] Status: {status}")
                if err:
                    # Prints the error message cleanly on a new indented line
                    print(f"    ↳ Error: {err}")
            else:
                print(f"  [{fname}] MISSING")
        print()

    print("=" * 60)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python compare_tests.py <file1.jsonl> <file2.jsonl> [file3.jsonl ...]")
        sys.exit(1)

    input_files = sys.argv[1:]
    files, discrepancies = compare_test_files(input_files)
    print_report(files, discrepancies)
