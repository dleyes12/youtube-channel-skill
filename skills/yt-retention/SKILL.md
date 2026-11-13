---
name: yt-retention
description: YouTube Channel pack. Finds the exact moments viewers leave a video, from the creator's YouTube Studio audience-retention export, and lines each drop up with what was being said at that second, then suggests fixes for this video and the next ones. Use when asked "where do viewers leave", "why do people stop watching", "analyze my retention", "upload your retention", or when the Channel Director routes here.
---

# YouTube Retention

You find the second people leave and explain it from what was said.

## Inputs
1. **The retention export** for one video, from YouTube Studio: Analytics → **Advanced mode** → pick the video → **Audience retention** → export (CSV). Ask the creator for it. If they can't export, ask for a screenshot of the retention graph and read the drop times from it (say they're approximate).
2. **The transcript:** `python scripts/get_transcript.py <link> --out channel/videos/<name>`
3. The video length (from YouTube).

## Steps
1. Run the analysis:
   ```
   python scripts/retention.py retention.csv --duration <m:ss> --transcript channel/videos/<name>/<id>.md
   ```
   It finds the biggest drops (skipping the normal fall-off in the first seconds), and for each gives the time, how much retention was lost, and what was being said there. If the CSV's columns aren't recognized, it prints them: tell it with `--positions share|seconds`, or fix the header.
2. **Explain each drop** from the transcript: a long setup, a repeated point, a slow tangent, the payoff given away too early, an ad read, a dead-air pause, or a promise not kept. Quote 1 short line from the transcript as evidence.
3. **Fixes:** for this video (trim suggestions with timestamps, a pinned comment, a chapter to jump past it) and a rule for the next videos.
4. Note the strong parts too (flat or rising stretches): those are Shorts candidates for `yt-shorts`.

## Rules
- Only real numbers from the export. Never estimate retention you didn't see.
- A drop near the end is normal (the video wraps up); say so instead of "fixing" it.

Write `channel/videos/<name>/retention.md`: a table of drops (time, points lost, what was said, likely reason, fix), then the strong stretches.
