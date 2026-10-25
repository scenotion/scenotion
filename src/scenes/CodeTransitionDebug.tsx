import { Layout, Rect, Txt, makeScene2D } from "@motion-canvas/2d";
import { all, waitFor } from "@motion-canvas/core";
import {
  CodeStage,
  createCodeTabsController,
  createCodeTransition,
} from "../code";
import { theme } from "../theme";

const before = `const n = 0;
if (n < 1) {
  n += 1;
}
return n;`;

const after = `const n = 0;
const ready = true;
if (!ready) {
  n += 1;
}
return n;`;

const wipeFiles = [
  { name: "wipe", code: before, language: "ts" as const, status: "SOURCE" },
  { name: "next", code: after, language: "ts" as const, status: "SOURCE" },
];

const quickFiles = [
  { name: "quick", code: before, language: "ts" as const, status: "SOURCE" },
  { name: "next", code: after, language: "ts" as const, status: "SOURCE" },
];

export default makeScene2D(function* (view) {
  view.fill(theme.background);

  const snappy = createCodeTransition("snappy");
  const smooth = createCodeTransition("smooth");
  const cinematic = createCodeTransition("cinematic");
  const tabsWipe = createCodeTabsController();
  const tabsQuick = createCodeTabsController();

  view.add(
    <Layout
      layout
      width={theme.layout.width}
      height={theme.layout.height}
      padding={72}
      direction="column"
      justifyContent="space-between"
    >
      <Layout
        layout
        direction="row"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Layout layout direction="row" gap={14} alignItems="center">
          <Rect width={10} height={10} radius={5} fill={theme.accent} />
          <Txt
            text="SCENOTION"
            fill={theme.accent}
            fontFamily={theme.font.sans}
            fontSize={18}
            fontWeight={700}
            letterSpacing={3}
          />
          <Txt
            text="/ TRANSITION DEBUG"
            fill={theme.muted}
            fontFamily={theme.font.mono}
            fontSize={16}
            letterSpacing={1}
          />
        </Layout>
        <Txt
          text="05 / CODE"
          fill={theme.muted}
          fontFamily={theme.font.mono}
          fontSize={16}
          letterSpacing={2}
        />
      </Layout>

      <Layout layout direction="column" gap={12} alignItems="start">
        <Txt
          text="Five transitions, one API."
          fill={theme.text}
          fontFamily={theme.font.sans}
          fontSize={72}
          fontWeight={800}
          lineHeight={1.08}
          letterSpacing={-2}
          height={84}
        />
        <Txt
          text="Fixed validation: snappy, smooth, cinematic, wipe and quick."
          fill={theme.muted}
          fontFamily={theme.font.sans}
          fontSize={24}
          height={30}
        />
      </Layout>

      <Layout
        layout
        direction="row"
        width="100%"
        justifyContent="space-between"
        alignItems="start"
      >
        <CodeStage
            x={-684}
            code={before}
            nextCode={after}
            transition={snappy}
            filename="snappy.ts"
            language="ts"
            width={330}
            height={430}
            fontSize={13}
            lineCountHint={5}
          />

        <CodeStage
            x={-342}
            code={before}
            nextCode={after}
            transition={smooth}
            filename="smooth.ts"
            language="ts"
            width={330}
            height={430}
            fontSize={13}
            lineCountHint={5}
          />

        <CodeStage
            x={0}
            code={before}
            nextCode={after}
            transition={cinematic}
            filename="cinematic.ts"
            language="ts"
            width={330}
            height={430}
            fontSize={13}
            lineCountHint={5}
          />

        <CodeStage
            x={342}
            files={wipeFiles}
            activeFile={0}
            tabsController={tabsWipe}
            filePreset="wipe"
            width={330}
            height={430}
            fontSize={13}
            lineCountHint={5}
          />

        <CodeStage
            x={684}
            files={quickFiles}
            activeFile={0}
            tabsController={tabsQuick}
            filePreset="quick"
            width={330}
            height={430}
            fontSize={13}
            lineCountHint={5}
          />
      </Layout>

      <Layout
        layout
        direction="row"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Txt
          text="scenotion / code-transition-debug"
          fill={theme.muted}
          fontFamily={theme.font.mono}
          fontSize={16}
        />
        <Txt
          text="MOTION CANVAS / 4K60 READY"
          fill={theme.muted}
          fontFamily={theme.font.mono}
          fontSize={16}
        />
      </Layout>
    </Layout>,
  );

  yield* waitFor(0.8);
  yield* all(
    snappy.play(),
    smooth.play(),
    cinematic.play(),
    tabsWipe.switchTo(1),
    tabsQuick.switchTo(1),
  );
  yield* waitFor(2.2);
});
