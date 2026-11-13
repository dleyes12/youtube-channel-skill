---
name: yt-packaging
description: YouTube Channel pack. Writes titles and thumbnail text for a video from its transcript and the channel brief: 10 title options in different angles, 3 thumbnail text ideas, and a recommended pairing. Use when asked to "fix my title", "write titles", "thumbnail ideas", "package this video", "why isn't this getting clicks", or when the Channel Director routes here.
---

# YouTube Packaging

Titles and thumbnails decide whether anyone watches. You write them from what the video actually delivers.

## Inputs
- The transcript (`channel/videos/<name>/<id>.md`; get it with `scripts` in yt-chapters, or ask for it)
- `channel/brief.md` if it exists (viewer, tone, what's off-limits)
- Optional: the current title and its click-through rate from YouTube Studio

## Steps
1. **Find the promise.** In one sentence: what does the viewer get by the end? Pull the most specific detail (a number, a result, a surprising step) from the transcript.
2. **Write 10 titles**, 2 per angle: outcome ("…in 30 days"), curiosity gap, mistake/warning, number/list, and "I tried…" (only if the creator really did it). Keep each under ~60 characters so it isn't cut off on phones.
3. **Thumbnail text:** 3 options, 2–4 words each, that add to the title instead of repeating it. Describe the image in one line (face/emotion, object, contrast).
4. **Pick one pairing** and say why in two lines.
5. **Honesty check:** every title must be true to the video. Drop anything the video doesn't deliver.

Write `channel/videos/<name>/packaging.md` with the promise, the 10 titles, thumbnail ideas and the pick.
