import { lines, makeScene2D } from "@motion-canvas/2d";
import { waitFor } from "@motion-canvas/core";
import { CodeDiff } from "../code";
import { t } from "../i18n";
import { SceneFrame, theme } from "../theme";

const before = `type User = {
  id: string;
  name?: string;
};

function label(user: User) {
  return user.name ?? "anonymous";
}`;

const after = `type User = {
  id: string;
  name?: string;
};

function label(user: User) {
  return user.name?.trim() || "anonymous";
}`;

export default makeScene2D(function* (view) {
  view.fill(theme.background);

  view.add(
    <SceneFrame
      index={() => t("codeDiff.index")}
      label={() => t("codeDiff.label")}
      title={() => t("codeDiff.title")}
      subtitle={() => t("codeDiff.subtitle")}
      footer={() => t("codeDiff.footer")}
    >
      <CodeDiff
        before={before}
        after={after}
        filename="label.ts"
        language="ts"
        beforeFocus={lines(6, 7)}
        afterFocus={lines(6, 7)}
      />
    </SceneFrame>,
  );

  yield* waitFor(2.6);
});
