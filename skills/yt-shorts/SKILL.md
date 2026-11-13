---
name: yt-shorts
description: YouTube Channel pack. Turns one long video into several Shorts: finds the best self-contained 20-60 second moments in the transcript (and the strong stretches in the retention data if available), writes a hook and title for each, and, if you have the video file, cuts them into vertical 1080x1920 clips. Use when asked to "turn this into Shorts", "clip my video", "find the best moments", "videos into multiple", or when the Channel Director routes here.
---

# YouTube Shorts

## Inputs
- The transcript: `python scripts/get_transcript.py <link> --out channel/videos/<name>`
- Optional: `channel/videos/<name>/retention.md` (strong stretches are the best candidates)
- Optional: the creator's own video file, to cut the clips. Only cut videos the creator owns or has rights to.

## Steps
1. **Find 3–6 moments** that work alone: a clear hook in the first 2 seconds, one idea, a payoff, 20–60 seconds. Skip moments that need context from earlier in the video, or that depend on visuals you can't see.
2. For each: start/end time (start on the first word of the hook, end right after the payoff), a 1-line hook, a Short title (under 40 characters), and why it works.
3. **Cut them** (only with a file and the creator's OK). Write the cut list to `channel/videos/<name>/cuts.json`:
   ```json
   [{"title": "Why viewers leave at 2:47", "start": "2:41", "end": "3:22"}]
   ```
   then run:
   ```
   python scripts/cut_shorts.py my-video.mp4 channel/videos/<name>/cuts.json --out channel/videos/<name>/shorts
   ```
   `--fit crop` (default) centre-crops a landscape video to 9:16; `--fit pad` keeps the whole frame over a blurred fill. Needs ffmpeg. The original file is never changed.
4. Check each clip's length in the output (the script flags anything over 60 s) and adjust.

## Rules
- The creator uploads the Shorts (YouTube Studio or the app). Never upload for them.
- Captions/subtitles aren't burned in by the script; say so and suggest adding them in their editor or YouTube's auto-captions.

Write `channel/videos/<name>/shorts.md`: a table (n, start–end, hook, title, why) and the clip files if cut.
