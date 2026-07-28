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
    """Return pass_arr (list of 0/1) and names (list).
    Keeps the same ordering as the file (append order).
    """
    n = len(results)
    pass_arr = [0] * n
    names = []
    for i, r in enumerate(results):
        names.append(r.get("name", f"r{i}"))
        pass_arr[i] = 1 if r.get("pass") else 0
    return pass_arr, names


def plot_heatmap(pass_arr, names, figsize=(10, 10)):
    """Display an interactive grid: green=pass, red=fail, gray=padding."""
    n = len(pass_arr)
    if n == 0:
        print("No tests to display.")
        return

    # grid size (square-ish)
    cols = int(math.ceil(math.sqrt(n)))
    rows = int(math.ceil(n / cols))

    # Build grid values: 0=empty, 1=fail, 2=pass
    pass_grid = [[0 for _ in range(cols)] for _ in range(rows)]
    for i, val in enumerate(pass_arr):
        r = i // cols
        c = i % cols
        pass_grid[r][c] = 2 if val else 1

    fig = plt.figure(figsize=figsize)
    ax = fig.add_subplot(1, 1, 1)

    cmap = ListedColormap(["#CCCCCC", "#d73027", "#1a9850"])  # gray, red, green
    im = ax.imshow(pass_grid, interpolation='nearest', cmap=cmap, vmin=0, vmax=2, aspect='equal')

    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title(f"SBML Test Results: grid {rows}x{cols}")

    # grid lines
    for x in range(cols + 1):
        ax.axvline(x - 0.5, color='white', linewidth=0.5)
    for y in range(rows + 1):
        ax.axhline(y - 0.5, color='white', linewidth=0.5)

    # annotate failures with an 'x' when grid is reasonably small
    if rows <= 40 and cols <= 40:
        for r in range(rows):
            for c in range(cols):
                if pass_grid[r][c] == 1:
                    ax.text(c, r, 'x', ha='center', va='center', color='white', fontsize=6, weight='bold')

    # simple legend
    from matplotlib.patches import Patch
    legend_elems = [Patch(facecolor="#1a9850", edgecolor='k', label='Pass'), Patch(facecolor="#d73027", edgecolor='k', label='Fail')]
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

    pass_arr, names = build_matrices(results)
    # dynamic figsize based on grid size
    size = max(6, int(math.sqrt(len(results))) * 0.16 + 6)
    plot_heatmap(pass_arr, names, figsize=(size, size))
