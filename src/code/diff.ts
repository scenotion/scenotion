import { diffLines } from "diff";

export type LineState = "same" | "added" | "removed";

export type DiffLine = {
  text: string;
  state: LineState;
  lineNumber: number;
};

export type CodeDiffResult = {
  before: DiffLine[];
  after: DiffLine[];
  changedBefore: number[];
  changedAfter: number[];
};

function splitChunk(value: string): string[] {
  const lines = value.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

export function diffCode(before: string, after: string): CodeDiffResult {
  const parts = diffLines(before, after);
  const beforeLines: Omit<DiffLine, "lineNumber">[] = [];
  const afterLines: Omit<DiffLine, "lineNumber">[] = [];

  for (const part of parts) {
    const lines = splitChunk(part.value);

    if (part.removed) {
      for (const text of lines) {
        beforeLines.push({ text, state: "removed" });
      }
      continue;
    }

    if (part.added) {
      for (const text of lines) {
        afterLines.push({ text, state: "added" });
      }
      continue;
    }

    for (const text of lines) {
      beforeLines.push({ text, state: "same" });
      afterLines.push({ text, state: "same" });
    }
  }

  const beforeResult = beforeLines.map((line, index) => ({
    ...line,
    lineNumber: index,
  }));
  const afterResult = afterLines.map((line, index) => ({
    ...line,
    lineNumber: index,
  }));

  return {
    before: beforeResult,
    after: afterResult,
    changedBefore: beforeResult
      .filter((line) => line.state === "removed")
      .map((line) => line.lineNumber),
    changedAfter: afterResult
      .filter((line) => line.state === "added")
      .map((line) => line.lineNumber),
  };
}
