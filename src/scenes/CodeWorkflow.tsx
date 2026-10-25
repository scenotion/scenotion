import type { Code } from "@motion-canvas/2d";
import { lines, makeScene2D } from "@motion-canvas/2d";
import { createRef, waitFor } from "@motion-canvas/core";
import {
  CodeStage,
  annotationMotions,
  createCodeAnnotation,
  createCodeTransition,
} from "../code";
import { SceneFrame, theme } from "../theme";

const before = `type Entry = {
  id: string;
  source: string;
  target?: string;
};

export function resolve(entry: Entry) {
  return entry.target ?? entry.source;
}`;

const after = `type Entry = {
  id: string;
  source: string;
  target?: string;
};

export function resolve(entry: Entry) {
  const name = entry.target?.trim();
  return name || entry.source;
}`;

export default makeScene2D(function* (view) {
  view.fill(theme.background);

  const code = createRef<Code>();
  const transition = createCodeTransition("smooth");
  const focus = lines(7, 8);

  view.add(
    <SceneFrame
      index="00 / CODE"
      label="CODE WORKFLOW"
      title="Code is a timeline."
      subtitle="A generic code scene: syntax highlighting, line numbers, selection, a code transition and a code-bound callout."
      footer="scenotion / code-workflow"
    >
      <CodeStage
        codeRef={code}
        code={before}
        nextCode={after}
        transition={transition}
        filename="resolver.ts"
        language="ts"
        height={430}
        focus={focus}
        lineCountHint={10}
      />
    </SceneFrame>,
  );

  yield* waitFor(0.8);
  yield* transition.play();
  yield* waitFor(0.2);

  const annotation = createCodeAnnotation(code(), {
    range: lines(7, 8),
    label: "trim + fallback",
    tone: "accent",
    kind: "callout",
    motion: annotationMotions.pop,
  });

  if (annotation) {
    code().add(annotation.node);
    yield* annotation.reveal(0.65);
  }

  yield* waitFor(2.4);
});

