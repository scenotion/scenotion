import { makeScene2D } from "@motion-canvas/2d";
import { waitFor } from "@motion-canvas/core";
import { CodeStage, createCodeTabsController } from "../code";
import { t } from "../i18n";
import { SceneFrame, theme } from "../theme";

const files = [
  {
    name: "types.ts",
    language: "ts" as const,
    status: t("status.source"),
    code: `export type Entry = {
  id: string;
  source: string;
  target?: string;
};`,
  },
  {
    name: "resolver.ts",
    language: "ts" as const,
    status: t("status.edited"),
    code: `import type { Entry } from "./types";

export function resolve(entry: Entry) {
  const name = entry.target?.trim();
  return name || entry.source;
}`,
  },
  {
    name: "usage.ts",
    language: "ts" as const,
    status: t("status.source"),
    code: `import { resolve } from "./resolver";

const label = resolve({
  id: "entry",
  source: "source",
  target: " target ",
});`,
  },
];

export default makeScene2D(function* (view) {
  view.fill(theme.background);

  const tabs = createCodeTabsController();

  view.add(
    <SceneFrame
      index={() => t("codeTabs.index")}
      label={() => t("codeTabs.label")}
      title={() => t("codeTabs.title")}
      subtitle={() => t("codeTabs.subtitle")}
      footer={() => t("codeTabs.footer")}
    >
      <CodeStage
        files={files}
        activeFile={1}
        tabsController={tabs}
        filePreset="wipe"
        height={430}
        lineCountHint={8}
      />
    </SceneFrame>,
  );

  yield* waitFor(0.8);
  yield* tabs.switchTo(0, 0.9);
  yield* waitFor(0.35);
  yield* tabs.switchTo(2, 0.9);
  yield* waitFor(0.35);
  yield* tabs.switchTo(1, 0.9);
  yield* waitFor(2.0);
});
