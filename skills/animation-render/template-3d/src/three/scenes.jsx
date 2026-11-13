// 3D scene types for scenes.json. Each scene = a 3D shot (ThreeCanvas) + crisp HTML text on top.
// The camera always moves (orbit/dolly), objects pop in on springs, labels sit in the top third
// so the burned-in captions keep the bottom band. Works at 1920x1080 and 1080x1920.
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Stage, CameraRig, Prop, Clay, lerp, ease } from "./kit.jsx";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";

const useUnit = () => { const { width, height } = useVideoConfig(); return { u: Math.min(width, height) / 100, vertical: height > width, width, height }; };
const useSpring = (delay = 0, damping = 12) => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return spring({ frame: f - delay, fps, config: { damping } }); };
const sceneT = (scene) => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return Math.min(1, f / Math.max(1, (scene.seconds || 4) * fps)); };

function Shot({ theme, children, ground = true }) {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ position: [0, 3, 9], fov: 40 }}>
      <Stage theme={theme} ground={ground} />
      {children}
    </ThreeCanvas>
  );
}

function Label({ kicker, title, sub, theme, delay = 4, top = 0.07 }) {
  const { u, vertical, height } = useUnit(); const p = useSpring(delay);
  if (!title && !kicker) return null;
  return (
    <div style={{ position: "absolute", top: height * (vertical ? top + 0.05 : top), left: 0, right: 0, textAlign: "center", padding: "0 6%", opacity: p, transform: `translateY(${(1 - p) * 3 * u}px)` }}>
      {kicker ? <div style={{ fontSize: 3 * u, letterSpacing: "0.2em", fontWeight: 800, color: theme.accent, textTransform: "uppercase", textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{kicker}</div> : null}
      {title ? <div style={{ fontFamily: theme.display, fontSize: (vertical ? 8 : 7) * u, lineHeight: 1.02, color: theme.fg, textShadow: "0 6px 24px rgba(0,0,0,.55)" }}>{title}</div> : null}
      {sub ? <div style={{ fontSize: 3.6 * u, color: theme.fg, opacity: 0.85, marginTop: u, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{sub}</div> : null}
    </div>
  );
}

// hero: one prop on a pedestal, the camera glides around it
function Hero({ scene, theme }) {
  const f = useCurrentFrame(); const t = sceneT(scene); const s = useSpring(0, 10);
  return (
    <AbsoluteFill>
      <Shot theme={theme}>
        <CameraRig t={t} from={scene.cameraFrom} to={scene.cameraTo} target={[0, 1.3, 0]} />
        <group scale={s * (scene.scale || 1)}><Prop name={scene.model} frame={f} color={scene.color} /></group>
      </Shot>
      <Label kicker={scene.kicker} title={scene.title || scene.text} sub={scene.sub} theme={theme} />
    </AbsoluteFill>
  );
}

// count: a number counts up while instanced dots fill the space (e.g. neurons, people, stars)
function Count({ scene, theme }) {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sceneT(scene);
  const N = Math.min(600, scene.dots || 400);
  const shown = Math.floor(N * interpolate(f, [4, (scene.seconds || 3) * fps * 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const target = parseFloat(String(scene.value).replace(/[^0-9.]/g, "")) || 0;
  const k = interpolate(f, [4, (scene.seconds || 3) * fps * 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const decimals = (String(scene.value).split(".")[1] || "").replace(/[^0-9]/g, "").length;
  const num = (target * (1 - Math.pow(1 - k, 3))).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const { u, vertical, height } = useUnit();
  return (
    <AbsoluteFill>
      <Shot theme={theme}>
        <CameraRig t={t} from={{ r: 10, a: -0.3, h: 4 }} to={{ r: 7, a: 0.4, h: 3 }} target={[0, 1.6, 0]} />
        {scene.model ? <group scale={0.8}><Prop name={scene.model} frame={f} color={scene.color} /></group> : null}
        {Array.from({ length: shown }, (_, i) => {
          const g = i * 2.39996, y = 1 - (i / N) * 2, rr = Math.sqrt(1 - y * y) * 2.6;
          const pulse = 1 + Math.sin(f / 6 + i) * 0.25;
          return (
            <mesh key={i} position={[Math.cos(g) * rr, 1.7 + y * 1.6, Math.sin(g) * rr]} scale={0.07 * pulse}>
              <sphereGeometry args={[1, 8, 8]} /><meshStandardMaterial color={i % 5 ? theme.accent2 : theme.accent} emissive={i % 5 ? theme.accent2 : theme.accent} emissiveIntensity={0.7} />
            </mesh>
          );
        })}
      </Shot>
      <div style={{ position: "absolute", top: height * (vertical ? 0.1 : 0.06), left: 0, right: 0, textAlign: "center" }}>
        {scene.kicker ? <div style={{ fontSize: 3 * u, letterSpacing: "0.2em", fontWeight: 800, color: theme.accent, textTransform: "uppercase" }}>{scene.kicker}</div> : null}
        <div style={{ fontFamily: theme.display, fontSize: 16 * u, color: theme.fg, lineHeight: 1, textShadow: "0 8px 30px rgba(0,0,0,.6)", fontVariantNumeric: "tabular-nums" }}>{scene.prefix || ""}{num}{scene.suffix || ""}</div>
        {scene.label ? <div style={{ fontSize: 4 * u, color: theme.fg, opacity: 0.9, textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>{scene.label}</div> : null}
      </div>
    </AbsoluteFill>
  );
}

// compare: two columns grow side by side (values in any unit), labels above
function Compare({ scene, theme }) {
  const f = useCurrentFrame(); const t = sceneT(scene); const { fps } = useVideoConfig();
  const L = scene.left || {}, R = scene.right || {};
  const max = Math.max(Number(L.value) || 1, Number(R.value) || 1);
  const g = (d) => spring({ frame: f - d, fps, config: { damping: 14 }, durationInFrames: 30 });
  const hl = (Number(L.value) || 1) / max * 4 * g(6), hr = (Number(R.value) || 1) / max * 4 * g(16);
  const { u, vertical, height } = useUnit();
  return (
    <AbsoluteFill>
      <Shot theme={theme}>
        <CameraRig t={t} from={{ r: 10, a: -0.25, h: 3 }} to={{ r: 8.5, a: 0.2, h: 2.6 }} target={[0, 2, 0]} />
        <mesh position={[-1.3, hl / 2, 0]} castShadow><boxGeometry args={[1.4, Math.max(0.01, hl), 1.4]} /><Clay color={theme.accent} /></mesh>
        <mesh position={[1.3, hr / 2, 0]} castShadow><boxGeometry args={[1.4, Math.max(0.01, hr), 1.4]} /><Clay color={theme.accent2} /></mesh>
      </Shot>
      <Label title={scene.heading} theme={theme} delay={0} />
      <div style={{ position: "absolute", top: height * (vertical ? 0.3 : 0.25), left: "8%", right: "8%", display: "flex", justifyContent: "space-between", fontFamily: theme.display, fontSize: 4.6 * u, textShadow: "0 3px 14px rgba(0,0,0,.7)" }}>
        <div style={{ color: theme.accent, opacity: g(10) }}>{L.title}<div style={{ fontSize: 3.4 * u, color: theme.fg }}>{L.label || ""}</div></div>
        <div style={{ color: theme.accent2, opacity: g(20), textAlign: "right" }}>{R.title}<div style={{ fontSize: 3.4 * u, color: theme.fg }}>{R.label || ""}</div></div>
      </div>
    </AbsoluteFill>
  );
}

// globe: a spinning globe, optional pin at lat/lon, camera pushes in
function GlobeScene({ scene, theme }) {
  const f = useCurrentFrame(); const t = sceneT(scene);
  return (
    <AbsoluteFill>
      <Shot theme={theme} ground={false}>
        <CameraRig t={t} from={{ r: 9, a: -0.4, h: 2.2 }} to={{ r: 5.5, a: 0.1, h: 1.9 }} target={[0, 1.6, 0]} />
        <Prop name="globe" frame={f} pin={scene.pin} />
      </Shot>
      <Label kicker={scene.kicker} title={scene.title} sub={scene.sub} theme={theme} />
    </AbsoluteFill>
  );
}

// timeline: the camera dollies along a row of posts; the current event's text is on top
function Timeline({ scene, theme }) {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sceneT(scene);
  const ev = scene.events || [];
  const idx = Math.min(ev.length - 1, Math.floor(t * ev.length * 0.999));
  const x = lerp(-((ev.length - 1) * 3) / 2, ((ev.length - 1) * 3) / 2, t);
  const { u, vertical, height } = useUnit();
  return (
    <AbsoluteFill>
      <Shot theme={theme}>
        <CameraRig t={0} from={{ r: 7, a: 0.35, h: 2.6 }} to={{ r: 7, a: 0.35, h: 2.6 }} target={[0, 1.2, 0]} />
        <group position={[-x, 0, 0]}>
          {ev.map((e, i) => {
            const px = (i - (ev.length - 1) / 2) * 3, on = i <= idx;
            return (
              <group key={i} position={[px, 0, 0]}>
                <mesh position={[0, 0.9, 0]} castShadow><cylinderGeometry args={[0.12, 0.12, 1.8, 16]} /><Clay color={on ? theme.accent : "#6b6890"} /></mesh>
                <mesh position={[0, 1.9, 0]} castShadow scale={on ? 1 : 0.7}><sphereGeometry args={[0.32, 24, 24]} /><Clay color={on ? theme.accent2 : "#6b6890"} /></mesh>
              </group>
            );
          })}
          <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.05, 0.05, ev.length * 3 + 2, 8]} /><meshStandardMaterial color={theme.accent} /></mesh>
        </group>
      </Shot>
      <Label title={scene.heading} theme={theme} delay={0} />
      {ev[idx] ? (
        <div key={idx} style={{ position: "absolute", top: height * (vertical ? 0.28 : 0.22), left: 0, right: 0, textAlign: "center", textShadow: "0 3px 14px rgba(0,0,0,.7)" }}>
          <div style={{ fontFamily: theme.display, fontSize: 7 * u, color: theme.accent }}>{ev[idx].year}</div>
          <div style={{ fontSize: 4.2 * u, color: theme.fg }}>{ev[idx].text}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

// parts: a prop with up to 4 callout tags that pop in around it
function Parts({ scene, theme }) {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = sceneT(scene);
  const items = (scene.items || []).slice(0, 4);
  const per = Math.max(8, Math.floor(((scene.seconds || 4) * fps * 0.7) / Math.max(1, items.length)));
  const { u, vertical } = useUnit();
  const spots = vertical ? [[8, 30], [52, 30], [8, 58], [52, 58]] : [[6, 26], [66, 26], [6, 60], [66, 60]];
  return (
    <AbsoluteFill>
      <Shot theme={theme}>
        <CameraRig t={t} from={scene.cameraFrom || { r: 8, a: 0.6, h: 3 }} to={scene.cameraTo || { r: 6.2, a: -0.3, h: 2.4 }} target={[0, 1.3, 0]} />
        <Prop name={scene.model} frame={f} color={scene.color} />
      </Shot>
      <Label title={scene.heading} theme={theme} delay={0} top={0.05} />
      {items.map((it, i) => {
        const p = spring({ frame: f - 8 - i * per, fps, config: { damping: 12 } });
        return (
          <div key={i} style={{ position: "absolute", left: `${spots[i][0]}%`, top: `${spots[i][1]}%`, width: vertical ? "40%" : "28%", padding: `${1.6 * u}px ${2.2 * u}px`, borderRadius: 2 * u,
            background: "rgba(255,255,255,0.92)", color: "#1b1530", fontWeight: 800, fontSize: 3.6 * u, boxShadow: "0 10px 30px rgba(0,0,0,.35)", opacity: p, transform: `scale(${0.6 + 0.4 * p})` }}>
            <span style={{ color: theme.accent, marginRight: u }}>{i + 1}</span>{it}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ---------- action: characters act out the narration ----------
// Every item (actor or prop) is { model, keys: [{ t, pos, rot, scale, ...any numeric prop }], ...static props }.
// t is scene progress 0..1. Numbers and arrays are eased between keys; other values come from the last key.
// "camera": { keys: [{ t, pos, look, fov }] }. Use it for anything the voice describes happening.
// forward-fill: a key that leaves out a value keeps the previous key's value
const filled = new WeakMap();
function fill(keys) {
  if (filled.has(keys)) return filled.get(keys);
  let prev = {}; const out = keys.map((k) => (prev = { ...prev, ...k }));
  filled.set(keys, out); return out;
}
export function keyAt(rawKeys, t) {
  if (!rawKeys || !rawKeys.length) return {};
  const keys = fill(rawKeys);
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) {
      const k = ease((t - a.t) / Math.max(1e-6, b.t - a.t)), out = { ...a };
      for (const f of Object.keys(b)) {
        if (typeof a[f] === "number" && typeof b[f] === "number") out[f] = lerp(a[f], b[f], k);
        else if (Array.isArray(a[f]) && Array.isArray(b[f])) out[f] = a[f].map((v, j) => lerp(v, b[f][j], k));
        else if (!(f in a)) out[f] = b[f];
      }
      return out;
    }
  }
  return keys[keys.length - 1];
}
function KeyCamera({ keys, t }) {
  const { camera, size } = useThree();
  const k = keyAt(keys, t);
  useLayoutEffect(() => {
    const p = k.pos || [0, 3, 9], l = k.look || [0, 1, 0];
    camera.position.set(p[0], p[1], p[2]); camera.lookAt(l[0], l[1], l[2]);
    camera.fov = k.fov || (size.height > size.width ? 50 : 38); camera.updateProjectionMatrix();
  });
  return null;
}
function Item({ item, t, frame }) {
  const { model, keys, ...stat } = item;
  const k = keyAt(keys, t);
  const { pos = stat.pos || [0, 0, 0], rot = stat.rot || 0, scale = stat.scale || 1, t: _t, ...live } = { ...stat, ...k };
  return (
    <group position={pos} rotation={[0, rot, 0]} scale={scale}>
      <Prop name={model} frame={frame} {...live} />
    </group>
  );
}
function Action({ scene, theme }) {
  const f = useCurrentFrame(); const t = sceneT(scene);
  return (
    <AbsoluteFill>
      <Shot theme={theme} ground={scene.ground !== false}>
        {scene.camera ? <KeyCamera keys={scene.camera.keys} t={t} /> : <CameraRig t={t} target={[0, 1.2, 0]} />}
        {(scene.items || []).map((it, i) => <Item key={i} item={it} t={t} frame={f} />)}
      </Shot>
      <Label kicker={scene.kicker} title={scene.title} sub={scene.sub} theme={theme} />
    </AbsoluteFill>
  );
}

// title: big title over a slow orbit of the hero prop
function Title({ scene, theme }) { return <Hero scene={{ ...scene, title: scene.text || scene.title }} theme={theme} />; }

export const SCENES = { action: Action, title: Title, hero: Hero, count: Count, number: Count, compare: Compare, globe: GlobeScene, timeline: Timeline, parts: Parts, list: Parts, icon: Hero };
