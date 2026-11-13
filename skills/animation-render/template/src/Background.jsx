import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

// Slow drifting gradient + soft grid, so every scene sits on the same moving world.
export const Background = ({ theme }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const x = 50 + Math.sin(f / 140) * 20, y = 40 + Math.cos(f / 170) * 15;
  const grid = Math.round(Math.min(width, height) / 18);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, ${theme.bg2} 0%, ${theme.bg} 65%)` }}>
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${theme.fg}0d 1px, transparent 1px), linear-gradient(90deg, ${theme.fg}0d 1px, transparent 1px)`,
        backgroundSize: `${grid}px ${grid}px`, backgroundPosition: `${(f * 0.4) % grid}px ${(f * 0.25) % grid}px`,
      }} />
    </AbsoluteFill>
  );
};
