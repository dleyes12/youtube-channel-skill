import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Scene types the animation-script skill can use in scenes.json. Every scene animates in on
// its own (springs, wipes, counters, drifting camera) and leaves the bottom band for captions.
// Text sizes scale with the frame, so the same scenes work at 1920x1080 and 1080x1920.

const useUnit = () => { const { width, height } = useVideoConfig(); return { u: Math.min(width, height) / 100, vertical: height > width, width, height }; };
const useIn = (delay = 0, damping = 14) => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return spring({ frame: f - delay, fps, config: { damping } }); };
const Stage = ({ children, style }) => {
  const { u } = useUnit();
  return <AbsoluteFill style={{ padding: `${8 * u}px ${9 * u}px ${20 * u}px`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 3 * u, ...style }}>{children}</AbsoluteFill>;
};
const Kicker = ({ text, theme }) => { const { u } = useUnit(); const p = useIn(0); return text ? <div style={{ fontSize: 3.2 * u, letterSpacing: "0.18em", textTransform: "uppercase", color: theme.accent, fontWeight: 800, opacity: p, transform: `translateY(${(1 - p) * 2 * u}px)` }}>{text}</div> : null; };
const Heading = ({ text, theme, size = 8, delay = 4 }) => {
  const { u } = useUnit(); const p = useIn(delay, 12);
  return <div style={{ fontFamily: theme.display, fontSize: size * u, lineHeight: 1.02, textAlign: "center", maxWidth: "100%", opacity: p, transform: `scale(${0.85 + 0.15 * p}) translateY(${(1 - p) * 4 * u}px)` }}>{text}</div>;
};
const Underline = ({ theme, delay = 10, w = 30 }) => { const { u } = useUnit(); const p = useIn(delay, 20); return <div style={{ width: w * u * p, height: 1.1 * u, borderRadius: u, background: theme.accent }} />; };

function Title({ scene, theme }) {
  return <Stage><Kicker text={scene.kicker} theme={theme} /><Heading text={scene.text} theme={theme} size={scene.size || 9.5} /><Underline theme={theme} />{scene.sub ? <Sub text={scene.sub} theme={theme} /> : null}</Stage>;
}
const Sub = ({ text, theme, delay = 16 }) => { const { u } = useUnit(); const p = useIn(delay); return <div style={{ fontSize: 4 * u, color: theme.muted, textAlign: "center", opacity: p }}>{text}</div>; };

function List({ scene, theme }) {
  const { u } = useUnit(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const per = Math.max(8, Math.floor(((scene.seconds || 4) * fps * 0.75) / Math.max(1, scene.items.length)));
  return (
    <Stage style={{ alignItems: "stretch" }}>
      <Heading text={scene.heading} theme={theme} size={6.5} delay={0} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2.2 * u, marginTop: 2 * u }}>
        {scene.items.map((it, i) => {
          const p = spring({ frame: f - 8 - i * per, fps, config: { damping: 14 } });
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 2.5 * u, fontSize: 4.6 * u, fontWeight: 700, opacity: p, transform: `translateX(${(1 - p) * -8 * u}px)` }}>
              <div style={{ minWidth: 7 * u, height: 7 * u, borderRadius: 2 * u, background: i % 2 ? theme.accent2 : theme.accent, color: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: theme.display, fontSize: 4 * u }}>{i + 1}</div>
              <span>{it}</span>
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

function BigNumber({ scene, theme }) {
  const { u } = useUnit(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const target = parseFloat(String(scene.value).replace(/[^0-9.]/g, "")) || 0;
  const decimals = (String(scene.value).split(".")[1] || "").replace(/[^0-9]/g, "").length;
  const t = interpolate(f, [6, Math.min(fps * 1.6, (scene.seconds || 3) * fps * 0.6)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (x) => 1 - Math.pow(1 - x, 3) });
  const shown = (target * t).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <Stage>
      <Kicker text={scene.kicker} theme={theme} />
      <div style={{ fontFamily: theme.display, fontSize: 22 * u, color: theme.accent, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{scene.prefix || ""}{shown}{scene.suffix || ""}</div>
      <Sub text={scene.label} theme={theme} delay={10} />
    </Stage>
  );
}

function Compare({ scene, theme }) {
  const { u, vertical } = useUnit(); const a = useIn(4); const b = useIn(14);
  const Card = ({ side, p, color }) => (
    <div style={{ flex: 1, background: `${theme.fg}10`, border: `${0.4 * u}px solid ${color}`, borderRadius: 3 * u, padding: 4 * u, opacity: p, transform: `translateY(${(1 - p) * 6 * u}px)` }}>
      <div style={{ fontFamily: theme.display, fontSize: 5.5 * u, color }}>{side.title}</div>
      {(side.points || []).map((x, i) => <div key={i} style={{ fontSize: 3.8 * u, marginTop: 1.6 * u, color: theme.fg }}>• {x}</div>)}
    </div>
  );
  return (
    <Stage style={{ alignItems: "stretch" }}>
      {scene.heading ? <Heading text={scene.heading} theme={theme} size={6} delay={0} /> : null}
      <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", gap: 3 * u, alignItems: "stretch" }}>
        <Card side={scene.left} p={a} color={theme.accent} />
        <div style={{ alignSelf: "center", fontFamily: theme.display, fontSize: 6 * u, color: theme.muted, opacity: b }}>VS</div>
        <Card side={scene.right} p={b} color={theme.accent2} />
      </div>
    </Stage>
  );
}

function Quote({ scene, theme }) {
  const { u } = useUnit(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const n = Math.round(interpolate(f, [4, (scene.seconds || 4) * fps * 0.7], [0, scene.text.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <Stage>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 18 * u, color: theme.accent, lineHeight: 0.5, height: 7 * u }}>“</div>
      <div style={{ fontSize: 6 * u, fontWeight: 700, textAlign: "center", lineHeight: 1.25 }}>{scene.text.slice(0, n)}<span style={{ opacity: 0 }}>{scene.text.slice(n)}</span></div>
      {scene.by ? <Sub text={`— ${scene.by}`} theme={theme} delay={Math.round((scene.seconds || 4) * fps * 0.7)} /> : null}
    </Stage>
  );
}

function ImageScene({ scene, theme }) {
  const { u } = useUnit(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = useIn(0, 18); const cp = useIn(8); const z = interpolate(f, [0, (scene.seconds || 4) * fps], [1.05, 1.18]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: p, overflow: "hidden" }}>
        <Img src={staticFile(scene.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z}) translateX(${interpolate(f, [0, (scene.seconds || 4) * fps], [0, -2 * u])}px)` }} />
        <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 40%, ${theme.bg}ee 100%)` }} />
      </AbsoluteFill>
      {scene.caption ? <div style={{ position: "absolute", top: 7 * u, left: 0, right: 0, textAlign: "center", fontFamily: theme.display, fontSize: 6 * u, textShadow: "0 4px 16px rgba(0,0,0,.8)", opacity: cp }}>{scene.caption}</div> : null}
      {scene.credit ? <div style={{ position: "absolute", top: 2 * u, right: 3 * u, fontSize: 2 * u, color: theme.muted }}>{scene.credit}</div> : null}
    </AbsoluteFill>
  );
}

function Timeline({ scene, theme }) {
  const { u, vertical } = useUnit(); const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const ev = scene.events || []; const span = (scene.seconds || 5) * fps * 0.8;
  const line = interpolate(f, [4, span], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Stage style={{ alignItems: "stretch" }}>
      {scene.heading ? <Heading text={scene.heading} theme={theme} size={6} delay={0} /> : null}
      <div style={{ position: "relative", display: "flex", flexDirection: vertical ? "column" : "row", justifyContent: "space-between", gap: 3 * u, marginTop: 4 * u }}>
        <div style={{ position: "absolute", background: theme.accent, borderRadius: u, ...(vertical ? { left: 2 * u, top: 0, width: 0.8 * u, height: `${line * 100}%` } : { top: 2 * u, left: 0, height: 0.8 * u, width: `${line * 100}%` }) }} />
        {ev.map((e, i) => {
          const p = spring({ frame: f - 4 - (i / Math.max(1, ev.length - 1)) * (span - 10), fps, config: { damping: 14 } });
          return (
            <div key={i} style={{ position: "relative", flex: 1, paddingTop: vertical ? 0 : 6 * u, paddingLeft: vertical ? 7 * u : 0, opacity: p, transform: `scale(${0.8 + 0.2 * p})` }}>
              <div style={{ position: "absolute", width: 4.6 * u, height: 4.6 * u, borderRadius: "50%", background: theme.accent2, border: `${0.6 * u}px solid ${theme.bg}`, ...(vertical ? { left: 0.1 * u, top: 0.4 * u } : { top: -0.1 * u, left: 0 }) }} />
              <div style={{ fontFamily: theme.display, fontSize: 5 * u, color: theme.accent }}>{e.year}</div>
              <div style={{ fontSize: 3.6 * u, marginTop: 1 * u }}>{e.text}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
}

function Icon({ scene, theme }) {
  // a big emoji/symbol "character" that bobs, with a statement next to it
  const { u, vertical } = useUnit(); const f = useCurrentFrame(); const p = useIn(0, 10);
  return (
    <Stage style={{ flexDirection: vertical ? "column" : "row", gap: 6 * u }}>
      <div style={{ fontSize: 28 * u, transform: `translateY(${Math.sin(f / 9) * 1.5 * u}px) rotate(${Math.sin(f / 14) * 4}deg) scale(${p})` }}>{scene.icon || "💡"}</div>
      <div style={{ maxWidth: vertical ? "100%" : "55%" }}><Heading text={scene.text} theme={theme} size={7} delay={6} />{scene.sub ? <Sub text={scene.sub} theme={theme} /> : null}</div>
    </Stage>
  );
}

export const SCENES = { title: Title, list: List, number: BigNumber, compare: Compare, quote: Quote, image: ImageScene, timeline: Timeline, icon: Icon };
