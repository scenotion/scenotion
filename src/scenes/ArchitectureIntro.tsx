import { makeScene2D } from "@motion-canvas/2d";
import { waitFor } from "@motion-canvas/core";
import { ArchitectureMap } from "../components/ArchitectureMap";
import { t } from "../i18n";
import { SceneFrame, theme } from "../theme";

export default makeScene2D(function* (view) {
  view.fill(theme.background);
  view.add(
    <SceneFrame
      index={() => t("architecture.index")}
      label={() => t("architecture.label")}
      title={() => t("architecture.title")}
      subtitle={() => t("architecture.subtitle")}
      footer={() => t("architecture.footer")}
    >
      <ArchitectureMap />
    </SceneFrame>,
  );

  yield* waitFor(2.5);
});
