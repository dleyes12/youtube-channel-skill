# The YouTube Channel Skill 📺

**9 Claude skills for your YouTube channel: run a faceless animation channel, find where viewers leave, cut Shorts, and write titles, chapters and replies.** Free.

Built by [@dylanleyes.ai](https://www.instagram.com/dylanleyes.ai/).

| Skill | What it does |
| --- | --- |
| **channel-director** | Start here. Learns your channel once, then runs each video through the other 5 in the right order |
| **yt-retention** ⭐ | Upload your YouTube Studio retention export: it finds the **exact second viewers leave**, shows what you were saying right then, and tells you how to fix it |
| **yt-shorts** | Finds the best 20–60 s moments in a long video and cuts them into vertical Shorts (1080×1920) from your file |
| **yt-packaging** | 10 titles in different angles + thumbnail text, and the pairing it would pick |
| **yt-chapters** | Chapters YouTube accepts + a ready-to-paste description, for one video or a whole batch |
| **yt-comments** | Sorts your comments, drafts replies in your voice, and pulls out video ideas |

### 🎬 Run a faceless animation channel
| Skill | What it does |
| --- | --- |
| **animation-director** | Start here for an animated channel. Sets your look, voice and format once, then takes each topic from idea to finished video |
| **animation-script** | Researches the topic (every fact with a source) and writes the narration + a scene plan |
| **animation-render** | Adds a voiceover, times every scene to it, animates it in 3D (clay-style characters and props that act out the story, moving camera) with captions, and renders the MP4, 16:9 or 9:16 |

Then `yt-shorts` cuts the Shorts and `yt-packaging` writes the titles. Give it one topic: **"Make an animated video about why the Titanic sank."**

The animation is made in code: a bright 3D-explainer look with three.js inside [Remotion](https://www.remotion.dev) (or a flat motion-graphics look). It is not Pixar-level film animation. The voice is a free text-to-speech voice or your own recording.

All skills share one folder (`channel/`) in your project, so each builds on what the others found.

**What it doesn't do:** it never uploads, publishes or replies by itself. It drafts and prepares; you click publish in YouTube Studio. Claude reads your transcripts and your analytics exports; it doesn't watch the video.

## Install

### Claude Code (recommended)
Paste this repo's link into Claude Code and say **"install these skills"**:
```
https://github.com/dleyes12/youtube-channel-skill
```
Or as a plugin:
```
/plugin marketplace add dleyes12/youtube-channel-skill
/plugin install youtube-channel@youtube-channel-skill
```
Or with the skills CLI:
```
npx skills add dleyes12/youtube-channel-skill
```
Needs Python and ffmpeg (and Node.js for the animation skills). The first time, Claude installs `youtube-transcript-api` and `yt-dlp` (transcripts) and `edge-tts` (the free voice). Remotion is free for individuals and companies of up to 3 people; larger companies need a Remotion license.

### Claude.ai (web / desktop app)
1. Download the zips from `dist/` (one per skill)
2. **Settings → Capabilities → Skills → Upload skill**, one zip at a time
3. Turn on code execution so the scripts can run. Without it, paste transcripts and numbers in yourself.

## Use it
Say **"Run my YouTube channel"** or **"Make an animated video about <topic>"**. Or go straight to one job:
- "Here's my retention export for this video. Where do viewers leave?"
- "Turn this video into 4 Shorts." (attach the file)
- "Write 10 titles for this video: <link>"
- "Add chapters to these 5 videos: <links>"

## Rules it follows
- Truth only: never invents views, retention numbers, quotes or results
- You approve and post everything
- Only cuts videos you own or have rights to

MIT License.
