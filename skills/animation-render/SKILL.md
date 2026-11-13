---
name: animation-render
description: YouTube animation channel. Turns an approved scenes.json into a finished animated video made in code - a 3D explainer (clay-style characters and props that act out the narration, moving camera, three.js) or a flat motion-graphics version - generates the voiceover, times every scene to it, adds burned-in captions, and renders an MP4 (16:9 or 9:16). Use when asked to "render the video", "animate this script", "make the video", or when the Animation Director routes here after the script is approved.
---

# Animation Render

The video is a small Remotion project (React code that renders to MP4). You fill in `public/scenes.json`; the template animates it. Two templates:
- **`template-3d/` (default): 3D explainer.** three.js scenes (via `@remotion/three`): clay-style characters and props that **act out what the voice says**, soft shadows, a camera that's always moving, crisp text on top.
- `template/`: flat motion graphics (title cards, counters, lists). Use only if the creator asks for that look.

## Needs (check once)
- **Node.js 18+**, **Python 3**, **ffmpeg**. `python -m pip install edge-tts` for the free voice (skip if the creator records their own).
- Remotion is free for individuals and companies of up to 3 people; bigger companies need a Remotion company license. Tell the creator if that might apply. three.js, React Three Fiber and drei are MIT.

## Steps
1. **Project:** copy `template-3d/` to `channel/videos/<slug>/render/`, run `npm install` there (first time downloads Remotion + a headless browser).
2. **Plan:** write `render/public/scenes.json` from the approved script (format below). Images go in `render/public/`.
3. **Voiceover + timing:** `python <this skill>/scripts/voiceover.py <render>/public/scenes.json --voice en-US-AndrewNeural` → `public/audio/NN.mp3` per scene, each scene's `seconds` set to its line (+0.35 s), word timings for captions. `--list-voices`, `--rate "+8%"`, or `--own-audio` with your recordings `public/audio/01.mp3`, `02.mp3`…
4. **Check frames before the full render:** `npx remotion still src/index.jsx Video out/check.png --frame=60 --gl=angle` at the start, middle and end of each action scene. Look at them. Fix framing (camera keys) and timing first.
5. **Render:** `npx remotion render src/index.jsx Video out/video.mp4 --gl=angle` (about 2–4 min per 30 s in 3D).
6. **Loudness:** `ffmpeg -i out/video.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 ../video.mp4`
7. **Watch it** and fix scenes by editing `scenes.json` (re-run step 3 only for changed narration).

## The golden rule: show what the voice says
If the narration says something *happens* ("it squeezed out of the tank and down a drainpipe"), the picture must **act it out** with an `action` scene: the character moves, squeezes, climbs, carries, hides; the camera follows. A character standing still under an action line is a bug. Use the info scene types only for facts that are a number, a list or a comparison.

## scenes.json (3D)
Top level: `"width"/"height"` (1080x1920 Shorts, 1920x1080 long-form), `"fps": 30`, `"captions": true`, optional `"theme"` (`sky`, `ground`, `pad`, `accent`, `accent2`, `fg`). Every scene has `"type"`, `"narration"`, and optional `"kicker"`/`"title"` text at the top.

| type | What it shows | Fields |
| --- | --- | --- |
| **`action`** | characters and props acting out the line, keyframed camera | `items`, `camera` (below) |
| `hero` / `title` | one prop on a pedestal, camera glides around it | `model`, `title`, `sub`, `cameraFrom`/`cameraTo` `{r, a, h}` |
| `count` | a big number counts up while glowing dots fill the space | `value`, `prefix`, `suffix`, `label`, `model`, `dots` |
| `compare` | two 3D columns grow side by side | `heading`, `left`/`right` `{title, value, label}` |
| `parts` | a prop with up to 4 callout tags | `model`, `heading`, `items` |
| `globe` | spinning globe, optional pin, camera pushes in | `title`, `pin: {lat, lon}` |
| `timeline` | camera slides along a row of posts | `heading`, `events: [{year, text}]` |

**action items:** `{ "model": "<prop>", "keys": [ { "t": 0, "pos": [x,y,z], "rot": yaw, "scale": s, ...prop values } ], ...static props }`. `t` is 0–1 across the scene; numbers and arrays ease between keys; a key that leaves a value out keeps the previous one. Items without `keys` stay put (`pos`, `scale`, `rot`, plus their own props like `size`, `from`/`to`).
**camera:** `{ "keys": [ { "t": 0, "pos": [x,y,z], "look": [x,y,z], "fov": 50 } ] }`. Keep the action in frame: check stills at several `t`.

**Props** (`src/three/kit.jsx`, all procedural, nothing to download or license):
- Characters: `octopus` (`squash` 0–1 stretches it tall and thin, `tuck` 0–1 pulls the arms in, `wave`)
- Scenery: `tank` (`size`), `pipe` (`from`, `to`, `radius`, see-through), `sea` (`size`), `rock`, `seaweed` (`height`), `box` (`size`, `color`: tables, floors, buildings, platforms)
- Objects: `globe`, `coin`, `gear`, `rocket`, `shell`, `shellHalves` (`close` 0–1), `brain`
- **Need something else? Add it.** Write a new component in `kit.jsx` from three.js primitives (spheres, boxes, capsules, cylinders, `taperedTube` for limbs and vines), give it the `Clay` material, and add it to `PROPS`. Animate its parts from `frame` and from numbers passed through keys (like `squash`, `close`). Keep it chunky and readable: clean shapes, 2–4 colors, a cute face if it's a character.

**Example: an escape (7 s)**
```json
{"type": "action", "narration": "Inky squeezed out of his tank and escaped down a drainpipe to the sea.",
 "items": [
  {"model": "box", "pos": [-1, 1.25, 0], "size": [6.4, 2.5, 3.2], "color": "#d9c6a5"},
  {"model": "tank", "pos": [-1.8, 2.8, 0], "size": [2.6, 2, 1.8]},
  {"model": "pipe", "from": [2.6, 2.55, 0], "to": [2.6, 0.12, 0], "radius": 0.32},
  {"model": "sea", "pos": [5.2, 0, 0.5], "size": 3.4},
  {"model": "octopus", "keys": [
    {"t": 0, "pos": [-1.8, 2.85, 0], "scale": 0.4},
    {"t": 0.3, "pos": [-0.5, 4.85, 0.1]},
    {"t": 0.55, "pos": [2.6, 2.55, 0], "squash": 0.35, "tuck": 0.3},
    {"t": 0.62, "pos": [2.6, 1.75, 0], "squash": 1, "tuck": 1},
    {"t": 0.84, "pos": [2.6, -0.35, 0]},
    {"t": 0.92, "pos": [3.7, 0, 0.6], "squash": 0, "tuck": 0},
    {"t": 1, "pos": [5, 0.05, 1]}]}],
 "camera": {"keys": [{"t": 0, "pos": [-0.8, 5.4, 8.5], "look": [-1.4, 3.6, 0]}, {"t": 0.62, "pos": [4.6, 3.2, 6], "look": [2.6, 1.8, 0]}, {"t": 1, "pos": [6.8, 2.4, 6.8], "look": [4.6, 0.4, 0.8]}]}}
```

## Look
- Bright 3D-explainer defaults (sky blue, green ground, coral and blue accents); override in `theme`.
- Background music: `"music": "music.mp3"` in `public/` (a track you have rights to), `"musicVolume": 0.08`.

## Rules
- Render only from an approved script.
- Images, models and music must be the creator's own, public domain/CC0, or licensed; credit them.
- The creator uploads. Remind them about YouTube's synthetic-content disclosure when the voice is AI.
