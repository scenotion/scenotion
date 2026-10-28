export type LinePlanKind = "keep" | "replace" | "insert" | "remove";

export type LinePlan = {
  id: number;
  kind: LinePlanKind;
  beforeIndex: number | null;
  afterIndex: number | null;
  beforeText: string;
  afterText: string;
};

type AlignmentStep =
  | {type: "pair"; before: number; after: number}
  | {type: "remove"; before: number}
  | {type: "insert"; after: number};

const MATCH_THRESHOLD = 0.32;

function tokens(line: string): string[] {
  return line.toLowerCase().match(/[a-z0-9_]+|[^a-z0-9_\s]/g) ?? [];
}

function similarity(before: string, after: string): number {
  if (before === after) return 1;
  const beforeTrimmed = before.trim();
  const afterTrimmed = after.trim();
  if (beforeTrimmed === afterTrimmed) return 1;
  if (beforeTrimmed === "" || afterTrimmed === "") return 0;

  const beforeTokens = tokens(beforeTrimmed);
  const afterTokens = tokens(afterTrimmed);
  const tokenCounts = new Map<string, number>();
  for (const token of beforeTokens) {
    tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
  }

  let shared = 0;
  for (const token of afterTokens) {
    const count = tokenCounts.get(token) ?? 0;
    if (count > 0) {
      shared++;
      tokenCounts.set(token, count - 1);
    }
  }

  const tokenScore =
    (2 * shared) / (beforeTokens.length + afterTokens.length || 1);

  const beforeGrams = new Map<string, number>();
  for (let i = 0; i < beforeTrimmed.length - 1; i++) {
    const gram = beforeTrimmed.slice(i, i + 2);
    beforeGrams.set(gram, (beforeGrams.get(gram) ?? 0) + 1);
  }
  let sharedGrams = 0;
  for (let i = 0; i < afterTrimmed.length - 1; i++) {
    const gram = afterTrimmed.slice(i, i + 2);
    const count = beforeGrams.get(gram) ?? 0;
    if (count > 0) {
      sharedGrams++;
      beforeGrams.set(gram, count - 1);
    }
  }
  const gramScore =
    (2 * sharedGrams) /
    (Math.max(0, beforeTrimmed.length - 1) +
      Math.max(0, afterTrimmed.length - 1) || 1);

  return tokenScore * 0.7 + gramScore * 0.3;
}

function alignLines(before: string[], after: string[]): AlignmentStep[] {
  const n = before.length;
  const m = after.length;

  if (n === 0) {
    return after.map((_, index) => ({type: "insert" as const, after: index}));
  }
  if (m === 0) {
    return before.map((_, index) => ({type: "remove" as const, before: index}));
  }

  const width = m + 1;
  const score = new Float32Array((n + 1) * width);
  const direction = new Uint8Array((n + 1) * width);

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cell = i * width + j;
      const diagonal = score[(i - 1) * width + (j - 1)];
      const up = score[(i - 1) * width + j];
      const left = score[i * width + (j - 1)];

      let best = Math.max(up, left);
      let dir = up >= left ? 1 : 2;

      const match = similarity(before[i - 1], after[j - 1]);
      if (match >= MATCH_THRESHOLD) {
        const candidate = diagonal + match;
        if (candidate > best + 1e-6) {
          best = candidate;
          dir = 0;
        }
      }

      score[cell] = best;
      direction[cell] = dir;
    }
  }

  const steps: AlignmentStep[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const cell = i * width + j;
    const dir = i === 0 ? 2 : j === 0 ? 1 : direction[cell];

    if (dir === 0) {
      steps.push({type: "pair", before: i - 1, after: j - 1});
      i--;
      j--;
    } else if (dir === 1) {
      steps.push({type: "remove", before: i - 1});
      i--;
    } else {
      steps.push({type: "insert", after: j - 1});
      j--;
    }
  }

  return steps.reverse();
}

/**
 * Align two code blocks into line-level plans.
 *
 * Exact LCS matching is not enough for edited lines: inserting one line before a
 * return statement would pair the old return with the new const line and pair
 * the old brace with the new return, producing meaningless replacements. The
 * alignment below scores token and bigram similarity inside each gap, so lines
 * keep their identity when possible and structural rows become inserts/removes.
 */
function splitCodeLines(code: string): string[] {
  return code === "" ? [] : code.split("\n");
}

export function buildLinePlans(before: string, after: string): LinePlan[] {
  const beforeLines = splitCodeLines(before);
  const afterLines = splitCodeLines(after);
  const alignment = alignLines(beforeLines, afterLines);

  return alignment.map((step, id) => {
    if (step.type === "pair") {
      const beforeText = beforeLines[step.before];
      const afterText = afterLines[step.after];
      return {
        id,
        kind: beforeText === afterText ? "keep" : "replace",
        beforeIndex: step.before,
        afterIndex: step.after,
        beforeText,
        afterText,
      };
    }

    if (step.type === "remove") {
      return {
        id,
        kind: "remove",
        beforeIndex: step.before,
        afterIndex: null,
        beforeText: beforeLines[step.before],
        afterText: "",
      };
    }

    return {
      id,
      kind: "insert",
      beforeIndex: null,
      afterIndex: step.after,
      beforeText: "",
      afterText: afterLines[step.after],
    };
  });
}
