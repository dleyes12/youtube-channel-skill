---
name: yt-chapters
description: YouTube Channel pack. Turns a video's transcript into YouTube chapters (timestamps that YouTube accepts) and a ready-to-paste description. Works on one video or a batch of links. Use when asked to "add chapters", "write timestamps", "write my description", "chapters for all my videos", or when the Channel Director routes here.
---

# YouTube Chapters + Description

## 1. Get the transcript
```
python scripts/get_transcript.py <link> [<link> ...] --out channel/videos/<name>
```
It writes a timestamped transcript per video (captions via youtube-transcript-api, then yt-dlp as a fallback). If a library is missing: `python -m pip install youtube-transcript-api yt-dlp`. No captions? Ask the creator to paste the transcript (YouTube: "...more" → **Show transcript**).

## 2. Chapters
- Read the whole transcript and mark where the topic actually changes.
- YouTube's rules: the first chapter starts at **0:00**, at least **3** chapters, each at least **10 seconds** long, timestamps in ascending order.
- 4–10 chapters for most videos. Titles are 2–6 words and say what happens, not "Part 2".
- Use the transcript's timestamps; round to the start of the sentence where the new topic begins.

## 3. Description
1. Two opening lines that restate the promise (they show above "...more")
2. The chapters
3. Links and calls to action the creator gives you (never invent links)
4. 3 relevant hashtags at most

## 4. Batch
For several links, do each video in turn and finish with a table: video → chapters added → file.

Write `channel/videos/<name>/description.md`. The creator pastes it into YouTube Studio.
