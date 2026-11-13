import React from "react";
import { AbsoluteFill, Audio, Series, staticFile, useVideoConfig } from "remotion";
import { sceneFrames } from "./Root.jsx";
import { SCENES } from "./scenes/index.jsx";
import { Captions } from "./Captions.jsx";
import { Background } from "./Background.jsx";

const DEFAULT_THEME = { bg: "#0d1321", bg2: "#1d2d44", fg: "#f0ebd8", muted: "#9aa5b8", accent: "#f4a259", accent2: "#5bc0be", font: "Inter, 'Segoe UI', Arial, sans-serif", display: "'Arial Black', Impact, 'Segoe UI', sans-serif" };

export const Video = ({ data }) => {
  const { fps } = useVideoConfig();
  const theme = { ...DEFAULT_THEME, ...(data.theme || {}) };
  return (
    <AbsoluteFill style={{ fontFamily: theme.font, color: theme.fg }}>
      <Background theme={theme} />
      <Series>
        {data.scenes.map((s, i) => {
          const Scene = SCENES[s.type] || SCENES.title;
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
