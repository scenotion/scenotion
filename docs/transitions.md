# Transition presets

Presets are reusable timing/easing contracts for the three transition layers:
code edits, file switches, and annotations. They do not change the visual kind
of an annotation; they control how long that kind's own motion takes.

## Code edits

`createCodeTransition()` defaults to `smooth`. `play(duration?)` can still
override the duration for one call.

~~~tsx
const transition = createCodeTransition("snappy");

<CodeStage
  code={before}
  nextCode={after}
  transition={transition}
/>;

yield* transition.play();
~~~

| Preset | Duration | Ease |
| --- | ---: | --- |
| `snappy` | 0.6 | easeOutCubic |
| `smooth` | 1.2 | easeInOutCubic |
| `cinematic` | 1.8 | easeInOutCubic |

Object overrides merge onto `smooth`:

~~~tsx
const transition = createCodeTransition({
  duration: 0.9,
  ease: easeInOutCubic,
});
~~~

## File switches

`filePreset` drives the tab wipe duration/ease. The tab indicator itself keeps
its own spring timing.

~~~tsx
<CodeStage
  files={files}
  tabsController={tabs}
  filePreset="quick"
/>;
~~~

| Preset | Duration | Ease |
| --- | ---: | --- |
| `wipe` | 0.9 | easeInOutCubic |
| `quick` | 0.55 | easeOutCubic |

## Annotations

`createCodeAnnotations(code, {preset})` supplies defaults for `reveal`,
`hide`, and `reposition`. Per-call durations override the preset.

~~~tsx
const annotations = createCodeAnnotations(code, {
  preset: "cinematic",
});

const note = annotations.add({
  kind: "callout",
  range: lines(2, 2),
  label: "fallback path",
});

if (note) yield* note.reveal(); // 0.8s from cinematic
~~~

| Preset | Reveal | Hide | Reposition |
| --- | ---: | ---: | ---: |
| `quick` | 0.3 | 0.1 | 0.3 |
| `editorial` | 0.5 | 0.15 | 0.45 |
| `cinematic` | 0.8 | 0.3 | 0.7 |

Each annotation kind still owns its presentation:

- callout: connector draw, then pill;
- underline: stroke draw;
- bracket: matching brace boxes, one after the other;
- line: horizontal wipe, then label.

Presets only change timing. The visual grammar and per-kind reveal stay the same.

## Combined example

~~~tsx
const transition = createCodeTransition("snappy");
const annotations = createCodeAnnotations(code, { preset: "cinematic" });

<CodeStage
  codeRef={code}
  code={before}
  nextCode={after}
  transition={transition}
  annotations={annotations}
  filePreset="quick"
/>;
~~~

`CodeStage` hides annotations with the annotation preset, maps their ranges
through the line plan, then replays each kind's own reveal at the new anchor.
