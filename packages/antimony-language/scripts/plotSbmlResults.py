"""
Read sbml_results.jsonl (one JSON object per line: {name, tags, pass, error, timestamp})
and display a pass/fail grid using matplotlib.

Usage: python3 plot_sbml_results.py /path/to/simResults
If no path provided, assumes ../packages/antimony-language/simResults relative to repo root.
"""

import sys
import os
import json
import math
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap


def read_results(path):
    """Read JSONL results file and return list of parsed objects."""
    results = []
    if not os.path.exists(path):
        raise FileNotFoundError(f"Results file not found: {path}")
    with open(path, "r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                results.append(json.loads(line))
            except Exception:
                # skip malformed lines but print a short warning
                print("Warning: failed to parse a line in results file (skipping)")
    return results


def build_matrices(results):
    max_number = -1
    for i, r in enumerate(results):
        number = r.get("number")
        max_number = max(max_number, number)

    pass_arr = [0] * max_number
    for r in results:
        pass_status = r.get("pass")
        number = r.get("number")
        pass_arr[number - 1] = (1 if pass_status == "pass" else
                      -1 if pass_status == "fail" else
                      0)
    return pass_arr, max_number


def plot_heatmap(pass_arr, max_number, figsize=(10, 10)):
    """Display an interactive grid: green=pass, red=fail, gray=padding."""
    # grid size (square-ish)
    cols = int(math.ceil(math.sqrt(max_number)))
    rows = int(math.ceil(max_number / cols))

    # Build grid values: 0=empty, 1=fail, 2=pass
    pass_grid = [[0 for _ in range(cols)] for _ in range(rows)]
    for i, val in enumerate(pass_arr):
        r = i // cols
        c = i % cols
        pass_grid[r][c] = val

    fig = plt.figure(figsize=figsize)
    ax = fig.add_subplot(1, 1, 1)

    cmap = ListedColormap(["#d73027", "#CCCCCC", "#1a9850"])  # red, grey, green
    im = ax.imshow(pass_grid, interpolation='nearest', cmap=cmap, vmin=-1, vmax=1, aspect='equal')

    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title(f"SBML Test Results: grid {rows}x{cols}")

    # grid lines
    for x in range(cols + 1):
        ax.axvline(x - 0.5, color='white', linewidth=0.5)
    for y in range(rows + 1):
        ax.axhline(y - 0.5, color='white', linewidth=0.5)

    # annotate failures with an 'x' when grid is reasonably small
    for r in range(rows):
        for c in range(cols):
            ax.text(c, r, str(c + r * cols + 1), ha='center', va='center', color='white', fontsize=6, weight='bold')

    # simple legend
    from matplotlib.patches import Patch

    legend_elems = [Patch(facecolor="#1a9850", edgecolor='k', label='Pass'), Patch(facecolor="#d73027", edgecolor='k', label='Fail'),
                    Patch(facecolor="#CCCCCC", edgecolor="k", label="Skip")]
    ax.legend(handles=legend_elems, loc='upper right', fontsize=8)

    plt.tight_layout(rect=[0, 0, 1, 0.96])
    plt.show()


if __name__ == "__main__":
    default_dir = os.path.join(os.path.dirname(__file__), "..", "simResults")
    default_dir = os.path.abspath(default_dir)
    sim_dir = sys.argv[1] if len(sys.argv) > 1 else default_dir

    results_file = os.path.join(sim_dir, "sbml_results.jsonl")
    try:
        results = read_results(results_file)
    except FileNotFoundError:
        print(f"Results file not found: {results_file}")
        sys.exit(1)

    if not results:
        print("No results found in file.")
        sys.exit(1)

    pass_arr, max_number = build_matrices(results)
    # dynamic figsize based on grid size
    size = max(6, int(math.sqrt(len(results))) * 0.16 + 6)
    plot_heatmap(pass_arr, max_number, figsize=(size, size))
