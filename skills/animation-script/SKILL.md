---
name: animation-script
description: YouTube animation channel. Researches a topic and writes a faceless animated explainer: a fact-checked narration script and a scene plan (scenes.json) that the animation-render skill turns into a finished video. Use when asked to "write the script for my animated video", "make a video about [topic]", "plan the scenes", or when the Animation Director routes here.
---

# Animation Script

## Inputs
- The topic (and angle, if the creator has one)
- `channel/animation-style.md` (format, length, theme, voice). Run `animation-director` first if it's missing.

## 1. Research
- Use web search and primary sources (official sites, encyclopedias, papers, archives). For every claim you'll say on screen, record the source link.
- Write a facts table in `script.md`: claim | source | VERIFIED / UNVERIFIED. Only VERIFIED facts go in the script; round numbers honestly ("about 2,200").

## 2. Narration
- Hook in the first sentence: the most surprising true thing about the topic, then the question the video answers.
- Structure: hook → setup → 3–5 beats that each move the story → payoff → a one-line call to action.
- Write for the ear: short sentences, one idea each, numbers written the way they're spoken ("about two thousand two hundred").
- Length: ~150 spoken words per minute. A 30 s Short ≈ 75 words; an 8 min video ≈ 1,200.

## 3. Scene plan (`channel/videos/<slug>/scenes.json`)
One scene per 1–3 sentences (3–12 s each). Each scene has `"type"`, its on-screen content, and `"narration"` (exactly what the voice says during it). Scene types the template animates:

| type | Fields | Use it for |
| --- | --- | --- |
| `title` | `text`, `kicker`, `sub` | the opening title, chapter titles |
| `number` | `value`, `prefix`, `suffix`, `label`, `kicker` | a big counting number ("2,224 people") |
| `list` | `heading`, `items` (2–5) | reasons, steps, causes |
| `compare` | `heading`, `left`/`right` `{title, points}` | before/after, A vs B |
| `timeline` | `heading`, `events` `[{year, text}]` (2–5) | sequences, history |
| `quote` | `text`, `by` | a real, sourced quote (types itself out) |
| `icon` | `icon` (an emoji), `text`, `sub` | a character-style beat with a statement |
| `image` | `src` (in `public/`), `caption`, `credit` | a photo or map the creator has rights to (slow zoom) |

Top level: `"title"`, `"width"`/`"height"` (1920x1080 or 1080x1920), `"fps": 30`, `"theme"` (from the style file), `"captions": true`.

```json
{"title": "Why the Titanic sank", "width": 1920, "height": 1080, "fps": 30, "theme": {"accent": "#f4a259"},
 "scenes": [
  {"type": "title", "text": "Why the Titanic Sank", "sub": "April 15, 1912", "narration": "On April fifteenth, nineteen twelve..."},
  {"type": "number", "value": "2224", "label": "people on board (about)", "narration": "About two thousand two hundred people were on board."}
 ]}
```

Vary the scene types: never more than two of the same type in a row.

## 4. Hand-off
`script.md`: the facts table, the narration, the scene list (n, type, on-screen text, narration), word count and estimated length. The creator approves it before `animation-render` runs.
