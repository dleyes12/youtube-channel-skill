#!/usr/bin/env python3
"""Cut Shorts out of a long video you own, from a cut list.

Usage:
  python cut_shorts.py my-video.mp4 cuts.json [--out shorts] [--fit crop|pad]

cuts.json: [{"title": "Why viewers leave at 2:47", "start": "2:41", "end": "3:22"}, ...]
(start/end as seconds or m:ss; each Short should be under 60 s).

Each Short is written as shorts/NN-<title>.mp4, 1080x1920 (vertical), with the original audio:
  --fit crop  centre-crops a landscape video to 9:16 (default)
  --fit pad   keeps the whole frame and fills above/below with a blurred copy
Needs ffmpeg on the PATH. The source file is never changed.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys


def secs(v):
    v = str(v).strip()
    if ":" in v:
        out = 0.0
        for p in v.split(":"):
            out = out * 60 + float(p)
        return out
    return float(v)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")[:50] or "short"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("cuts")
    ap.add_argument("--out", default="shorts")
    ap.add_argument("--fit", choices=["crop", "pad"], default="crop")
    a = ap.parse_args()
    ff = shutil.which("ffmpeg")
    if not ff:
        sys.exit("ffmpeg isn't installed (https://ffmpeg.org/download.html).")
    cuts = json.load(open(a.cuts, encoding="utf-8"))
    os.makedirs(a.out, exist_ok=True)
    vf = {
        "crop": "scale=-2:1920,crop=1080:1920,setsar=1",
        "pad": "split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2[bg];"
               "[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1",
    }[a.fit]
    for n, c in enumerate(cuts, 1):
        s, e = secs(c["start"]), secs(c["end"])
        if e <= s:
            print(json.dumps({"n": n, "ok": False, "error": "end is before start"})); continue
        out = os.path.join(a.out, f"{n:02d}-{slug(c.get('title', ''))}.mp4")
        cmd = [ff, "-v", "error", "-y", "-ss", f"{s:.2f}", "-i", a.video, "-t", f"{e - s:.2f}",
               "-filter_complex" if a.fit == "pad" else "-vf", vf,
               "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", out]
        r = subprocess.run(cmd, capture_output=True, text=True)
        print(json.dumps({"n": n, "ok": r.returncode == 0, "file": out, "seconds": round(e - s, 1),
                          "over_60s": e - s > 60, "error": r.stderr.strip()[-300:] or None}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
