import React from "react";
import { Composition, staticFile } from "remotion";
import { Video } from "./Video.jsx";

// Everything comes from public/scenes.json: size, theme, and the scene list with each scene's
// narration audio and length (seconds, measured from the voiceover by scripts/voiceover.py).
export const sceneFrames = (scene, fps) => Math.max(1, Math.ceil((scene.seconds || 4) * fps));

export const Root = () => (
  <Composition
    id="Video"
    component={Video}
    fps={30}
    width={1920}
    height={1080}
    durationInFrames={300}
    defaultProps={{ data: null }}
    calculateMetadata={async ({ props }) => {
      const data = props.data || (await (await fetch(staticFile("scenes.json"))).json());
      const fps = data.fps || 30;
      const durationInFrames = data.scenes.reduce((n, s) => n + sceneFrames(s, fps), 0);
      return { durationInFrames, fps, width: data.width || 1920, height: data.height || 1080, props: { data } };
    }}
  />
);
