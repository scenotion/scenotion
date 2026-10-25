import type { Code } from "@motion-canvas/2d";
import { lines, makeScene2D, word } from "@motion-canvas/2d";
import { all, createRef, waitFor } from "@motion-canvas/core";
import {
  CodeStage,
  createCodeAnnotations,
  createCodeTransition,
} from "../code";
import { SceneFrame, theme } from "../theme";

const before = `function apply(entry: Entry) {
  if (!entry.target) {
    return entry.source;
  }
  return entry.target;
}`;

const after = `function apply(entry: Entry) {
  const target = entry.target?.trim();
  const fallback = entry.source;
  if (!entry.target) {
    return fallback;
  }
  return target;
}`;

export default makeScene2D(function* (view) {
  view.fill(theme.background);

  const code = createRef<Code>();
  const transition = createCodeTransition("smooth");
  const annotations = createCodeAnnotations(code, { preset: "editorial" });

  view.add(
    <SceneFrame
      index="04 / CODE"
      label="ANNOTATIONS"
      title="Annotations follow the code."
      subtitle="Callout, error underline, bracket pair and line note all re-anchor after the edit."
      footer="scenotion / code-annotations"
    >
      <CodeStage
        codeRef={code}
        code={before}
        nextCode={after}
        transition={transition}
        annotations={annotations}
        filename="apply.ts"
        language="ts"
        status="EDITED"
        height={430}
        lineCountHint={8}
      />
    </SceneFrame>,
  );

  yield* waitFor(0.8);

  const callout = annotations.add({
    id: "fallback",
    kind: "callout",
    range: lines(2, 2),
    label: "fallback path",
    tone: "accent",
  });

  const error = annotations.add({
    id: "guard",
    kind: "underline",
    // Only the failing condition, not the leading indentation.
    range: word(1, 6, 13),
    tone: "error",
  });

  const bracket = annotations.add({
    id: "body",
    kind: "bracket",
    range: lines(1, 3),
    tone: "accent",
  });

  const lineNote = annotations.add({
    id: "target",
    kind: "line",
    range: lines(4, 4),
    label: "target branch",
    tone: "warn",
  });

  yield* all(
    error ? error.reveal() : all(),
    bracket ? bracket.reveal() : all(),
    lineNote ? lineNote.reveal() : all(),
  );
  yield* callout ? callout.reveal() : all();

  yield* waitFor(0.7);
  yield* transition.play();
  yield* waitFor(2.0);
});
