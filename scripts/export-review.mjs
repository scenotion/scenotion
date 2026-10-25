import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [input, name] = process.argv.slice(2);

if (!input || !name) {
  console.error("Usage: npm run review -- <input.mp4> <review-name>");
  process.exit(1);
}

const source = path.resolve(input);
const outputDir = path.resolve("reviews");
const output = path.join(outputDir, name + "-720p.mp4");
mkdirSync(outputDir, { recursive: true });

const result = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-v",
    "error",
    "-i",
    source,
    "-vf",
    "scale=1280:720:flags=lanczos",
    "-an",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "14",
    "-tune",
    "animation",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    output,
  ],
  { stdio: "inherit" },
);

if (result.error) {
  console.error("ffmpeg could not start: " + result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(output);
