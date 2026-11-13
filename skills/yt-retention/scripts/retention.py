#!/usr/bin/env python3
"""Find where viewers leave a YouTube video, from an audience-retention export.

Usage:
  python retention.py retention.csv --duration 12:34 [--top 5] [--transcript youtube-transcripts/<id>.md]

retention.csv: export the audience-retention data for one video from YouTube Studio
(Analytics -> Advanced mode -> the video -> Audience retention -> export), or any CSV with
one column for the position in the video and one for the share of viewers still watching.
Column names are matched loosely ("position", "time", "moment" / "retention", "audience",
"watching"). Positions can be seconds, mm:ss, or a 0-1 / 0-100 share of the video (then
pass --duration). Retention can be 0-1 or 0-100.

Prints JSON: the biggest drops (where the curve falls fastest), each with its time, how
many points of retention were lost, and, with --transcript, what was being said there.
"""
import argparse
import csv
import json
import re
import sys


def secs(v):
    v = str(v).strip()
    if re.fullmatch(r"\d+(:\d{1,2}){1,2}(\.\d+)?", v):
        out = 0.0
        for p in v.split(":"):
            out = out * 60 + float(p)
        return out
    return float(v.replace("%", "").replace(",", "."))


def mmss(s):
    s = int(round(s))
    return f"{s // 3600}:{s // 60 % 60:02d}:{s % 60:02d}" if s >= 3600 else f"{s // 60}:{s % 60:02d}"


def load(path):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        sample = fh.read(4096)
        fh.seek(0)
        dialect = csv.Sniffer().sniff(sample, delimiters=",;\t") if sample.strip() else csv.excel
        rows = list(csv.reader(fh, dialect))
    head = [h.strip().lower() for h in rows[0]]
    pos = next((i for i, h in enumerate(head) if re.search(r"position|time|moment|second", h)), None)
    ret = next((i for i, h in enumerate(head) if re.search(r"retention|audience|watching|viewers", h) and i != pos), None)
    if pos is None or ret is None:
        sys.exit(f"Couldn't find a position column and a retention column in: {rows[0]}")
    pts = []
    for r in rows[1:]:
        try:
            pts.append((secs(r[pos]), secs(r[ret])))
        except (ValueError, IndexError):
            continue
    pts.sort()
    return pts, rows[0][pos], rows[0][ret]


def transcript_at(path, t, window=12):
    """Text spoken around time t from a get_transcript.py file ([m:ss] paragraphs)."""
    try:
        text = open(path, encoding="utf-8").read()
    except OSError:
        return None
    paras = [(secs(m.group(1)), m.group(2).strip()) for m in re.finditer(r"^\[(\d+(?::\d{2}){1,2})\]\s*(.+)$", text, re.M)]
    near = [p for s, p in paras if s <= t + window and s >= t - 35]
    return " ".join(near)[:600] if near else None


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("csv")
    ap.add_argument("--duration", help="video length (seconds or m:ss); needed when positions are a share of the video")
    ap.add_argument("--top", type=int, default=5)
    ap.add_argument("--transcript")
    ap.add_argument("--positions", choices=["auto", "share", "seconds"], default="auto",
                    help="how to read the position column (auto: a %%/position column up to 100 is a share of the video)")
    a = ap.parse_args()
    pts, pcol, rcol = load(a.csv)
    if len(pts) < 5:
        sys.exit("Not enough data points in the CSV.")
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    if max(ys) <= 1.5:
        ys = [y * 100 for y in ys]
    dur = secs(a.duration) if a.duration else None
    share = a.positions == "share" or (a.positions == "auto" and max(xs) <= 100 and
                                        (max(xs) <= 1.0 or re.search(r"%|percent|position", pcol.lower()) is not None))
    if share:  # positions are a share of the video
        if not dur:
            sys.exit("Positions look like a share of the video: pass --duration (e.g. --duration 12:34).")
        scale = dur / (1.0 if max(xs) <= 1.0 else 100.0)
        xs = [x * scale for x in xs]
    # drop per segment, skipping the normal intro fall-off (first 30 s or 3%, whichever is longer)
    sm = ys
    start_i = 1 + next((i for i, x in enumerate(xs) if x >= max(30.0, xs[-1] * 0.03)), 0)
    drops = []
    for i in range(max(start_i, 1), len(xs)):
        dt = xs[i] - xs[i - 1]
        if dt <= 0:
            continue
        drops.append({"i": i, "lost": sm[i - 1] - sm[i], "rate": (sm[i - 1] - sm[i]) / dt})
    drops.sort(key=lambda d: d["lost"], reverse=True)
    picked = []
    for d in drops:  # keep drops at least 4% of the video apart
        if d["lost"] <= 0:
            break
        if all(abs(xs[d["i"]] - xs[p["i"]]) > xs[-1] * 0.04 for p in picked):
            picked.append(d)
        if len(picked) >= a.top:
            break
    out = {
        "columns": {"position": pcol, "retention": rcol},
        "points": len(xs),
        "video_length": mmss(xs[-1]) if not dur else mmss(dur),
        "retention_at_30s": round(next((y for x, y in zip(xs, ys) if x >= 30), ys[-1]), 1),
        "retention_at_end": round(ys[-1], 1),
        "biggest_drops": [],
    }
    for d in sorted(picked, key=lambda d: xs[d["i"]]):
        t = xs[d["i"]]
        item = {"at": mmss(t), "between": f"{mmss(xs[d['i'] - 1])}-{mmss(t)}", "seconds": round(t, 1), "retention_before": round(sm[d["i"] - 1], 1),
                "retention_after": round(sm[d["i"]], 1), "points_lost": round(d["lost"], 2)}
        if a.transcript:
            item["said_around_here"] = transcript_at(a.transcript, t)
        out["biggest_drops"].append(item)
    print(json.dumps(out, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
