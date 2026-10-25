import { makeScene2D } from "@motion-canvas/2d";
import { waitFor } from "@motion-canvas/core";
import { ArchitectureMap } from "../components/ArchitectureMap";
import { SceneFrame, theme } from "../theme";

export default makeScene2D(function* (view) {
  view.fill(theme.background);
  view.add(
    <SceneFrame
      index="02 / 03"
      label="ARCHITECTURE"
      title="Make structure visible."
      subtitle="Nodes, edges and layers, with a camera that moves from system to decision."
      footer="scenotion / architecture"
    >
      <ArchitectureMap />
    </SceneFrame>,
  );

  yield* waitFor(2.5);
});
