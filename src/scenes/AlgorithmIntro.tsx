import { makeScene2D } from "@motion-canvas/2d";
import { waitFor } from "@motion-canvas/core";
import { AlgorithmBars } from "../components/AlgorithmBars";
import { SceneFrame, theme } from "../theme";

export default makeScene2D(function* (view) {
  view.fill(theme.background);
  view.add(
    <SceneFrame
      index="03 / 03"
      label="ALGORITHMS"
      title="Give the trace a body."
      subtitle="A deterministic trace becomes arrays, grids, graphs and game boards."
      footer="scenotion / algorithms"
    >
      <AlgorithmBars />
    </SceneFrame>,
  );

  yield* waitFor(2.5);
});
