# The YouTube Channel Skill 📺

**6 Claude skills that take the busywork off your YouTube channel.** Free.

Built by [@dylanleyes.ai](https://www.instagram.com/dylanleyes.ai/).

| Skill | What it does |
| --- | --- |
| **channel-director** | Start here. Learns your channel once, then runs each video through the other 5 in the right order |
| **yt-retention** ⭐ | Upload your YouTube Studio retention export: it finds the **exact second viewers leave**, shows what you were saying right then, and tells you how to fix it |
| **yt-shorts** | Finds the best 20–60 s moments in a long video and cuts them into vertical Shorts (1080×1920) from your file |
| **yt-packaging** | 10 titles in different angles + thumbnail text, and the pairing it would pick |
| **yt-chapters** | Chapters YouTube accepts + a ready-to-paste description, for one video or a whole batch |
| **yt-comments** | Sorts your comments, drafts replies in your voice, and pulls out video ideas |

All 6 share one folder (`channel/`) in your project, so each skill builds on what the others found.

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
Needs Python. The first time, Claude installs `youtube-transcript-api` and `yt-dlp` (for transcripts). Cutting Shorts needs `ffmpeg`.

### Claude.ai (web / desktop app)
1. Download the zips from `dist/` (one per skill)
2. **Settings → Capabilities → Skills → Upload skill**, one zip at a time
3. Turn on code execution so the scripts can run. Without it, paste transcripts and numbers in yourself.

## Use it
Say **"Run my YouTube channel"** (or "use the channel director"). Or go straight to one job:
- "Here's my retention export for this video. Where do viewers leave?"
- "Turn this video into 4 Shorts." (attach the file)
- "Write 10 titles for this video: <link>"
- "Add chapters to these 5 videos: <links>"

## Rules it follows
- Truth only: never invents views, retention numbers, quotes or results
- You approve and post everything
- Only cuts videos you own or have rights to

MIT License.
