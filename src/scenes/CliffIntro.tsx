import { makeScene2D } from "@motion-canvas/2d";
import { waitFor } from "@motion-canvas/core";
import { CodePanel } from "../components/CodePanel";
import { t } from "../i18n";
import { SceneFrame, theme } from "../theme";

export default makeScene2D(function* (view) {
  view.fill(theme.background);
  view.add(
    <SceneFrame
      index={() => t("cliff.index")}
      label={() => t("cliff.label")}
      title={() => t("cliff.title")}
      subtitle={() => t("cliff.subtitle")}
      footer={() => t("cliff.footer")}
    >
      <CodePanel
        filename="settings.cliff"
        language="CLIFF 1.1"
        activeLine={6}
        lines={[
          "CLIFF 1.1",
          "namespace: demo",
          "clan: settings",
          "source-language: en-US",
          "target-language: zh-CN",
          "",
          "<Resolution>",
          'source: "Resolution"',
          'target: "分辨率"',
          "status: final",
        ]}
      />
    </SceneFrame>,
  );

  yield* waitFor(2.5);
});
