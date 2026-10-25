import { defineConfig } from "vite";
import motionCanvasModule from "@motion-canvas/vite-plugin";
import ffmpegModule from "@motion-canvas/ffmpeg";

type Interop<T> = T | { default: T };

function interop<T>(module: Interop<T>): T {
  return (module as { default?: T }).default ?? (module as T);
}

const motionCanvas = interop(motionCanvasModule);
const ffmpeg = interop(ffmpegModule);

export default defineConfig({
  plugins: [
    motionCanvas({
      project: [
        "./src/projects/code-workflow.ts",
        "./src/projects/code-diff.ts",
        "./src/projects/code-scroll.ts",
        "./src/projects/code-tabs.ts",
        "./src/projects/code-annotations.ts",
        "./src/projects/code-transition-debug.ts",
        "./src/projects/feature-validation.ts",
        "./src/projects/cliff-format.ts",
        "./src/projects/architecture.ts",
        "./src/projects/algorithms.ts",
      ],
    }),
    ffmpeg(),
  ],
});
