import { Rect, lines } from "@motion-canvas/2d";
import type { CodeRange } from "@motion-canvas/2d";
import { CodeStage } from "./CodeStage";
import { diffCode } from "./diff";
import type { CodeLanguage } from "./highlight";
import type { LineState } from "./diff";

type CodeDiffProps = {
  before: string;
  after: string;
  filename?: string;
  language?: CodeLanguage;
  beforeFocus?: CodeRange | CodeRange[];
  afterFocus?: CodeRange | CodeRange[];
  width?: number;
  height?: number;
};

function focusFor(changed: number[]): CodeRange | CodeRange[] | undefined {
  if (changed.length === 0) return undefined;
  const start = changed[0];
  const end = changed[changed.length - 1];
  return lines(start, end);
}

function states(linesOfCode: { state: LineState }[]): LineState[] {
  return linesOfCode.map((line) => line.state);
}

export function CodeDiff({
  before,
  after,
  filename = "example.ts",
  language = "ts",
  beforeFocus,
  afterFocus,
  width = 820,
  height = 430,
}: CodeDiffProps) {
  const offset = width / 2 + 14;
  const diff = diffCode(before, after);

  return (
    <Rect
      layout={false}
      width={width * 2 + 28}
      height={height}
    >
      <CodeStage
        x={-offset}
        code={before}
        filename={filename}
        language={language}
        width={width}
        height={height}
        fontSize={18}
        lineHeight={1.55}
        focus={beforeFocus ?? focusFor(diff.changedBefore)}
        lineStates={states(diff.before)}
        status="BEFORE"
      />
      <CodeStage
        x={offset}
        code={after}
        filename={filename}
        language={language}
        width={width}
        height={height}
        fontSize={18}
        lineHeight={1.55}
        focus={afterFocus ?? focusFor(diff.changedAfter)}
        lineStates={states(diff.after)}
        status="AFTER"
      />
    </Rect>
  );
}
