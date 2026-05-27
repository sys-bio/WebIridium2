from pathlib import Path
import sys
import numpy as np
import matplotlib.pyplot as plt

base_dir = Path(__file__).parent
expected_dir = (base_dir / "../src/__tests__/results").resolve()
our_dir = (base_dir / "../iridiumResults").resolve()


def read_csv(path: Path):
    if not path.exists():
        raise FileNotFoundError(path)
    with path.open() as f:
        header = f.readline().strip().split(",")
    data = np.loadtxt(path, delimiter=",", skiprows=1)
    # If single row, ensure 2D
    if data.ndim == 1:
        data = data.reshape(1, -1)
    return header, data


def main(filter_str: str):
    # find matching expected CSV files by simple contains match (case-insensitive)
    candidates = []
    for p in expected_dir.glob("*.csv"):
        if filter_str.lower() in p.stem.lower():
            candidates.append(p)

    if len(candidates) == 0:
        print(f"No matches for filter '{filter_str}' in {expected_dir}")
        sys.exit(1)
    if len(candidates) > 1:
        print(f"Multiple matches for filter '{filter_str}':")
        for p in candidates:
            print(f" - {p.stem}")
        print("Run again with a more specific filter or one of the exact names above.")
        sys.exit(1)

    expected_csv = candidates[0]

    model_name = expected_csv.stem

    # prefer our file named <model>.our.csv, fall back to <model>.csv
    our_csv_candidates = [our_dir / f"{model_name}.our.csv", our_dir / f"{model_name}.csv"]
    our_csv = None
    for c in our_csv_candidates:
        if c.exists():
            our_csv = c
            break
    if our_csv is None:
        print(f"No corresponding our-results CSV found for '{model_name}' in {our_dir}")
        sys.exit(1)

    header_exp, data_exp = read_csv(expected_csv)
    header_our, data_our = read_csv(our_csv)

    # Align columns by header intersection (only columns present in both files)
    common_cols = [h for h in header_exp if h in header_our]
    if len(common_cols) <= 1:
        raise Exception("No common columns between expected and our CSVs")

    # find time index in both files (case-insensitive match for 'time')
    def find_time_idx(headers):
        for i, h in enumerate(headers):
            if h.lower() == "time":
                return i
        return None

    time_idx_exp = find_time_idx(header_exp)
    time_idx_our = find_time_idx(header_our)
    if time_idx_exp is None or time_idx_our is None:
        raise Exception("No Time column in one of the CSVs")

    time_exp = data_exp[:, time_idx_exp]
    time_our = data_our[:, time_idx_our]

    # columns to plot (exclude Time) — use intersection order from expected file
    plot_cols = [c for c in common_cols if c.lower() != "time"]
    nvars = len(plot_cols)

    # Create three stacked plots: expected, our, difference. All variables plotted together.
    # Use a reasonable fixed figure size so the window stays a manageable size
    fig, axes = plt.subplots(3, 1, figsize=(12, 8), sharex=True)

    cmap = plt.get_cmap("tab10")
    for idx, col_name in enumerate(plot_cols):
        exp_col_idx = header_exp.index(col_name)
        our_col_idx = header_our.index(col_name)
        exp_vals = data_exp[:, exp_col_idx]
        our_vals_raw = data_our[:, our_col_idx]

        # If time axes differ, interpolate our values onto expected time
        if time_exp.shape != time_our.shape or not np.allclose(time_exp, time_our):
            try:
                our_vals = np.interp(time_exp, time_our, our_vals_raw)
            except Exception:
                our_vals = np.full_like(exp_vals, np.nan)
        else:
            our_vals = our_vals_raw

        diff = our_vals - exp_vals
        color = cmap(idx % 10)

        axes[0].plot(time_exp, exp_vals, label=col_name, color=color)
        axes[1].plot(time_exp, our_vals, label=col_name, color=color)
        axes[2].plot(time_exp, diff, label=col_name, color=color, linestyle="--")

    axes[0].set_title("RoadRunner")
    axes[1].set_title("Iridium")
    axes[2].set_title("Difference")
    try:
        fig.canvas.manager.set_window_title(f"Comparison for {model_name}")
    except Exception:
        pass
    for ax in axes:
        ax.legend()
    axes[-1].set_xlabel("Time")
    plt.tight_layout()
    # Show the interactive plot window instead of saving to file
    plt.show()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python plot_compare.py <name>")
        sys.exit(1)
    main(sys.argv[1])
