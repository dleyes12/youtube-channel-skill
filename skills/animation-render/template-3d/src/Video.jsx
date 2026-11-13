import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useVideoConfig } from "remotion";
import { sceneFrames } from "./Root.jsx";
import { SCENES } from "./three/scenes.jsx";
import { Captions } from "./Captions.jsx";

// Bright "3D explainer" defaults: sky, clay-like props, soft shadows. Override any key in scenes.json "theme".
const DEFAULT_THEME = { bg: "#7ec8f2", sky: "#8fd0f5", skyLight: "#e8f6ff", groundLight: "#5b4b8a", ground: "#5fb37a", pad: "#7cc98f", rim: "#ffcf9e",
  fg: "#ffffff", muted: "#e6eef7", accent: "#ff7a59", accent2: "#5b6cff", font: "Inter, 'Segoe UI', Arial, sans-serif", display: "'Arial Black', Impact, 'Segoe UI', sans-serif" };

export const Video = ({ data }) => {
  const { fps } = useVideoConfig();
  const theme = { ...DEFAULT_THEME, ...(data.theme || {}) };
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, color: theme.fg, background: theme.sky }}>
      <Series>
        {data.scenes.map((s, i) => {
          const Scene = SCENES[s.type] || SCENES.hero;
          return (
            <Series.Sequence key={i} durationInFrames={sceneFrames(s, fps)}>
              <Scene scene={s} theme={theme} index={i} />
              {s.audio ? <Audio src={staticFile(s.audio)} /> : null}
              {data.captions !== false && s.narration ? <Captions text={s.narration} theme={theme} words={s.words} seconds={s.seconds || 4} /> : null}
            </Series.Sequence>
          );
        })}
      </Series>
      {data.music ? <Audio src={staticFile(data.music)} volume={data.musicVolume ?? 0.08} loop /> : null}
    </AbsoluteFill>
  );
};
