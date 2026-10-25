<h1 align="center">Scenotion</h1>

<p align="center">
  <strong>English</strong>
  &nbsp;·&nbsp;
  <a href="./README.zh-CN.md">简体中文</a>
</p>

Scenotion is a Motion Canvas component layer for technical videos. It renders code walkthroughs, diffs, annotations, diagrams, algorithm traces and equations; basic 3D is planned.

Scenotion is independent and not affiliated with Motion Canvas.

## Scope

`0.1.0` is the code-scene milestone.

Implemented:

- Lezer highlighters for TS, JS, JSON and Python.
- `CodeStage`: filename, language, line numbers, focus, auto-fit, clipped viewport.
- Line-aware code transitions with insert/replace/remove handling.
- File tabs, side-by-side diff and scrolling viewport.
- Callout, underline, bracket and line annotations that follow line plans.
- Transition presets for code, files and annotations.
- 4K60 metadata and FFmpeg MP4 export.

Not implemented:

- Localization catalog, locale variants and per-locale rendering.
- Audio, voiceover synchronization, captions and subtitle export.
- 3D, model loading, SDF shaders and simulation.
- Math/paper layout components, data-driven diagrams and algorithm traces.
- Batch/headless rendering, parameterized variants and codecs.
- Automated tests and CI.

The CLIFF, architecture and algorithm projects are static visual demos. The CLIFF project does not parse CLIFF.

## Run

~~~bash
npm install
npm run serve
~~~

Vite prints the editor URL. All projects are registered in `vite.config.ts`.

| Script | Purpose |
| --- | --- |
| `npm run serve` | Motion Canvas editor and preview |
| `npm run check` | TypeScript check |
| `npm run build` | Type check, then production build |
| `npm run review` | 720p review export from an MP4 |

There is no `npm test` yet.

## Projects

| Project | Entry | Status |
| --- | --- | --- |
| Code Workflow | `src/projects/code-workflow.ts` | Code scene |
| Code Diff | `src/projects/code-diff.ts` | Code scene |
| Code Viewport | `src/projects/code-scroll.ts` | Code scene |
| Code Tabs | `src/projects/code-tabs.ts` | Code scene |
| Code Annotations | `src/projects/code-annotations.ts` | Code scene |
| Code Transition Debug | `src/projects/code-transition-debug.ts` | Code scene |
| Feature Validation | `src/projects/feature-validation.ts` | Review reel |
| CLIFF Format | `src/projects/cliff-format.ts` | Static demo |
| Architecture | `src/projects/architecture.ts` | Static demo |
| Algorithms | `src/projects/algorithms.ts` | Static demo |

## Code API

~~~tsx
const code = createRef<Code>();
const transition = createCodeTransition("smooth");

view.add(
  <CodeStage
    codeRef={code}
    code={before}
    nextCode={after}
    transition={transition}
    filename="resolver.ts"
    language="ts"
    focus={lines(5, 6)}
  />,
);

yield* transition.play();
~~~

- `CodeStage` handles one `nextCode` target. Multi-step sequences are not implemented.
- Annotations created through `createCodeAnnotations(code)` re-anchor after a line-plan transition; standalone `createCodeAnnotation(code, spec)` does not.
- The viewport scrolls vertically. Long lines are clipped, not wrapped.
- Supported languages are fixed in `src/code/highlight.ts`.

## Render

Story projects use 1920x1080 design coordinates, 2.0x render scale, 60 fps and the FFmpeg exporter. Feature Validation uses 1.0x at 1080p for review.

~~~bash
npm run review -- "output/Feature Validation.mp4" feature-validation
~~~

The review script is video-only (`-an`). Use the original render for audio.

## Structure

~~~text
src/
  code/        code rendering, transitions, annotations
  components/  reusable visual components
  scenes/      scene implementations
  projects/    project entries and .meta settings
  theme/       tokens and SceneFrame
docs/          design notes
~~~

## Docs

- [Transition presets](./docs/transitions.md)
- [Third-party notices](./THIRD_PARTY_NOTICES.md)

## License

MIT. See [LICENSE](./LICENSE).

Copyright (c) 2026 Saikel-Orado-Liu aka GameGeek-Saikel.
