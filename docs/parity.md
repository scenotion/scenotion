# Parity

Status: living document. Last reviewed: 2026-10-27.
Reference versions: Motion Canvas 3.17.2, Remotion 4.0.539, Code Hike 1.1.0.

## Definition

Parity means usage parity, not ecosystem parity and not API identity.
Scenotion must support the workflows below well enough that a user coming from
Remotion or Code Hike can produce the same kind of technical video without
learning a different mental model.

Three layers:

1. Authoring: scenes, sequences, props, assets, code stories, annotations.
2. Workflow: preview, voiceover, captions, localization, batch render.
3. Quality: deterministic frames, tests, documentation, licenses.

Do not claim "complete parity". State supported, partial or not planned.

## Reference journeys

| Journey | Source | What must work |
| --- | --- | --- |
| J1 | Remotion | Composition, sequence/series, props, media, render |
| J2 | Code Hike | Code block, focus, annotations, multi-step story, diff |
| J3 | Scenotion | Record and align voiceover inside the project |
| J4 | Scenotion | Switch locales, render both versions |
| J5 | Science video | Equations, paper layout, diagrams, algorithm traces |

## Matrix

### Remotion-oriented capabilities

| Capability | Status | Notes |
| --- | --- | --- |
| Scenes, time, frame-accurate playback | Supported | Motion Canvas core |
| Sequence, series, wait, transitions | Supported | Motion Canvas flow and scene transitions; Scenotion wrappers later |
| Props / project variables | Partial | Motion Canvas variables exist; CLI/UI are planned |
| Images, video, SVG, paths | Supported | Motion Canvas nodes |
| Audio | Partial | Motion Canvas has one project audio track; Scenotion mixes outside |
| Captions | Partial | Requirements in place; implementation pending |
| 3D | Not planned now | Compatibility seam only |
| Math | Partial | Latex exists; Scenotion components pending |
| Headless batch render | Partial | Planned CLI, not implemented |
| Stills, GIF, multiple codecs | Partial | MP4 only today |
| Studio / Player / Lambda | Not planned | Non-goals |
| Deterministic output | Partial | Code scenes are close; fonts/audio need work |

### Code Hike-oriented capabilities

| Capability | Status | Notes |
| --- | --- | --- |
| Filename, language, line numbers | Partial | 64-line gutter limit today |
| Code tabs | Partial | Controller binding limitation |
| Callout, underline, bracket, line | Supported | Current annotation kinds |
| Mark / word highlight | Partial | Focus only; dedicated mark pending |
| Focus transition / auto-scroll | Partial | Static focus today |
| Multi-step code story | Not implemented | CodeStory milestone |
| Diff | Partial | Static side-by-side only |
| Token transitions | Partial | Motion Canvas Code supports it; CodeStage does not expose it |
| Scrollycoding / slideshow / spotlight | Not implemented | Planned |
| Word wrap | Not implemented | Long lines clipped |
| Code Hike comment annotations | Not planned as syntax | Optional migration helper later |
| Interactive copy/hover/link | Not planned | Video context |

## Review process

- Re-check at major releases, not continuously.
- Update this file when a capability moves between supported/partial/not planned.
- Reference a demo or test for every "supported" claim.
- Keep the README honest; do not advertise deferred features as available.

## Mapping notes

| Remotion / Code Hike | Scenotion |
| --- | --- |
| Composition | VideoManifest + scenes |
| Sequence / Series | Scene order + beats |
| Props | Project variables + render profile |
| Audio | AudioPlan + local voiceover takes |
| Captions | Caption cues |
| Code block | CodeStage |
| Code Hike annotations | Scenotion annotations |
| Scrollycoding | CodeStory + split layout |
| ThreeCanvas | Deferred Scene3D seam |

## Non-goals

- Remotion Lambda, Cloud Run, Player, Studio clone.
- Ae-level VFX, particles, fluid, SDF, GI, 3D engine.
- Professional DAW.
- Interactive web code.
- Cloud collaboration.
