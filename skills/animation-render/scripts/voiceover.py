#!/usr/bin/env python3
"""Make the voiceover for an animated video and time every scene to it.

Usage:
  python voiceover.py <project>/public/scenes.json [--voice en-US-AndrewNeural] [--rate +0%] [--pad 0.35]
  python voiceover.py <project>/public/scenes.json --list-voices
  python voiceover.py <project>/public/scenes.json --own-audio   # you recorded audio/01.mp3, audio/02.mp3, ...

For each scene with "narration", it writes public/audio/NN.mp3, measures it, and sets the
scene's "audio", "seconds" (audio length + a short pause) and "words" (word timings for the
captions). Scenes without narration keep their "seconds".

Voice: edge-tts (free, uses Microsoft Edge's online read-aloud voices; needs internet).
  python -m pip install edge-tts
Check that the voice terms fit your use before monetizing; for a channel you plan to grow,
your own recorded voice (--own-audio) or a licensed TTS is the safer long-term choice.
Measuring audio length needs ffprobe (comes with ffmpeg).
"""
import argparse
import asyncio
import json
import os
import shutil
import subprocess
import sys


def duration(path):
    fp = shutil.which("ffprobe")
    if not fp:
        sys.exit("ffprobe not found: install ffmpeg (https://ffmpeg.org/download.html).")
    out = subprocess.run([fp, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(out.stdout.strip())


async def speak(text, voice, rate, path):
    import edge_tts  # type: ignore
    com = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    words = []
    with open(path, "wb") as fh:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                fh.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({"text": chunk["text"], "start": round(chunk["offset"] / 1e7, 3)})
    return words


async def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("scenes")
    ap.add_argument("--voice", default="en-US-AndrewNeural")
    ap.add_argument("--rate", default="+0%", help='speed, e.g. "+8%%" or "-5%%"')
    ap.add_argument("--pad", type=float, default=0.35, help="seconds of silence after each scene's line")
    ap.add_argument("--own-audio", action="store_true", help="use your own recordings in public/audio/NN.mp3")
    ap.add_argument("--list-voices", action="store_true")
    a = ap.parse_args()
    if a.list_voices:
        import edge_tts  # type: ignore
        for v in await edge_tts.list_voices():
            if v["Locale"].startswith("en-"):
                print(v["ShortName"], v["Gender"], ", ".join(v.get("VoiceTag", {}).get("VoicePersonalities", [])))
        return
    public = os.path.dirname(os.path.abspath(a.scenes))
    data = json.load(open(a.scenes, encoding="utf-8"))
    os.makedirs(os.path.join(public, "audio"), exist_ok=True)
    total = 0.0
    for i, s in enumerate(data["scenes"], 1):
        if not s.get("narration"):
            total += s.get("seconds", 3)
            continue
        rel = f"audio/{i:02d}.mp3"
        path = os.path.join(public, rel)
        if a.own_audio:
            if not os.path.exists(path):
                sys.exit(f"Missing your recording for scene {i}: {path}")
            s.pop("words", None)  # no word timings for own audio: captions are spread evenly
        else:
            for attempt in range(4):  # the free service sometimes drops a request: retry
                try:
                    s["words"] = await speak(s["narration"], a.voice, a.rate, path)
                    break
                except Exception as e:
                    if attempt == 3:
                        sys.exit(f"Voice failed for scene {i} after 4 tries ({type(e).__name__}). Try again, or use --own-audio.")
                    await asyncio.sleep(2 * (attempt + 1))
        s["audio"] = rel
        s["seconds"] = round(duration(path) + a.pad, 2)
        total += s["seconds"]
        print(json.dumps({"scene": i, "type": s.get("type"), "seconds": s["seconds"], "words": len(s.get("words", []))}), flush=True)
    data["voice"] = "own recording" if a.own_audio else a.voice
    json.dump(data, open(a.scenes, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    print(json.dumps({"total_seconds": round(total, 1), "scenes": len(data["scenes"]), "file": a.scenes}))


if __name__ == "__main__":
    asyncio.run(main())
