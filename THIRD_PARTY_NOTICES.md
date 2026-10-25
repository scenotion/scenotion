# Third-Party Notices

Scenotion source is MIT. Direct dependencies:

| Package | Version | License |
| --- | --- | --- |
| `@motion-canvas/core` | 3.17.2 | MIT |
| `@motion-canvas/2d` | 3.17.2 | MIT |
| `@motion-canvas/ffmpeg` | 3.17.2 | MIT |
| `@motion-canvas/ui` | 3.17.2 | MIT |
| `@motion-canvas/vite-plugin` | 3.17.2 | MIT |
| `@codemirror/language` | 6.13.1 | MIT |
| `@lezer/highlight` | 1.2.5 | MIT |
| `@lezer/javascript` | 1.5.6 | MIT |
| `@lezer/json` | 1.0.3 | MIT |
| `@lezer/python` | 1.1.19 | MIT |
| `diff` | 9.0.0 | BSD-3-Clause |
| `vite` | 5.4.21 | MIT |
| `typescript` | 5.9.3 | Apache-2.0 |
| `cross-env` | 10.1.0 | MIT |

The full graph is in `package-lock.json`.

## FFmpeg

`@motion-canvas/ffmpeg` uses `@ffmpeg-installer/ffmpeg`.

- `@ffmpeg-installer/ffmpeg` declares LGPL-2.1.
- The resolved Windows binary, `@ffmpeg-installer/win32-x64@4.1.0`, declares GPLv3.
- FFmpeg is called as an external process; it is not linked into Scenotion source.
- Redistributing the binary requires compliance with its license, including source-offer obligations for a GPL build.

## Fonts and media

No font or media binaries are bundled. The theme references installed font families only.

## Motion Canvas

Motion Canvas is MIT-licensed. Scenotion is independent and not affiliated with it.
