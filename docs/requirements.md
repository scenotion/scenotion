# Scenotion Requirements

Status: v0.4 near-term baseline. Last updated: 2026-10-27.
Companion docs: parity.md, assets.md.

## 1. Product

Scenotion is a local-first, open-source technical video workbench built on Motion Canvas.
It covers code explainers and technical videos with code-first scenes, in-project voiceover
recording and alignment, localized variants, and batch export.

Target users: technical educators, indie creators, small content teams. Windows + Chromium first.

## 2. Parity

Parity means usage parity, not ecosystem or API parity. We track three layers:

1. Authoring: compose scenes, sequences, props, assets, code stories.
2. Workflow: preview, record voiceover, caption, localize, render, batch.
3. Quality: deterministic rendering, docs, tests, licensing.

Reference versions: Motion Canvas 3.17.2, Remotion 4.0.539, Code Hike 1.1.0.
The living matrix is in parity.md. Do not claim "complete parity"; state what is supported.

Non-goals: Remotion Lambda/Cloud Run/Player/Studio clone, Ae-level VFX, professional DAW,
cloud collaboration, interactive web code blocks, SDF/fluid/particle simulation, 3D engine.

## 3. User journeys

| Journey | User | Must be able to |
| --- | --- | --- |
| J1 | Remotion user | Define video/scenes/sequences, pass props, use assets, render MP4 |
| J2 | Code Hike user | Write a multi-step code story, focus, annotate, diff, scroll |
| J3 | Narrator | Record, review, trim, align, retake voiceover inside the project |
| J4 | Localizer | Switch text/voice/captions, batch-render en-US and zh-CN |
| J5 | Science explainer | Use equations, paper layout, diagrams, algorithm traces |

## 4. Locked decisions

| Area | Decision |
| --- | --- |
| 3D | Deferred. Keep a documented compatibility seam only; no implementation now. |
| Timeline | Hybrid: fixed visual timing, line-anchored voiceover, manual beat extension. No auto reflow. |
| Voiceover | Line-based recording first; continuous/punch-in later. |
| Audio persistence | Local Vite server writes to ignored voiceover/ directory; static build is preview-only. |
| Output | Project render profile; default per-locale MP4 + sidecar SRT; optional multi-track master. |
| UI localization | Non-invasive editor wrapper first; fork only if coverage/stability fails. |
| Fonts | Project assets, not a Scenotion feature. Cloud or local; no bundled/default fonts. |
| Locales | en-US and zh-CN first. |
| Test project | Extend the existing feature-validation project at 720p. |
| Assets | No binary assets in Git; local/private directories are ignored. No cleanup of existing tracked files now. |
| Push | Local commits only unless the user reviews and requests a push. |

## 5. Requirements

Priority: M = required for the near-term video; S = strong follow-up; C = later; N = non-goal.

### 5.1 Video and rendering

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| V-01 | M | Video manifest: id, scenes, locales, render profile | One project can declare multiple locales and outputs |
| V-02 | M | Scene order, beats, fade/slide/wait transitions | Three scenes render in order |
| V-03 | M | Project variables / props | Same code renders different variants |
| V-04 | M | Headless batch CLI: project, locale, fps, scale, range | One command renders the test reel |
| V-05 | M | Render profile: per-locale files, captions mode, audio mode | User can choose output shape |
| V-06 | M | Deterministic time, random seed, fonts | Same frame renders identically twice |
| V-07 | S | Still frames and thumbnails | Cover frame export |
| V-08 | S | Progress, retry, resume | Long render can resume |
| V-09 | N | Lambda/Cloud Run/remote rendering | Not implemented |

### 5.2 Code and Code Hike parity

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| C-01 | M | CodeStage: filename, language, line numbers, focus, auto-fit, viewport | No 64-line gutter limit |
| C-02 | M | CodeStory: multiple steps, next/goTo/play, per-step code/focus/line states/annotations/scroll/hold | Five-step walkthrough can go forward/backward |
| C-03 | M | Annotations: callout, underline, bracket, line, mark/word highlight, ref/footnote | Annotations follow code edits |
| C-04 | M | Focus animation and auto-scroll | Focus change lands on the intended range |
| C-05 | M | Long-line policy: clip, horizontal scroll, shrink, wrap | 100+ column code remains readable |
| C-06 | M | Languages and themes: TS, JS, JSON, Python, C/C++, Rust, Go, Java, SQL, YAML, Markdown, HTML, CSS; dark/light | Common languages highlight |
| C-07 | S | Diff: side-by-side or unified, line and word diff, animated | Animated before/after |
| C-08 | S | Terminal and pseudocode blocks | Terminal and algorithm pseudocode |
| C-09 | S | Layouts: code + prose (scrollycoding), slideshow, spotlight | Narrative code layout |
| C-10 | S | Load code from files; optional Code Hike-style comment annotations | Code can come from a file |
| C-11 | M | Performance: 500 lines, 20 steps, 4K, no node explosion | Reference scene renders reliably |

### 5.3 Voiceover and audio

Voiceover is a core workflow, not an add-on. It must be comfortable, but it is not a DAW.

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| A-01 | M | Microphone recording: device picker, permission, input meter, 48 kHz mono, countdown/preroll | Select mic and record after 3-2-1 |
| A-02 | M | Record against video preview, optional muted guide track, headphone hint | Voice and picture stay aligned |
| A-03 | M | Save immediately to local project, crash recovery, autosave | Closing the tab does not lose a take |
| A-04 | M | Takes per line: play, select active, delete, import external audio | A/B compare two takes |
| A-05 | M | Waveform editor: zoom, playhead, trim, offset, gain, fade in/out, normalize | Non-destructive and undoable |
| A-06 | M | Alignment: snap to line/scene/beat/playhead, plus/minus 10 ms nudge, latency calibration | 30 s take synchronized within 50 ms |
| A-07 | M | Script model: stable line ids, per-locale text, beat anchor, duration budget | Same line id across locales |
| A-08 | M | Per-locale voice tracks; switch preview; duration comparison | English and Chinese do not mix |
| A-09 | M | Basic mix: voice + music + SFX, ducking, fades, loudness normalization | Preview and export sound balanced |
| A-10 | M | Privacy: recordings stay local, ignored by Git, never uploaded | No recording in git status |
| A-11 | S | Continuous recording, punch-in, multi-take comping | Later enhancement |
| A-12 | C | Time-stretch, noise reduction, EQ, compression, spectral editing | Later; no DAW scope |
| A-13 | M | Chromium-based browser support and clear unsupported-browser message | Firefox/Safari documented |

### 5.4 Captions

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| S-01 | M | Caption cues: start, end, text, speaker, optional word timings | Per-locale cues |
| S-02 | M | Generate cues from narration lines; edit text and timing | Recording a line creates a cue |
| S-03 | M | Import/export SRT and VTT; ASS optional | Exported SRT loads in a player |
| S-04 | M | Burn-in, sidecar, or both | Render profile chooses |
| S-05 | M | Safe area, max two lines, Latin/CJK line length, readability checks | No overflow at 4K |
| S-06 | S | Word highlight/karaoke, speaker labels | Optional |
| S-07 | N | Speech recognition or machine translation | Not built in |

### 5.5 Localization and output

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| L-01 | M | Separate editorLocale and videoLocale | Chinese UI can preview English video |
| L-02 | M | Typed catalog, interpolation, plural, number/date/unit formatting | Missing keys fall back with a warning |
| L-03 | M | VideoManifest declares locales, default, fonts, audio, captions, assets, timing | One video declares multiple languages |
| L-04 | M | All on-canvas text is localizable | No hardcoded UI text except code content |
| L-05 | M | Auto text layout: wrap, fit, CJK breaks, safe area | English and Chinese do not overflow |
| L-06 | M | Per-locale voice, captions and fonts; switch preview | Switch without restarting the project |
| L-07 | M | Batch render: locale all; output per-locale video and subtitles | One command produces both versions |
| L-08 | M | Output choices: per-locale files, sidecar, burn-in, optional multi-track master | User configures the project |
| L-09 | S | Pseudo-locale and translation coverage checks | CI catches missing or overflowing text |
| L-10 | C | RTL languages | Later |

### 5.6 Editor UI

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| U-01 | M | Non-invasive editor wrapper | Motion Canvas can be upgraded independently |
| U-02 | M | Full UI localization: navigation, settings, playback, timeline, console, project selection, meta labels, exporter labels, tooltips | Chinese coverage at least 95 percent |
| U-03 | M | Persist language choice; correct html lang; refresh keeps it | Reload keeps Chinese UI |
| U-04 | M | Scenotion panel: UI language, video language, narration entry, render all, status | Panel usable |
| U-05 | M | Narration workspace: line list, waveform, preview, record, takes, properties | Reference narration flow works |
| U-06 | S | Render queue, progress and errors | No terminal needed |
| U-07 | S | Scenotion branding and dark theme; retain Motion Canvas attribution | Workflow unchanged |
| U-08 | M | If wrapper misses the gate, fork UI under MIT with notices and modification markers | License auditable |

### 5.7 Assets and fonts

Fonts are project assets. Scenotion does not ship, select, bundle, cache or license fonts.

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| AS-01 | M | No new binary or third-party assets tracked in Git; the existing tracked review is the only known exception for now (AS-07) | No new media in git diff; existing review unchanged |
| AS-02 | M | Local/private asset directories are ignored | git status stays clean after use |
| AS-03 | M | Fonts may come from cloud CSS, npm packages, or local files; local files are ignored | Project can use a cloud font without repo changes |
| AS-04 | M | Scenotion only waits for project-specified fonts before preview/render; it fails visibly if a required font is missing | No silent fallback in production render |
| AS-05 | M | Voice recordings and personal media are never committed | No voice files in Git |
| AS-06 | S | If an asset is distributed, record source and license in assets.md; not a prerequisite for local use | License traceable when needed |
| AS-07 | M | Existing tracked review file is left in place; future generated reviews are ignored | No deletion in this phase |

### 5.8 Science visuals

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| P-01 | M | Equations: block equations, numbering, step highlight, reuse Motion Canvas Latex | Animated equation at 4K |
| P-02 | S | Paper layout: title, authors, abstract, figure, citation, theorem, footnote, two columns | Paper-style shot |
| P-03 | S | Data-driven diagrams: nodes, edges, groups, layout, icons, animated draw | No hand-written coordinates |
| P-04 | S | Algorithm traces: arrays, matrices, graphs, trees, DP tables, pointers, synchronized with code lines | Sorting or DP example |
| P-05 | M | Auto text layout for titles, labels and captions | No overflow in the test reel |

### 5.9 3D (deferred)

| ID | P | Requirement | Acceptance |
| --- | --- | --- | --- |
| 3D-01 | C | Keep a documented compatibility seam: a backend renders to a canvas at a given time; a node can later integrate it into preview/export | Design note only; no dependency, node, test scene or implementation now |
| 3D-02 | N | 3D engine, 3D editor, particles, fluid, SDF, GI, complex post-processing | Not in scope |

3D is not part of the near-term milestones. When it is prioritized, the library owns rendering and
Scenotion owns the node adapter, deterministic time, preview and export. No assets are committed.

## 6. Data models

Indented code blocks are illustrative, not final APIs.

    type Locale = "en-US" | "zh-CN";

    type VideoManifest = {
      id: string;
      titleKey: string;
      locales: Locale[];
      defaultLocale: Locale;
      timing: "shared" | "per-locale";
      scenes: SceneManifest[];
      audio: AudioPlan;
      captions: Partial<Record<Locale, CaptionCue[]>>;
      render: RenderProfile;
    };

    type NarrationLine = {
      id: string;
      sceneId: string;
      text: Partial<Record<Locale, string>>;
      anchor: { beatId: string; offset: number };
      budget?: number;
    };

    type VoiceTake = {
      id: string;
      lineId: string;
      locale: Locale;
      file: string;              // private, never committed
      sourceIn: number;
      sourceOut: number;
      timelineOffset: number;
      gainDb: number;
      fadeIn: number;
      fadeOut: number;
      active: boolean;
    };

    type CaptionCue = {
      start: number;
      end: number;
      text: string;
      speaker?: string;
      words?: { text: string; start: number; end: number }[];
    };

    type RenderProfile = {
      locales: Locale[] | "all";
      video: "mp4";
      captions: "none" | "burn" | "sidecar" | "both";
      audio: "mixed" | "separate" | "multi-track";
      master?: boolean;
    };

Tracked: source, docs, catalogs, manifest, caption text, license text. The existing
reviews/feature-validation-720p.mp4 is a known exception and is not extended.
Ignored: voiceover/, assets/private/, assets/local/, output/, reviews/*.mp4, reviews/*.m4v,
public/generated/, public/fonts/, .cache/.

## 7. Test project

Extend the existing feature-validation project; do not start a new topic.

| Scene | Purpose | Priority |
| --- | --- | --- |
| Existing six code scenes | Regression baseline | M |
| CodeStory five steps | Multi-step code, focus, annotations | M |
| Localization/captions | Same scene in en-US and zh-CN | M |
| Narration | Synthetic audio and caption pipeline test | M |
| Math/paper | Equation and paper-style layout | S |
| Diagram/trace | Data-driven architecture or algorithm trace | S |
| 3D | Not added now | Deferred |

- 720p review via the existing review script; output ignored.
- 4K spot checks use a still or short frame range, not a full 4K reel.
- Narration tests use Playwright fake microphone and generated WAV; no personal audio.
- The existing tracked review MP4 is left as-is for now.

## 8. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Determinism | Same project and frame render identically; fixed time, random and font inputs |
| Performance | 500-line code and 20 steps remain usable; no 2N node explosion |
| Data safety | Autosave recordings; crash recovery; confirm destructive edits |
| Privacy | Microphone only after user gesture; no upload; no telemetry |
| Security | Local server on 127.0.0.1; path validation; subtitle HTML sanitized; assets untrusted |
| Licensing | Tracked assets are redistributable; MIT notices retained |
| Accessibility | Keyboard recording/preview; ARIA; contrast |
| Compatibility | Chrome/Edge current; Windows first; macOS/Linux secondary |
| Offline | Rendering does not require network when dependencies and assets are local |
| Repository | No new binary assets; existing tracked review is the known exception; no Git LFS |
| Versioning | Manifest version and migration notes for breaking changes |

## 9. Milestones

| Phase | Scope | Exit criteria |
| --- | --- | --- |
| M0 | Requirements, parity and asset docs; .gitignore; test/CI skeleton; P0 bug fixes | check/test pass; no new media tracked; docs reviewed |
| M1 | i18n catalog, AutoText, font loading; editor wrapper; Chinese UI; remove hardcoded scene text | UI Chinese at least 95 percent; en/zh no overflow |
| M2 | Narration workspace: record, takes, waveform, trim/offset/gain/fade, snap, local save, caption link | 30 s line can be recorded, edited, aligned, retaken |
| M3 | Mix, caption export/burn-in, per-locale render, output profile, extended 720p review | One command produces en/zh versions |
| M4 | CodeStory, focus animation, mark, diff, languages/themes, layouts | Five-step code walkthrough |
| M5 | Math/paper, diagrams, algorithm traces | Science test reel |
| Later | 3D backend, continuous recording, advanced audio, multi-track master, RTL | Deferred |

## 10. Definition of done

- The extended feature-validation reel renders at 720p in one command.
- en-US and zh-CN versions show correct text, captions and (test) audio without manual editing.
- A 30 s voiceover line can be recorded, trimmed, aligned and retaken in the editor.
- UI switches between English and Chinese without losing work.
- 4K still or frame-range export passes.
- No new recording, font, model or review binary is committed beyond the existing reviewed file.
- Unit, visual and render checks pass.

## 11. Deferred

- 3D implementation; only the compatibility seam is documented.
- Continuous/punch-in recording; advanced audio editing.
- Narration-driven per-locale timeline reflow.
- Multi-track master polish; RTL.
- SDF/fluid/particles and Ae-level VFX.
- Remotion ecosystem features.
