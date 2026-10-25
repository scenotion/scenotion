import type { Reference, SignalValue, ThreadGenerator } from "@motion-canvas/core";
import {
  all,
  clamp,
  createRef,
  createRefArray,
  createSignal,
  easeOutBack,
  easeOutCubic,
  waitFor,
} from "@motion-canvas/core";
import { Code, Layout, Node, Rect, Txt } from "@motion-canvas/2d";
import { parseCodeSelection } from "@motion-canvas/2d";
import type { CodeRange, CodeSelection } from "@motion-canvas/2d";
import { theme } from "../theme";
import { ClipViewport } from "./ClipViewport";
import { LineClipViewport, RangeClipViewport } from "./LineClipViewport";
import { codeHighlighters, type CodeLanguage } from "./highlight";
import { buildLinePlans, type LinePlan } from "./lines";
import type { LineState } from "./diff";
import type { CodeAnnotationsController } from "./annotations";
import {
  resolveCodeTransitionPreset,
  resolveFileTransitionPreset,
  type CodeTransitionPreset,
  type CodeTransitionPresetInput,
  type FileTransitionPresetInput,
} from "./transitions";

export type CodeFile = {
  name: string;
  code: string;
  language?: CodeLanguage;
  status?: string;
};

export type CodeTabsController = {
  switchTo: (index: number, duration?: number) => ThreadGenerator;
};

export function createCodeTabsController(): CodeTabsController {
  return {
    switchTo: () => all(),
  };
}

type CodeStageProps = {
  code?: string;
  files?: CodeFile[];
  activeFile?: number;
  tabsController?: CodeTabsController;
  filename?: string;
  language?: CodeLanguage;
  width?: number;
  height?: number;
  fontSize?: number;
  lineHeight?: number;
  focus?: CodeRange | CodeRange[];
  codeRef?: Reference<Code>;
  showLineNumbers?: boolean;
  status?: string;
  x?: number;
  y?: number;
  lineStates?: LineState[];
  startLine?: SignalValue<number>;
  visibleLines?: number;
  lineCountHint?: number;
  nextCode?: string;
  transition?: CodeTransitionController;
  filePreset?: FileTransitionPresetInput;
  annotations?: CodeAnnotationsController;
};

export type CodeTransitionController = {
  preset: CodeTransitionPreset;
  play: (duration?: number) => ThreadGenerator;
};

export function createCodeTransition(
  preset: CodeTransitionPresetInput = "smooth",
): CodeTransitionController {
  return {
    preset: resolveCodeTransitionPreset(preset),
    play: () => all(),
  };
}

function isLineSelected(
  selection: CodeSelection | null,
  line: number,
): boolean {
  if (!selection) return true;

  return selection.some(([[startLine, startColumn], [endLine, endColumn]]) => {
    if (line < startLine || line > endLine) return false;
    if (line === endLine && endColumn <= 0) return false;
    if (startLine === endLine) return endColumn > startColumn;
    return true;
  });
}

function focusAlpha(selection: CodeSelection | null, line: number | null): number {
  if (!selection || line === null) return 1;
  return isLineSelected(selection, line) ? 1 : 0.28;
}

function lineNumber(index: number | null): string {
  return index === null ? "" : String(index + 1).padStart(2, "0");
}

function computeNextKept(plans: LinePlan[]): number[] {
  return plans.map((plan) => {
    if (plan.kind !== "insert" && plan.kind !== "remove") return -1;

    const key = plan.kind === "insert" ? plan.afterIndex! : plan.beforeIndex!;
    let best = -1;
    let bestKey = Infinity;

    plans.forEach((other, otherIndex) => {
      if (other.kind !== "keep" && other.kind !== "replace") return;
      const otherKey =
        plan.kind === "insert" ? other.afterIndex : other.beforeIndex;
      if (otherKey === null || otherKey === undefined || otherKey <= key) return;
      if (otherKey < bestKey) {
        bestKey = otherKey;
        best = otherIndex;
      }
    });

    return best;
  });
}

export function CodeStage({
  code,
  files,
  activeFile = 0,
  tabsController,
  filename = "example.ts",
  language = "ts",
  width = 1200,
  height = 430,
  fontSize = 24,
  lineHeight = 1.5,
  focus,
  codeRef,
  showLineNumbers = true,
  status = "SOURCE",
  x = 0,
  y = 0,
  lineStates,
  startLine = 0,
  visibleLines,
  lineCountHint,
  nextCode,
  transition,
  filePreset,
  annotations,
}: CodeStageProps) {
  const resolvedFilePreset = resolveFileTransitionPreset(filePreset);
  const fileList = files ?? [];
  const filesMode = fileList.length > 0;
  const initialFileIndex = filesMode
    ? clamp(0, fileList.length - 1, Math.floor(activeFile))
    : 0;
  const initialFile = filesMode ? fileList[initialFileIndex] : undefined;
  const initialCode = initialFile?.code ?? code ?? "";
  const initialLanguage = initialFile?.language ?? language;
  const initialStatus = initialFile?.status ?? status;

  const allCode = filesMode
    ? fileList.map((file) => file.code)
    : [initialCode, ...(nextCode ? [nextCode] : [])];
  const allLines = allCode.flatMap((value) => value.split("\n"));
  const maxLines = Math.max(1, ...allCode.map((value) => value.split("\n").length));
  const gutter = showLineNumbers ? 54 : 0;
  const contentHeight = height - 84 - 20;
  const requestedLines = Math.max(
    1,
    visibleLines ?? lineCountHint ?? maxLines,
  );
  const maxLineChars = Math.max(1, ...allLines.map((line) => line.length));
  const maxFontByHeight = contentHeight / (requestedLines * lineHeight);
  const maxFontByWidth = (width - 88 - gutter) / (maxLineChars * 0.62);
  const effectiveFontSize = Math.max(
    13,
    Math.floor(Math.min(fontSize, maxFontByHeight, maxFontByWidth)),
  );
  const lineHeightPx = Math.max(1, Math.round(effectiveFontSize * lineHeight));
  const gutterFontSize = 16;

  const codeX = -width / 2 + 36 + gutter;
  const viewportTop = -height / 2 + 84;
  const viewportHeight = Math.floor(contentHeight / 2) * 2;
  const contentTop = -viewportHeight / 2;

  const fallbackCurrentRef = createRef<Code>();
  const currentRef = codeRef ?? fallbackCurrentRef;
  const contentWidth = width - 88 - gutter;

  const focusSelection = focus ? parseCodeSelection(focus) : null;
  const displayedLanguage = createSignal<CodeLanguage>(initialLanguage);
  const displayedStatus = createSignal(initialStatus);
  const activeFileIndex = createSignal(initialFileIndex);

  const staticOpacity = createSignal(1);
  const transitionOpacity = createSignal(0);
  const transitionProgress = createSignal(0);
  const wipeHeight = createSignal(0);
  const wipeVisible = createSignal(0);
  const staticGroup = createRef<Node>();
  const transitionGroup = createRef<Node>();
  const nextFileRef = createRef<Code>();
  const nextFileLineCount = createSignal(0);

  const needsSlots = !filesMode && Boolean(nextCode);
  const slotCount = needsSlots ? Math.max(2, maxLines * 2 + 1) : 0;
  const slotNodes = createRefArray<Node>();
  const slotCodes = createRefArray<Code>();
  const slotPlans: Array<LinePlan | null> = Array(slotCount).fill(null);
  const slotNextKept: number[] = Array(slotCount).fill(-1);
  const slotRevision = createSignal(0);
  const slotProgress = Array.from({ length: slotCount }, () => createSignal(0));
  const slotFocus = Array.from({ length: slotCount }, () => createSignal(1));

  const slotClipHeight = (index: number) => () => {
    slotRevision();
    const plan = slotPlans[index];
    if (!plan) return 0;
    if (plan.kind === "keep" || plan.kind === "replace") return lineHeightPx;

    const node = slotNodes[index];
    const nextIndex = slotNextKept[index];
    const next = nextIndex >= 0 ? slotNodes[nextIndex] : undefined;

    if (node && next) {
      return clamp(0, lineHeightPx, next.y() - node.y());
    }

    const progress = transitionProgress();
    return (plan.kind === "insert" ? progress : 1 - progress) * lineHeightPx;
  };

  const slotOpacity = (index: number) => () => {
    slotRevision();
    const plan = slotPlans[index];
    if (!plan) return 0;
    if (plan.kind === "keep" || plan.kind === "replace") return 1;

    const reveal = clamp(0, 1, slotClipHeight(index)() / lineHeightPx);
    if (plan.kind === "insert") {
      return reveal * clamp(0, 1, (slotProgress[index]() - 0.5) * 2);
    }
    return reveal * clamp(0, 1, (0.5 - slotProgress[index]()) * 2);
  };

  const slotNumber = (index: number) => () => {
    slotRevision();
    const plan = slotPlans[index];
    if (!plan) return "";
    const progressed = slotProgress[index]() >= 0.5;
    if (plan.kind === "insert") {
      return progressed ? lineNumber(plan.afterIndex) : "";
    }
    if (plan.kind === "remove") {
      return progressed ? "" : lineNumber(plan.beforeIndex);
    }
    return progressed
      ? lineNumber(plan.afterIndex)
      : lineNumber(plan.beforeIndex);
  };

  const runTransition = function* (
    toCode: string,
    toLanguage: CodeLanguage,
    duration: number,
    preset: CodeTransitionPreset,
  ) {
    const fromCode = currentRef().parsed();
    const plans = buildLinePlans(fromCode, toCode);
    if (annotations) yield* annotations.hide();

    if (plans.length === 0) {
      currentRef().code(toCode);
      currentRef().highlighter(codeHighlighters[toLanguage]);
      displayedLanguage(toLanguage);
      staticOpacity(1);
      transitionOpacity(0);
      annotations?.applyPlans(plans);
      if (annotations) yield* annotations.reposition();
      return;
    }

    const nextKept = computeNextKept(plans);
    staticGroup()?.y(0);
    transitionProgress(0);
    slotPlans.fill(null);
    slotNextKept.fill(-1);
    plans.forEach((plan, index) => {
      if (index < slotCount) slotPlans[index] = plan;
    });
    nextKept.forEach((next, index) => {
      if (index < slotCount) slotNextKept[index] = next;
    });
    slotRevision(slotRevision() + 1);

    staticOpacity(0);
    transitionOpacity(1);

    for (let index = 0; index < slotCount; index++) {
      const node = slotNodes[index];
      const codeNode = slotCodes[index];
      const plan = slotPlans[index];

      slotProgress[index](0);
      if (!node) continue;

      if (!plan) {
        node.y(0);
        if (codeNode) codeNode.code("");
        slotFocus[index](1);
        continue;
      }

      const startIndex = plan.beforeIndex ?? plan.afterIndex!;
      node.y(startIndex * lineHeightPx);
      if (codeNode) {
        codeNode.highlighter(codeHighlighters[toLanguage]);
        codeNode.code(
          plan.kind === "insert" ? plan.afterText : plan.beforeText,
        );
      }
      slotFocus[index](
        plan.kind === "insert"
          ? focusAlpha(focusSelection, plan.afterIndex)
          : focusAlpha(focusSelection, plan.beforeIndex),
      );
    }

    const animations: ThreadGenerator[] = [];
    plans.forEach((plan, index) => {
      if (index >= slotCount) return;
      const node = slotNodes[index];
      if (!node) return;

      if (plan.beforeIndex !== null && plan.afterIndex !== null) {
        animations.push(
          node.y(plan.afterIndex * lineHeightPx, duration, preset.ease),
        );
      }

      if (plan.kind === "replace") {
        const codeNode = slotCodes[index];
        if (codeNode) {
          animations.push(
            codeNode.code(plan.afterText, duration, preset.ease),
          );
        }
      }

      const targetFocus = focusAlpha(focusSelection, plan.afterIndex);
      if (slotFocus[index]() !== targetFocus) {
        animations.push(slotFocus[index](targetFocus, duration, preset.ease));
      }

      animations.push(slotProgress[index](1, duration, preset.ease));
    });

    animations.push(transitionProgress(1, duration, preset.ease));
    yield* all(...animations);

    currentRef().code(toCode);
    currentRef().highlighter(codeHighlighters[toLanguage]);
    displayedLanguage(toLanguage);
    staticOpacity(1);
    transitionOpacity(0);
    annotations?.applyPlans(plans);
    if (annotations) yield* annotations.reposition();
  };

  if (transition && nextCode && !filesMode) {
    transition.play = function* (duration = transition.preset.duration) {
      yield* runTransition(nextCode, initialLanguage, duration, transition.preset);
    };
  }

  const tabGap = 8;
  const maxNameLength = Math.max(
    4,
    ...fileList.map((file) => file.name.length),
  );
  const availableTabs = Math.max(120, width - 360);
  let tabWidth = Math.max(72, Math.min(150, maxNameLength * 8 + 30));
  if (
    fileList.length * tabWidth + (fileList.length - 1) * tabGap >
    availableTabs
  ) {
    tabWidth = Math.max(
      56,
      (availableTabs - (fileList.length - 1) * tabGap) / fileList.length,
    );
  }
  const tabLeft = -width / 2 + 32;
  const tabCenters = fileList.map(
    (_, index) => tabLeft + tabWidth / 2 + index * (tabWidth + tabGap),
  );
  const tabIndicator = createRef<Rect>();
  const tabLabels = createRefArray<Txt>();
  const tabUnderline = createSignal(Math.max(8, tabWidth - 20));
  const tabOpacity = fileList.map((_, index) =>
    createSignal(index === initialFileIndex ? 1 : 0.5),
  );

  const animateTabs = function* (index: number, duration: number) {
    const animations: ThreadGenerator[] = [];
    const indicator = tabIndicator();
    if (indicator) {
      animations.push(
        indicator.x(tabCenters[index], duration, easeOutBack),
      );
    }
    tabOpacity.forEach((opacity, tabIndex) => {
      animations.push(
        opacity(tabIndex === index ? 1 : 0.5, duration, easeOutCubic),
      );
    });
    tabLabels.forEach((label, tabIndex) => {
      animations.push(
        label.y(tabIndex === index ? -2.5 : 0, duration, easeOutBack),
      );
    });
    tabUnderline(8);
    animations.push(
      tabUnderline(Math.max(8, tabWidth - 20), duration * 1.15, easeOutBack),
    );
    yield* all(...animations);
  };

  const runFileTransition = function* (
    target: CodeFile,
    duration: number,
  ) {
    const targetLanguage = target.language ?? initialLanguage;
    const targetLines = target.code.split("\n");

    if (annotations) yield* annotations.clear();
    nextFileLineCount(targetLines.length);

    const next = nextFileRef();
    if (next) {
      next.code(target.code);
      next.highlighter(codeHighlighters[targetLanguage]);
      // Fully tokenize the target while the old layer still covers it.
      next.highlighterCache();
    }

    // Give the fully rendered target layer a frame under the old layer.
    yield* waitFor(1 / 30);

    wipeHeight(0);
    wipeVisible(1);

    yield* wipeHeight(viewportHeight, duration, resolvedFilePreset.ease);

    currentRef().code(target.code);
    currentRef().highlighter(codeHighlighters[targetLanguage]);
    displayedLanguage(targetLanguage);
    wipeVisible(0);
    wipeHeight(0);
  };

  if (tabsController && filesMode) {
    tabsController.switchTo = function* (
      index,
      duration = resolvedFilePreset.duration,
    ) {
      const targetIndex = clamp(0, fileList.length - 1, Math.floor(index));
      const target = fileList[targetIndex];
      if (!target) return;

      const tabDuration = Math.min(0.36, duration * 0.4);
      displayedStatus(target.status ?? status);

      if (targetIndex === activeFileIndex()) {
        yield* animateTabs(targetIndex, tabDuration);
        return;
      }

      yield* all(
        animateTabs(targetIndex, tabDuration),
        runFileTransition(target, duration),
      );
      activeFileIndex(targetIndex);
    };
  }

  const currentCode = () => {
    const node = currentRef?.();
    return node ? node.parsed() : initialCode;
  };

  const currentStart = () =>
    typeof startLine === "function" ? startLine() : startLine;

  const markerWidth = width - 48;

  const slotViews = Array.from({ length: slotCount }, (_, index) => (
    <Node
      key={"transition-slot-" + index}
      ref={slotNodes}
      y={0}
      opacity={slotOpacity(index)}
    >
      <LineClipViewport width={width} height={slotClipHeight(index)}>
        {showLineNumbers && (
          <Txt
            text={slotNumber(index)}
            x={codeX - 55}
            y={0}
            width={50}
            textAlign="right"
            offset={[0, -1]}
            fill={theme.muted}
            fontFamily={theme.font.mono}
            fontSize={gutterFontSize}
            lineHeight={lineHeightPx}
          />
        )}

        <Code
          ref={slotCodes}
          code=""
          highlighter={codeHighlighters[initialLanguage]}
          x={codeX}
          y={0}
          width={contentWidth}
          height={lineHeightPx}
          offset={[-1, -1]}
          fill={theme.text}
          fontFamily={theme.font.mono}
          fontSize={effectiveFontSize}
          lineHeight={lineHeightPx}
          drawHooks={{
            token(ctx, text, position, color) {
              ctx.globalAlpha *= slotFocus[index]();
              ctx.fillStyle = color;
              ctx.fillText(text, position.x, position.y);
            },
          }}
        />
      </LineClipViewport>
    </Node>
  ));


  const staticViews = (
    <>
            {lineStates?.map((state, index) => {
              if (state === "same") return null;
              return (
                <Rect
                  key={"line-state-" + x + "-" + index}
                  x={0}
                  y={contentTop + index * lineHeightPx + lineHeightPx / 2}
                  width={markerWidth}
                  height={lineHeightPx}
                  fill={
                    state === "added"
                      ? "rgba(0, 200, 83, 0.10)"
                      : "rgba(255, 77, 79, 0.10)"
                  }
                />
              );
            })}

            {showLineNumbers &&
              Array.from({ length: 64 }, (_, index) => (
                <Txt
                  key={"gutter-" + x + "-" + index}
                  text={() => {
                    const total = currentCode().split("\n").length;
                    if (index >= total) return "";
                    return String(index + 1).padStart(2, "0");
                  }}
                  x={codeX - 55}
                  y={contentTop + index * lineHeightPx}
                  width={50}
                  textAlign="right"
                  offset={[0, -1]}
                  fill={theme.muted}
                  fontFamily={theme.font.mono}
                  fontSize={gutterFontSize}
                  lineHeight={lineHeightPx}
                />
              ))}

            <Code
              ref={currentRef}
              code={initialCode}
              highlighter={() => codeHighlighters[displayedLanguage()]}
              x={codeX}
              y={contentTop}
              width={contentWidth}
              height={viewportHeight}
              offset={[-1, -1]}
              fill={theme.text}
              fontFamily={theme.font.mono}
              fontSize={effectiveFontSize}
              lineHeight={lineHeightPx}
              selection={focus}
              drawHooks={{
                token(ctx, text, position, color, selection) {
                  ctx.globalAlpha *= focus ? 0.28 + 0.72 * selection : 1;
                  ctx.fillStyle = color;
                  ctx.fillText(text, position.x, position.y);
                },
              }}
            />

    </>
  );

  return (
    <Rect
      layout={false}
      x={x}
      y={y}
      width={width}
      height={height}
      fill={theme.surface}
      stroke={theme.border}
      lineWidth={2}
      radius={18}
    >
      {filesMode ? (
        <Node y={-height / 2 + 27}>
          <Rect
            ref={tabIndicator}
            x={tabCenters[initialFileIndex] ?? 0}
            width={tabWidth}
            height={30}
            radius={8}
            fill={theme.surfaceRaised}
            stroke={theme.border}
            lineWidth={1}
          >
            <Rect
              y={13}
              width={() => tabUnderline()}
              height={2}
              radius={1}
              fill={theme.accent}
            />
          </Rect>

          {fileList.map((file, index) => (
            <Txt
              key={"tab-" + file.name}
              ref={tabLabels}
              text={file.name}
              x={tabCenters[index]}
              y={0}
              width={tabWidth}
              textAlign="center"
              fill={theme.text}
              opacity={() => tabOpacity[index]()}
              fontFamily={theme.font.mono}
              fontSize={14}
              lineHeight={30}
            />
          ))}

          <Layout
            layout
            direction="row"
            gap={16}
            alignItems="center"
            x={width / 2 - 32}
            y={0}
            offset={[1, 0]}
          >
            <Txt
              text={() => displayedLanguage().toUpperCase()}
              fill={theme.muted}
              fontFamily={theme.font.mono}
              fontSize={14}
              letterSpacing={1}
            />
            <Txt
              text={() => displayedStatus()}
              fill={theme.accent}
              fontFamily={theme.font.mono}
              fontSize={13}
              letterSpacing={1}
            />
          </Layout>
        </Node>
      ) : (
        <Layout
          layout
          width={width}
          height={54}
          position={[0, -height / 2 + 27]}
          padding={[0, 32]}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Layout layout direction="row" gap={12} alignItems="center">
            <Rect width={8} height={8} radius={4} fill={theme.accent} />
            <Txt
              text={filename}
              fill={theme.text}
              fontFamily={theme.font.mono}
              fontSize={17}
            />
          </Layout>
          <Layout layout direction="row" gap={16} alignItems="center">
            <Txt
              text={() => displayedLanguage().toUpperCase()}
              fill={theme.muted}
              fontFamily={theme.font.mono}
              fontSize={14}
              letterSpacing={1}
            />
            <Txt
              text={() => displayedStatus()}
              fill={theme.accent}
              fontFamily={theme.font.mono}
              fontSize={13}
              letterSpacing={1}
            />
          </Layout>
        </Layout>
      )}

      <Rect
        width={width - 64}
        height={1}
        position={[0, -height / 2 + 54]}
        fill={theme.border}
      />

      <ClipViewport
        width={width}
        height={viewportHeight}
        position={[0, viewportTop + viewportHeight / 2]}
      >
        <Node y={() => Math.round(-currentStart() * lineHeightPx)}>
          {filesMode ? (
            <>
              <Node y={0}>
                {showLineNumbers &&
                  Array.from({ length: 64 }, (_, index) => (
                    <Txt
                      key={"next-gutter-" + index}
                      text={() => {
                        if (index >= nextFileLineCount()) return "";
                        return String(index + 1).padStart(2, "0");
                      }}
                      x={codeX - 55}
                      y={contentTop + index * lineHeightPx}
                      width={50}
                      textAlign="right"
                      offset={[0, -1]}
                      fill={theme.muted}
                      fontFamily={theme.font.mono}
                      fontSize={gutterFontSize}
                      lineHeight={lineHeightPx}
                    />
                  ))}

                <Code
                  ref={nextFileRef}
                  code=""
                  highlighter={codeHighlighters[initialLanguage]}
                  x={codeX}
                  y={contentTop}
                  width={contentWidth}
                  height={viewportHeight}
                  offset={[-1, -1]}
                  fill={theme.text}
                  fontFamily={theme.font.mono}
                  fontSize={effectiveFontSize}
                  lineHeight={lineHeightPx}
                  selection={focus}
                  drawHooks={{
                    token(ctx, text, position, color, selection) {
                      ctx.globalAlpha *= focus ? 0.28 + 0.72 * selection : 1;
                      ctx.fillStyle = color;
                      ctx.fillText(text, position.x, position.y);
                    },
                  }}
                />
              </Node>
              <RangeClipViewport
                width={width}
                height={viewportHeight}
                top={() => contentTop + wipeHeight()}
                bottom={() => contentTop + viewportHeight}
              >
                <Rect
                  x={0}
                  y={0}
                  width={width}
                  height={viewportHeight}
                  fill={theme.surface}
                />
                <Node ref={staticGroup} opacity={() => staticOpacity()}>
                  {staticViews}
                </Node>
              </RangeClipViewport>
              <Rect
                x={0}
                y={() => contentTop + wipeHeight()}
                width={width - 64}
                height={1.5}
                fill={theme.accent}
                opacity={() => wipeVisible()}
              />
            </>
          ) : (
            <>
              <Node ref={staticGroup} opacity={() => staticOpacity()}>
                {staticViews}
              </Node>
              {needsSlots && (
                <Node
                  ref={transitionGroup}
                  opacity={() => transitionOpacity()}
                  y={contentTop}
                >
                  {slotViews}
                </Node>
              )}
            </>
          )}

        </Node>
      </ClipViewport>
    </Rect>
  );
}
