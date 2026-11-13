// 3D explainer kit: stage (lights, ground, sky), a frame-driven camera rig, a clay-toon material,
// and procedural props built from primitives (no downloads, nothing to license).
// Everything moves from useCurrentFrame(), so renders are deterministic.
import React, { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import * as THREE from "three";
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";

export const ease = Easing.bezier(0.33, 0, 0.2, 1);
export const lerp = (a, b, t) => a + (b - a) * t;
export const useT = (seconds) => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return Math.min(1, Math.max(0, f / Math.max(1, seconds * fps))); };

// ---------- look ----------
export function Clay({ color, outline = true, rough = 0.55, emissive }) {
  return (
    <>
      <meshStandardMaterial color={color} roughness={rough} metalness={0.05} emissive={emissive || "#000"} emissiveIntensity={emissive ? 0.6 : 0} />
      {outline ? <Outlines thickness={0.018} color="#1b1530" screenspace={false} /> : null}
    </>
  );
}

export function Stage({ theme, ground = true, fog = true }) {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.background = new THREE.Color(theme.sky || theme.bg);
    scene.fog = fog ? new THREE.Fog(theme.sky || theme.bg, 14, 34) : null;
  }, [scene, theme, fog]);
  return (
    <>
      <hemisphereLight args={[theme.skyLight || "#cfe8ff", theme.groundLight || "#3a2e4f", 0.9]} />
      <directionalLight position={[6, 10, 6]} intensity={2.1} castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0004} />
      <directionalLight position={[-6, 4, -4]} intensity={0.55} color={theme.rim || "#ffb38a"} />
      {ground ? (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
            <circleGeometry args={[40, 64]} />
            <meshStandardMaterial color={theme.ground || "#2b2346"} roughness={0.95} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} receiveShadow>
            <circleGeometry args={[3.2, 64]} />
            <meshStandardMaterial color={theme.pad || "#3b3160"} roughness={0.8} />
          </mesh>
        </group>
      ) : null}
    </>
  );
}

// Camera that is always moving: orbit + dolly + rise, keyed to scene progress t (0..1).
export function CameraRig({ t, from = {}, to = {}, target = [0, 1.2, 0], fov }) {
  const { camera, size } = useThree();
  const vertical = size.height > size.width;
  const A = { r: 9, a: -0.5, h: 3.2, ...from }, B = { r: 6.5, a: 0.35, h: 2.4, ...to };
  const k = ease(t);
  const r = lerp(A.r, B.r, k) * (vertical ? 1.35 : 1), a = lerp(A.a, B.a, k), h = lerp(A.h, B.h, k);
  useLayoutEffect(() => {
    camera.position.set(Math.sin(a) * r, h, Math.cos(a) * r);
    camera.lookAt(target[0], target[1], target[2]);
    camera.fov = fov || (vertical ? 50 : 38);
    camera.updateProjectionMatrix();
  });
  return null;
}

// ---------- props (procedural, original) ----------
// A tube that narrows from r0 at the start to r1 at the tip (tentacles, vines, ropes).
export function taperedTube(curve, r0, r1, seg = 48, radial = 12) {
  const geo = new THREE.TubeGeometry(curve, seg, 1, radial, false);
  const pos = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let j = 0; j <= seg; j++) {
    curve.getPointAt(j / seg, c);
    const r = r0 + (r1 - r0) * (j / seg);
    for (let k = 0; k <= radial; k++) {
      const idx = j * (radial + 1) + k;
      v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  pos.needsUpdate = true; geo.computeVertexNormals();
  return geo;
}
function Eye({ x, look = 0 }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow><sphereGeometry args={[0.22, 24, 24]} /><Clay color="#ffffff" /></mesh>
      <mesh position={[look * 0.05, 0, 0.16]}><sphereGeometry args={[0.1, 16, 16]} /><meshStandardMaterial color="#14101f" roughness={0.3} /></mesh>
      <mesh position={[look * 0.05 + 0.03, 0.04, 0.24]}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
    </group>
  );
}

export function Octopus({ color = "#ff7a8a", frame = 0, wave = 1, squash = 0, tuck = 0 }) {
  const tentacles = useMemo(() => Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2), []);
  return (
    <group>
      <mesh position={[0, 1.55 + squash * 0.5, -0.1]} scale={[1 - 0.55 * squash, 1.15 * (1 + 0.7 * squash), 1 - 0.55 * squash]} castShadow><sphereGeometry args={[0.95, 40, 40]} /><Clay color={color} /></mesh>
      <group position={[0, 1.45 + squash * 0.5, 0.72 * (1 - 0.5 * squash)]} scale={1 - 0.35 * squash}><Eye x={-0.33} look={Math.sin(frame / 25)} /><Eye x={0.33} look={Math.sin(frame / 25)} /></group>
      {tentacles.map((ang, i) => {
        const pts = [];
        for (let s = 0; s <= 10; s++) {
          const u = s / 10, rad = (0.55 + u * 1.5) * (1 - 0.85 * tuck);
          const wob = Math.sin(frame / 9 + i * 0.9 + u * 3.2) * 0.35 * u * wave;
          pts.push(new THREE.Vector3(Math.sin(ang + wob * 0.6) * rad, (tuck > 0 ? 0.95 - u * (1.1 + 1.8 * tuck) : Math.max(0.12, 0.95 - u * 1.1 + Math.abs(wob) * 0.3)), Math.cos(ang + wob * 0.6) * rad));
        }
        const curve = new THREE.CatmullRomCurve3(pts);
        const geo = taperedTube(curve, 0.2, 0.035);
        const tip = curve.getPoint(1);
        return (
          <group key={i}>
            <mesh geometry={geo} castShadow><Clay color={color} outline={false} /></mesh>
            <mesh position={tip} castShadow><sphereGeometry args={[0.04, 10, 10]} /><Clay color={color} outline={false} /></mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Globe({ frame = 0, color = "#3f8efc", land = "#4cc38a", pin }) {
  const ring = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);
  return (
    <group position={[0, 1.6, 0]} rotation={[0.35, frame / 90, 0]}>
      <mesh castShadow><sphereGeometry args={[1.5, 48, 48]} /><Clay color={color} /></mesh>
      {ring.map((i) => {
        const lat = Math.asin(((i * 0.618) % 1) * 1.6 - 0.8), lon = i * 2.399;
        const p = [Math.cos(lat) * Math.cos(lon) * 1.36, Math.sin(lat) * 1.36, Math.cos(lat) * Math.sin(lon) * 1.36];
        return (
          <mesh key={i} position={p} scale={0.42 + (i % 3) * 0.12}>
            <sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color={land} roughness={0.85} />
          </mesh>
        );
      })}
      {pin ? <Pin lat={pin.lat} lon={pin.lon} /> : null}
    </group>
  );
}
function Pin({ lat, lon }) {
  const phi = (90 - lat) * (Math.PI / 180), th = (lon + 180) * (Math.PI / 180);
  const p = new THREE.Vector3(-1.52 * Math.sin(phi) * Math.cos(th), 1.52 * Math.cos(phi), 1.52 * Math.sin(phi) * Math.sin(th));
  return (
    <group position={p} onUpdate={(g) => g.lookAt(p.clone().multiplyScalar(2))}>
      <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.12, 0.5, 16]} /><Clay color="#ff5470" /></mesh>
      <mesh position={[0, 0, 0.55]}><sphereGeometry args={[0.17, 16, 16]} /><Clay color="#ff5470" /></mesh>
    </group>
  );
}

export function Coin({ color = "#ffc94d" }) {
  return <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.6, 0.6, 0.14, 40]} /><Clay color={color} rough={0.35} /></mesh>;
}
export function Gear({ frame = 0, color = "#9aa7ff", size = 1 }) {
  return (
    <group rotation={[0, 0, frame / 30]} scale={size}>
      <mesh castShadow><cylinderGeometry args={[0.8, 0.8, 0.3, 32]} /><Clay color={color} /></mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[Math.cos((i / 10) * Math.PI * 2) * 0.95, 0, Math.sin((i / 10) * Math.PI * 2) * 0.95]} rotation={[0, -(i / 10) * Math.PI * 2, 0]} castShadow>
          <boxGeometry args={[0.32, 0.3, 0.26]} /><Clay color={color} outline={false} />
        </mesh>
      ))}
    </group>
  );
}
export function Rocket({ frame = 0 }) {
  return (
    <group position={[0, 1.2 + Math.sin(frame / 12) * 0.08, 0]}>
      <mesh castShadow><capsuleGeometry args={[0.45, 1.3, 8, 24]} /><Clay color="#f0ebd8" /></mesh>
      <mesh position={[0, 1.25, 0]} castShadow><coneGeometry args={[0.45, 0.6, 24]} /><Clay color="#ff5470" /></mesh>
      <mesh position={[0, 0.3, 0.42]}><sphereGeometry args={[0.18, 16, 16]} /><Clay color="#5bc0be" /></mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.sin(i * 2.09) * 0.45, -0.6, Math.cos(i * 2.09) * 0.45]} rotation={[0, i * 2.09, 0]} castShadow><boxGeometry args={[0.08, 0.6, 0.4]} /><Clay color="#ff5470" /></mesh>
      ))}
      <mesh position={[0, -1.15, 0]} scale={[1, 1 + Math.sin(frame / 2) * 0.2, 1]}><coneGeometry args={[0.3, 0.7, 16]} /><meshBasicMaterial color="#ffb347" /></mesh>
    </group>
  );
}
export function Shell({ color = "#c8a27a" }) {
  return (
    <group position={[0, 0.5, 0]}>
      <mesh rotation={[Math.PI, 0, 0]} castShadow><sphereGeometry args={[0.9, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} /></mesh>
    </group>
  );
}
export function Box({ color = "#5bc0be", size = [1, 1, 1] }) {
  return <mesh castShadow><boxGeometry args={size} /><Clay color={color} /></mesh>;
}
export function Brainish({ frame = 0, color = "#ff9ec4" }) {
  // a lumpy "brain" blob made of overlapping spheres
  return (
    <group position={[0, 1.6, 0]} rotation={[0, frame / 60, 0]} scale={1.7}>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 1.3) * 0.55, Math.cos(i * 2.1) * 0.3, Math.cos(i * 1.3) * 0.45]} castShadow>
          <sphereGeometry args={[0.45, 24, 24]} /><Clay color={color} outline={i % 3 === 0} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- story props: scenery the characters act with ----------
export function Tank({ size = [3.2, 2.4, 2.2], water = "#4fc3f7" }) {
  return (
    <group position={[0, size[1] / 2, 0]}>
      <mesh><boxGeometry args={[size[0], size[1] * 0.8, size[2]]} /><meshStandardMaterial color={water} transparent opacity={0.35} roughness={0.1} /></mesh>
      <mesh><boxGeometry args={size} /><meshPhysicalMaterial color="#e8f7ff" transparent opacity={0.18} roughness={0.05} metalness={0} /></mesh>
      <mesh position={[0, -size[1] / 2 - 0.15, 0]} castShadow receiveShadow><boxGeometry args={[size[0] + 0.2, 0.3, size[2] + 0.2]} /><Clay color="#3d3a5c" /></mesh>
    </group>
  );
}
// A pipe between two points (see-through, so you can watch what's inside it)
export function Pipe({ from = [0, 0, 0], to = [3, 0, 0], radius = 0.35, color = "#b8c4d6" }) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to), mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b), q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return (
    <group position={mid} quaternion={q}>
      <mesh><cylinderGeometry args={[radius, radius, len, 32, 1, true]} /><meshStandardMaterial color={color} transparent opacity={0.42} roughness={0.2} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, len / 2, 0]}><torusGeometry args={[radius, 0.06, 12, 32]} /><Clay color={color} outline={false} /></mesh>
      <mesh position={[0, -len / 2, 0]}><torusGeometry args={[radius, 0.06, 12, 32]} /><Clay color={color} outline={false} /></mesh>
    </group>
  );
}
export function Sea({ frame = 0, color = "#2f80ed", position = [0, 0, 0], size = 30 }) {
  return (
    <mesh position={[position[0], position[1] + 0.03 + Math.sin(frame / 20) * 0.03, position[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[size, 64]} /><meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
    </mesh>
  );
}
export function Rock({ color = "#8a8fa3", scale = 1 }) {
  return <mesh scale={[scale * 1.2, scale * 0.8, scale]} castShadow><dodecahedronGeometry args={[0.6, 0]} /><Clay color={color} /></mesh>;
}
export function Seaweed({ frame = 0, color = "#3fbf7f", height = 2 }) {
  const pts = Array.from({ length: 8 }, (_, i) => new THREE.Vector3(Math.sin(frame / 15 + i * 0.7) * 0.12 * i / 7, (i / 7) * height, 0));
  return <mesh geometry={taperedTube(new THREE.CatmullRomCurve3(pts), 0.09, 0.02, 24, 8)} castShadow><Clay color={color} outline={false} /></mesh>;
}
export function ShellHalves({ close = 0, color = "#a9744f" }) {
  // two coconut halves that close around whatever is inside (close 0 = open, 1 = shut)
  return (
    <group position={[0, 0.9, 0]}>
      <mesh rotation={[Math.PI, 0, 0]} castShadow><sphereGeometry args={[1.25, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} /></mesh>
      <group position={[-1.25, 0, 0]} rotation={[0, 0, -(1 - close) * 2.2]}>
        <mesh position={[1.25, 0, 0]} castShadow><sphereGeometry args={[1.25, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  );
}

// Look up a prop by name (scenes.json "model": "octopus" | "globe" | ...)
export const PROPS = { octopus: Octopus, globe: Globe, coin: Coin, gear: Gear, rocket: Rocket, shell: Shell, box: Box, brain: Brainish,
  tank: Tank, pipe: Pipe, sea: Sea, rock: Rock, seaweed: Seaweed, shellHalves: ShellHalves };
export function Prop({ name, frame, ...rest }) {
  const P = PROPS[name] || Box;
  return <P frame={frame} {...rest} />;
}
