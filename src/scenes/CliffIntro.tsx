import { makeScene2D } from "@motion-canvas/2d";
import { waitFor } from "@motion-canvas/core";
import { CodePanel } from "../components/CodePanel";
import { SceneFrame, theme } from "../theme";

export default makeScene2D(function* (view) {
  view.fill(theme.background);
  view.add(
    <SceneFrame
      index="01 / 03"
      label="CLIFF FORMAT"
      title="Code, with context."
      subtitle="A line-oriented format for localization work, built for humans and LLMs."
      footer="scenotion / cliff-format"
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
