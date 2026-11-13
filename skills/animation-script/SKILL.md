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
One scene per 1–3 sentences (3–12 s each). Each scene has `"type"`, its visual content, and `"narration"` (exactly what the voice says during it).

**Show what the voice says.** Whenever a line describes something *happening* (escaping, building, falling, growing, colliding, carrying), plan an `action` scene where the characters and props act it out, and write the choreography in plain words in `script.md` too ("Inky climbs out of the tank, slides to the drain, squeezes down the pipe, pops out in the sea"). Use the info types only for numbers, lists and comparisons. Never leave a character standing still under an action line.

Scene types (3D template; full field list and an example in the animation-render skill):

| type | Use it for |
| --- | --- |
| `action` | anything that happens: characters and props move along keyframes, camera follows |
| `hero` / `title` | introducing the subject: one prop, camera glides around it |
| `count` | a big number ("500 million neurons") with dots filling the space |
| `compare` | two values side by side as 3D columns |
| `parts` | a subject with up to 4 labeled facts |
| `globe` | where in the world |
| `timeline` | a sequence of dates |

Props available: octopus, tank, pipe, sea, rock, seaweed, box, globe, coin, gear, rocket, shell, shellHalves, brain. If the story needs a character or object that isn't there (a dog, a bridge, a ship), say so in the plan: animation-render builds it from simple 3D shapes.

Vary the scene types: never more than two of the same type in a row. Open with an `action` or `hero` shot, not a text card.

## 4. Hand-off
`script.md`: the facts table, the narration, the scene list (n, type, on-screen text, narration), word count and estimated length. The creator approves it before `animation-render` runs.
