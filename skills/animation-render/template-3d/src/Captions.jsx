import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

// Burned-in captions: 3-5 words at a time. With word timings (from scripts/voiceover.py) the
// chunks follow the voice exactly; without them they're spread evenly over the scene.
export const Captions = ({ text, theme, words, seconds }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = f / fps;
  const list = words && words.length ? words : text.split(/\s+/).map((w, i, a) => ({ text: w, start: (i / a.length) * seconds }));
  const chunks = [];
  for (let i = 0; i < list.length; i += 4) chunks.push({ start: list[i].start, text: list.slice(i, i + 4).map((w) => w.text).join(" ") });
  let cur = chunks[0];
  for (const c of chunks) if (c.start <= t) cur = c;
  const vertical = height > width;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: vertical ? height * 0.2 : height * 0.07, textAlign: "center", padding: "0 6%" }}>
      <span style={{ fontFamily: theme.display, fontSize: Math.round(Math.min(width, height) * (vertical ? 0.062 : 0.05)), color: theme.fg,
        textShadow: "0 4px 18px rgba(0,0,0,.85), 0 2px 4px rgba(0,0,0,.9)", textTransform: "uppercase", letterSpacing: "0.01em" }}>
        {cur ? cur.text : ""}
      </span>
    </div>
  );
};
