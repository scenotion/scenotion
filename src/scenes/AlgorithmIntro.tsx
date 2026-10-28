import { makeScene2D } from "@motion-canvas/2d";
import { waitFor } from "@motion-canvas/core";
import { AlgorithmBars } from "../components/AlgorithmBars";
import { t } from "../i18n";
import { SceneFrame, theme } from "../theme";

export default makeScene2D(function* (view) {
  view.fill(theme.background);
  view.add(
    <SceneFrame
      index={() => t("algorithms.index")}
      label={() => t("algorithms.label")}
      title={() => t("algorithms.title")}
      subtitle={() => t("algorithms.subtitle")}
      footer={() => t("algorithms.footer")}
    >
      <AlgorithmBars />
    </SceneFrame>,
  );

  yield* waitFor(2.5);
});
