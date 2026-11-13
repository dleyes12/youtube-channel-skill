---
name: animation-render
description: YouTube animation channel. Turns an approved scenes.json into a finished animated video made in code - generates the voiceover, times every scene to it, animates the scenes (titles, counters, lists, comparisons, timelines, quotes, images) with burned-in captions, and renders an MP4 (16:9 or 9:16). Use when asked to "render the video", "animate this script", "make the video", or when the Animation Director routes here after the script is approved.
---

# Animation Render

The video is a small Remotion project (React code that renders to MP4). You fill in `public/scenes.json`; the template animates it. Nothing is drawn by hand.

## Needs (check once)
- **Node.js 18+** (`node -v`), **Python 3**, **ffmpeg** (`ffmpeg -version`).
- `python -m pip install edge-tts` for the free voice (skip if the creator records their own).
- Remotion is free for individuals and companies of up to 3 people; bigger companies need a Remotion company license. Tell the creator if that might apply.

## Steps
1. **Make the project:** copy this skill's `template/` folder to `channel/videos/<slug>/render/`, then run `npm install` inside it (first time only; downloads Remotion and a headless browser).
2. **Add the plan:** copy the approved `scenes.json` to `render/public/scenes.json`. Put any images it uses in `render/public/`.
3. **Voiceover + timing:**
   ```
   python <this skill>/scripts/voiceover.py channel/videos/<slug>/render/public/scenes.json --voice en-US-AndrewNeural
   ```
   Writes `public/audio/NN.mp3` per scene and sets each scene's length to its line (+0.35 s), plus word timings for the captions. `--list-voices` shows the options, `--rate "+8%"` speeds it up. Own voice: record one file per scene as `public/audio/01.mp3`, `02.mp3`... and add `--own-audio`. If the free voice service fails it retries; if it keeps failing, try again later or use your own voice.
4. **Check a frame before the full render:** `npx remotion still src/index.jsx Video out/check.png --frame=60` and look at it (or `npm run preview` to scrub it in the browser).
5. **Render:** `npx remotion render src/index.jsx Video out/video.mp4`. A 30 s video takes about a minute; a 10 min video takes longer.
6. **Loudness for YouTube** (about -14 LUFS): `ffmpeg -i out/video.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 ../video.mp4`
7. **Watch it.** Fix scenes by editing `scenes.json` and re-running steps 3–5 (only changed narration needs a new voice line).

## Look
- Colors come from `theme` in scenes.json (from `channel/animation-style.md`). Fonts default to system fonts so it renders anywhere.
- To go further, edit `src/scenes/index.jsx` (each scene type is one small React component) or add a new type and list it in `SCENES`.
- Background music: add `"music": "music.mp3"` (in `public/`, a track you have the rights to) and `"musicVolume": 0.08`.

## Rules
- Render only from an approved script.
- Images and music must be the creator's own, public domain, or licensed; credit them (`credit` field).
- The creator uploads. Remind them about YouTube's synthetic-content disclosure when the voice is AI.
