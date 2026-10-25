import type { Reference, ThreadGenerator } from "@motion-canvas/core";
import {
  BBox,
  all,
  createRef,
  createSignal,
  easeOutBack,
  easeOutCubic,
} from "@motion-canvas/core";
import type { Node } from "@motion-canvas/2d";
import {
  Code,
  Line,
  Node as CanvasNode,
  Rect,
  Txt,
  lines,
  word,
} from "@motion-canvas/2d";
import type { CodeRange } from "@motion-canvas/2d";
import { theme } from "../theme";
import type { LinePlan } from "./lines";
import {
  resolveAnnotationTransitionPreset,
  type AnnotationTransitionPreset,
  type AnnotationTransitionPresetInput,
} from "./transitions";

export type AnnotationTone = "accent" | "warn" | "error";

export type AnnotationKind = "callout" | "underline" | "bracket" | "line";

/**
 * A motion is responsible for revealing the annotation content.
 * It runs on the inner content node so the outer anchor can still move.
 */
export type AnnotationMotion = (node: Node, duration: number) => ThreadGenerator;

export type CodeAnnotation = {
  id?: string;
  kind?: AnnotationKind;
  range?: CodeRange;
  /** Convenience shorthand for a whole-line range. */
  line?: number;
  label?: string;
  tone?: AnnotationTone;
  motion?: AnnotationMotion;
  underlineStyle?: "solid" | "wavy";
  /** Keep the range mapped through line-aware code transitions. */
  follow?: boolean;
};

export type CodeAnnotationHandle = {
  id: string;
  node: Node;
  reveal: (duration?: number) => ThreadGenerator;
  reposition: (duration?: number) => ThreadGenerator;
  remove: (duration?: number) => ThreadGenerator;
};

export type CodeAnnotationsController = {
  add: (annotation: CodeAnnotation) => CodeAnnotationHandle | null;
  hide: (duration?: number) => ThreadGenerator;
  applyPlans: (plans: LinePlan[]) => void;
  reposition: (duration?: number) => ThreadGenerator;
  remove: (id: string, duration?: number) => ThreadGenerator;
  clear: (duration?: number) => ThreadGenerator;
};

export const annotationMotions = {
  fade: (node: Node, duration: number) => all(node.opacity(1, duration)),

  fadeSlide: (node: Node, duration: number) => {
    node.y(12);
    return all(node.opacity(1, duration), node.y(0, duration, easeOutCubic));
  },

  pop: (node: Node, duration: number) => {
    node.y(8);
    return all(node.opacity(1, duration), node.y(0, duration, easeOutBack));
  },

  slideFromLeft: (node: Node, duration: number) => {
    node.x(-18);
    return all(node.opacity(1, duration), node.x(0, duration, easeOutCubic));
  },

  instant: (node: Node) => {
    node.opacity(1);
    return all();
  },
} as const;

function toneColor(tone: AnnotationTone = "accent") {
  if (tone === "warn") return theme.warn;
  if (tone === "error") return theme.error;
  return theme.accent;
}

function wavyPoints(width: number) {
  const points: [number, number][] = [];
  const step = 7;
  const amplitude = 3;
  let index = 0;
  for (let x = -width / 2; x <= width / 2; x += step) {
    points.push([x, index % 2 === 0 ? -amplitude : amplitude]);
    index++;
  }
  points.push([width / 2, 0]);
  return points;
}

function rangeFor(annotation: CodeAnnotation): CodeRange | null {
  if (annotation.range) return annotation.range;
  if (annotation.line !== undefined) return lines(annotation.line);
  return null;
}

function boundsOf(code: Code, range: CodeRange): BBox | null {
  const boxes = code.getSelectionBBox(range);
  if (boxes.length === 0) return null;
  return BBox.fromBBoxes(...boxes);
}

type AnnotationContext = {
  code: Code;
  range: CodeRange;
};

type BuiltAnnotation = {
  node: Node;
  content: Node;
  update: (
    bounds: BBox,
    duration: number,
    context: AnnotationContext,
  ) => ThreadGenerator;
  reveal: (duration: number) => ThreadGenerator;
  hide: (duration: number) => ThreadGenerator;
};

type BracketPair = {
  open: BBox;
  close: BBox;
};

function findBracketPair(
  code: Code,
  range: CodeRange,
): BracketPair | null {
  const lines = code.parsed().split("\n");
  const startLine = range[0][0];
  const endLine = range[1][0];
  const startText = lines[startLine] ?? "";
  const endText = lines[endLine] ?? "";
  const closing: Record<string, string> = {
    "(": ")",
    "[": "]",
    "{": "}",
  };

  let openChar = "";
  let openColumn = -1;
  for (let column = startText.length - 1; column >= range[0][1]; column--) {
    if ("([{".includes(startText[column])) {
      openChar = startText[column];
      openColumn = column;
      break;
    }
  }
  if (!openChar) return null;

  const limit = Number.isFinite(range[1][1])
    ? Math.min(endText.length, range[1][1])
    : endText.length;
  let closeColumn = -1;
  for (let column = 0; column < limit; column++) {
    if (endText[column] === closing[openChar]) {
      closeColumn = column;
      break;
    }
  }
  if (closeColumn < 0) return null;

  const openBox = code.getSelectionBBox(
    word(startLine, openColumn, 1),
  )[0];
  const closeBox = code.getSelectionBBox(
    word(endLine, closeColumn, 1),
  )[0];
  if (!openBox || !closeBox) return null;
  return { open: openBox, close: closeBox };
}

function buildAnnotation(
  code: Code,
  range: CodeRange,
  annotation: CodeAnnotation,
  bounds: BBox,
): BuiltAnnotation {
  const color = toneColor(annotation.tone);
  const kind = annotation.kind ?? "callout";
  const label = annotation.label ?? "";
  const content = createSignal<Node | null>(null);
  let node: Node;
  let update: BuiltAnnotation["update"];
  let hide: BuiltAnnotation["hide"];

  let reveal: BuiltAnnotation["reveal"];

  if (kind === "underline") {
    const width = createSignal(bounds.width);
    const wavy =
      annotation.underlineStyle === "wavy" ||
      (annotation.underlineStyle === undefined && annotation.tone === "error");
    const lineRef = createRef<Line>();
    const underline = (
      <CanvasNode opacity={0}>
        <Line
          ref={lineRef}
          points={wavy ? wavyPoints(bounds.width) : [[-bounds.width / 2, 0], [bounds.width / 2, 0]]}
          stroke={color}
          lineWidth={2}
          lineCap="round"
        />
      </CanvasNode>
    );
    const lineRange: CodeRange = [
      [range[0][0], 0],
      [range[1][0], Infinity],
    ];
    const initialLineBounds = boundsOf(code, lineRange) ?? bounds;
    const linePosition = [
      bounds.center.x,
      initialLineBounds.bottom + 7,
    ] as [number, number];
    const lineNode = lineRef();
    if (lineNode) lineNode.position(linePosition);
    content(underline);
    node = <CanvasNode>{underline}</CanvasNode>;
    update = (next, duration, context) => {
      width(next.width);
      const line = lineRef();
      if (!line) return all();
      line.points(
        wavy
          ? wavyPoints(next.width)
          : [[-next.width / 2, 0], [next.width / 2, 0]],
      );
      const nextLine =
        boundsOf(context.code, [
          [context.range[0][0], 0],
          [context.range[1][0], Infinity],
        ]) ?? next;
      return all(
        line.position(
          [next.center.x, nextLine.bottom + 7],
          duration,
          easeOutCubic,
        ),
      );
    };
    reveal = function* (duration) {
      underline.opacity(1);
      const line = lineRef();
      if (!line) return;
      line.end(0);
      yield* line.end(1, duration, easeOutCubic);
    };
    hide = function* (duration) {
      const line = lineRef();
      if (line) yield* line.end(0, duration);
      underline.opacity(0);
    };
  } else if (kind === "bracket") {
    const pair = findBracketPair(code, range);
    const openRef = createRef<CanvasNode>();
    const closeRef = createRef<CanvasNode>();
    const openBox = pair?.open ?? new BBox();
    const closeBox = pair?.close ?? new BBox();
    const makeBracket = (box: BBox, ref: typeof openRef) => (
      <CanvasNode
        ref={ref}
        position={[box.center.x, box.center.y]}
        opacity={0}
      >
        <Rect
          width={box.width + 8}
          height={box.height + 6}
          radius={3}
          fill={color}
          opacity={0.12}
        />
        <Rect
          width={box.width + 8}
          height={box.height + 6}
          radius={3}
          stroke={color}
          lineWidth={1.5}
        />
      </CanvasNode>
    );
    const bracket = (
      <CanvasNode opacity={0}>
        {makeBracket(openBox, openRef)}
        {makeBracket(closeBox, closeRef)}
      </CanvasNode>
    );
    content(bracket);
    node = <CanvasNode>{bracket}</CanvasNode>;
    update = (_next, duration, context) => {
      const nextPair = findBracketPair(context.code, context.range);
      const open = openRef();
      const close = closeRef();
      const animations: ThreadGenerator[] = [];
      if (!nextPair) {
        if (open) animations.push(open.opacity(0, duration));
        if (close) animations.push(close.opacity(0, duration));
        return all(...animations);
      }
      if (open) {
        open.opacity(1);
        animations.push(
          open.position(
            [nextPair.open.center.x, nextPair.open.center.y],
            duration,
            easeOutCubic,
          ),
        );
      }
      if (close) {
        close.opacity(1);
        animations.push(
          close.position(
            [nextPair.close.center.x, nextPair.close.center.y],
            duration,
            easeOutCubic,
          ),
        );
      }
      return all(...animations);
    };
    reveal = function* (duration) {
      bracket.opacity(1);
      const open = openRef();
      const close = closeRef();
      if (open) {
        open.opacity(1);
        open.scale(0.8);
        yield* open.scale(1, duration * 0.45, easeOutBack);
      }
      if (close) {
        close.opacity(1);
        close.scale(0.8);
        yield* close.scale(1, duration * 0.45, easeOutBack);
      }
    };
    hide = function* (duration) {
      const open = openRef();
      const close = closeRef();
      const animations: ThreadGenerator[] = [];
      if (open) {
        animations.push(open.opacity(0, duration));
        animations.push(open.scale(0.8, duration));
      }
      if (close) {
        animations.push(close.opacity(0, duration));
        animations.push(close.scale(0.8, duration));
      }
      yield* all(...animations);
      bracket.opacity(0);
    };
  } else if (kind === "line") {
    const targetWidth = Math.max(200, bounds.width + 16);
    const width = createSignal(targetWidth);
    const height = createSignal(Math.max(26, bounds.height + 6));
    const labelWidth = Math.max(80, label.length * 10 + 18);
    const pillRef = createRef<Rect>();
    const line = (
      <CanvasNode opacity={0}>
        <Rect
          x={() => width() / 2}
          width={() => width()}
          height={() => height()}
          radius={5}
          fill={color}
          opacity={0.05}
        />
        <Rect
          x={0}
          width={2}
          height={() => height() * 0.7}
          radius={1}
          fill={color}
        />
        {label && (
          <Rect
            ref={pillRef}
            x={() => width() + 10 + labelWidth / 2}
            width={labelWidth}
            height={22}
            radius={6}
            fill={theme.surfaceRaised}
            stroke={theme.border}
            lineWidth={1}
          >
            <Txt
              text={label}
              fill={color}
              fontFamily={theme.font.mono}
              fontSize={12}
            />
          </Rect>
        )}
      </CanvasNode>
    );
    content(line);
    node = (
      <CanvasNode position={[bounds.left, bounds.center.y]}>
        {line}
      </CanvasNode>
    );
    update = (next, duration) => {
      width(Math.max(200, next.width + 16));
      height(Math.max(26, next.height + 6));
      return all(node.position([next.left, next.center.y], duration, easeOutCubic));
    };
    reveal = function* (duration) {
      line.opacity(1);
      width(0);
      const pill = pillRef();
      if (pill) pill.opacity(0);
      yield* width(targetWidth, duration * 0.65, easeOutCubic);
      if (pill) yield* pill.opacity(1, duration * 0.35);
    };
    hide = function* (duration) {
      const pill = pillRef();
      const animations: ThreadGenerator[] = [];
      animations.push(width(0, duration * 0.6));
      if (pill) animations.push(pill.opacity(0, duration * 0.4));
      yield* all(...animations);
      line.opacity(0);
    };
  } else {
    const calloutWidth = Math.max(140, label.length * 11 + 26);
    const connector = 36;
    const lineRef = createRef<Line>();
    const pillRef = createRef<Rect>();
    const callout = (
      <CanvasNode opacity={0}>
        <Rect width={4} height={4} radius={2} fill={color} />
        <Line
          ref={lineRef}
          points={[[2, 0], [connector, 0]]}
          stroke={color}
          lineWidth={1.5}
          lineCap="round"
        />
        <Rect
          ref={pillRef}
          x={connector + calloutWidth / 2}
          width={calloutWidth}
          height={38}
          radius={8}
          fill={theme.surfaceRaised}
          stroke={theme.border}
          lineWidth={1}
        >
          <Rect
            x={-calloutWidth / 2 + 9}
            width={3}
            height={16}
            radius={1.5}
            fill={color}
          />
          <Txt
            text={label}
            width={calloutWidth - 30}
            textAlign="center"
            fill={theme.text}
            fontFamily={theme.font.mono}
            fontSize={14}
          />
        </Rect>
      </CanvasNode>
    );
    content(callout);
    node = (
      <CanvasNode position={[bounds.right + 10, bounds.center.y]}>
        {callout}
      </CanvasNode>
    );
    update = (next, duration) =>
      all(node.position([next.right + 10, next.center.y], duration, easeOutCubic));
    reveal = function* (duration) {
      callout.opacity(1);
      const line = lineRef();
      const pill = pillRef();
      if (pill) {
        pill.opacity(0);
        pill.scale(0.92);
      }
      if (line) {
        line.end(0);
        yield* line.end(1, duration * 0.55, easeOutCubic);
      }
      if (pill) {
        yield* all(
          pill.opacity(1, duration * 0.45),
          pill.scale(1, duration * 0.45, easeOutBack),
        );
      }
    };
    hide = function* (duration) {
      const line = lineRef();
      const pill = pillRef();
      const animations: ThreadGenerator[] = [];
      if (line) animations.push(line.end(0, duration * 0.6));
      if (pill) {
        animations.push(pill.opacity(0, duration * 0.6));
        animations.push(pill.scale(0.92, duration * 0.6));
      }
      yield* all(...animations);
      callout.opacity(0);
    };
  }

  const inner = content();
  if (!inner) {
    throw new Error("annotation content was not created");
  }

  return {
    node,
    content: inner,
    update: (next, duration, context) => update(next, duration, context),
    reveal,
    hide,
  };
}

function hideNode(node: Node) {
  node.opacity(0);
}

function mapRange(range: CodeRange, plans: LinePlan[]): CodeRange | null {
  const mapLine = (line: number) => {
    const plan = plans.find(
      (item) =>
        item.beforeIndex === line &&
        (item.kind === "keep" || item.kind === "replace"),
    );
    return plan?.afterIndex ?? null;
  };

  const start = mapLine(range[0][0]);
  const end = mapLine(range[1][0]);
  if (start === null || end === null) return null;
  return [
    [start, range[0][1]],
    [end, range[1][1]],
  ];
}

/**
 * Create one standalone annotation. The caller owns mounting the returned node.
 * Use createCodeAnnotations when annotations need to follow code transitions.
 */
export function createCodeAnnotation(
  code: Code,
  annotation: CodeAnnotation,
): CodeAnnotationHandle | null {
  const range = rangeFor(annotation);
  if (!range) return null;
  const bounds = boundsOf(code, range);
  if (!bounds) return null;

  const built = buildAnnotation(code, range, annotation, bounds);
  const id = annotation.id ?? "annotation";

  return {
    id,
    node: built.node,
    reveal: (duration = 0.5) => {
      built.node.opacity(1);
      return annotation.motion
        ? annotation.motion(built.content, duration)
        : built.reveal(duration);
    },
    reposition: function* (duration = 0.4) {
      const next = boundsOf(code, range);
      if (next) {
        yield* built.update(next, duration, { code, range });
      }
    },
    remove: function* (duration = 0.2) {
      if (duration > 0) yield* built.node.opacity(0, duration);
      else built.node.opacity(0);
      built.node.remove();
    },
  };
}

type Entry = {
  id: string;
  spec: CodeAnnotation;
  range: CodeRange;
  node: Node;
  content: Node;
  update: BuiltAnnotation["update"];
  reveal: BuiltAnnotation["reveal"];
  hide: BuiltAnnotation["hide"];
  revealed: boolean;
  hidden: boolean;
};

export function createCodeAnnotations(
  codeRef: Reference<Code>,
  options: { preset?: AnnotationTransitionPresetInput } = {},
): CodeAnnotationsController {
  const preset: AnnotationTransitionPreset =
    resolveAnnotationTransitionPreset(options.preset);
  const entries = new Map<string, Entry>();
  let counter = 0;

  const resolve = () => {
    try {
      return codeRef();
    } catch {
      return null;
    }
  };

  const removeEntry = function* (
    entry: Entry,
    duration: number,
  ): ThreadGenerator {
    if (duration > 0) {
      yield* entry.node.opacity(0, duration);
    } else {
      entry.node.opacity(0);
    }
    entry.node.remove();
    entries.delete(entry.id);
  };

  const controller: CodeAnnotationsController = {
    add(annotation) {
      const code = resolve();
      if (!code) return null;
      const range = rangeFor(annotation);
      if (!range) return null;
      const bounds = boundsOf(code, range);
      if (!bounds) return null;

      const id = annotation.id ?? `annotation-${++counter}`;
      const existing = entries.get(id);
      if (existing) {
        existing.node.remove();
        entries.delete(id);
      }

      const built = buildAnnotation(code, range, annotation, bounds);
      const entry: Entry = {
        id,
        spec: annotation,
        range,
        node: built.node,
        content: built.content,
        update: built.update,
        reveal: built.reveal,
        hide: built.hide,
        revealed: false,
        hidden: false,
      };
      entries.set(id, entry);
      code.add(built.node);

      return {
        id,
        node: built.node,
        reveal: (duration = preset.reveal) => {
          entry.revealed = true;
          entry.hidden = false;
          entry.node.opacity(1);
          return annotation.motion
            ? annotation.motion(entry.content, duration)
            : entry.reveal(duration);
        },
        reposition: function* (duration = preset.reposition) {
          const nextCode = resolve();
          if (!nextCode) return;
          const next = boundsOf(nextCode, entry.range);
          if (!next) {
            hideNode(entry.node);
            return;
          }
          entry.node.opacity(1);
          yield* entry.update(next, duration, {
            code: nextCode,
            range: entry.range,
          });
        },
        remove: (duration = preset.hide) => removeEntry(entry, duration),
      };
    },

    hide: function* (duration = preset.hide) {
      const animations: ThreadGenerator[] = [];
      entries.forEach((entry) => {
        if (!entry.revealed) return;
        animations.push(entry.hide(duration));
      });
      yield* all(...animations);
    },

    applyPlans(plans) {
      if (plans.length === 0) return;
      entries.forEach((entry) => {
        if (entry.spec.follow === false) return;
        const next = mapRange(entry.range, plans);
        if (!next) {
          entry.hidden = true;
          return;
        }
        entry.range = next;
        entry.hidden = false;
      });
    },

    reposition: function* (duration = preset.reposition) {
      const code = resolve();
      if (!code) {
        yield* all();
        return;
      }

      const reveals: ThreadGenerator[] = [];
      for (const entry of entries.values()) {
        if (!entry.revealed) continue;
        if (entry.hidden) {
          entry.node.opacity(0);
          continue;
        }
        const bounds = boundsOf(code, entry.range);
        if (!bounds) {
          entry.node.opacity(0);
          continue;
        }

        entry.node.opacity(1);
        // Snap to the new anchor first, then replay this kind's own reveal.
        yield* entry.update(bounds, 0, { code, range: entry.range });
        reveals.push(entry.reveal(duration));
      }

      yield* all(...reveals);
    },

    remove: (id, duration = preset.hide) => {
      const entry = entries.get(id);
      if (!entry) return all();
      return removeEntry(entry, duration);
    },

    clear: function* (duration = preset.hide) {
      const current = [...entries.values()];
      if (current.length === 0) {
        yield* all();
        return;
      }
      const removals: ThreadGenerator[] = current.map((entry) =>
        removeEntry(entry, duration),
      );
      yield* all(...removals);
    },
  };

  return controller;
}
