import { makeScene2D } from "@motion-canvas/2d";
import { createSignal, waitFor } from "@motion-canvas/core";
import { CodeStage } from "../code";
import { SceneFrame, theme } from "../theme";

const longCode = Array.from({ length: 24 }, (_, index) => {
  if (index === 0) return "type Trace = { step: number; state: string };";
  if (index === 1) return "";
  if (index === 2) return "export function run(trace: Trace[]) {";
  if (index === 23) return "}";
  if (index % 3 === 0) {
    return "  // checkpoint " + String(index).padStart(2, "0") + " / keep state visible";
  }
  if (index % 3 === 1) {
    return "  const step" + String(index).padStart(2, "0") + " = trace[" + index + "]?.step ?? 0;";
  }
  return "  apply(step" + String(index).padStart(2, "0") + ");";
}).join("\n");

export default makeScene2D(function* (view) {
  view.fill(theme.background);

  const scroll = createSignal(0);

  view.add(
    <SceneFrame
      index="02 / CODE"
      label="CODE VIEWPORT"
      title="Scroll the window."
      subtitle="A long code file stays inside a fixed viewport. Only the visible lines are rendered, while the gutter keeps the original line numbers."
      footer="scenotion / code-scroll"
    >
      <CodeStage
        code={longCode}
        filename="trace.ts"
        language="ts"
        height={430}
        fontSize={22}
        lineHeight={1.45}
        visibleLines={9}
        startLine={scroll}
      />
    </SceneFrame>,
  );

  yield* waitFor(0.8);
  yield* scroll(8, 1.2);
  yield* waitFor(0.6);
  yield* scroll(15, 1.2);
  yield* waitFor(2.0);
});
