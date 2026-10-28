import { Layout, Txt } from "@motion-canvas/2d";
import type { Node } from "@motion-canvas/2d";
import { createComputed } from "@motion-canvas/core";
import type { SignalValue } from "@motion-canvas/core";
import { layoutText, type TextLayoutResult } from "./textLayout";

type AutoTextProps = {
  text: SignalValue<string>;
  width: number;
  maxLines?: number;
  fontSize?: number;
  minFontSize?: number;
  lineHeight?: number;
  fontFamily: string;
  fontWeight?: number;
  letterSpacing?: number;
  fill: string;
  align?: "left" | "center" | "right";
  keyPrefix?: string;
};

let measureContext: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d");
  }
  return measureContext;
}

function readText(value: SignalValue<string>): string {
  return typeof value === "function" ? value() : value;
}

export function AutoText({
  text,
  width,
  maxLines = 1,
  fontSize = 32,
  minFontSize = 12,
  lineHeight = 1.2,
  fontFamily,
  fontWeight = 400,
  letterSpacing = 0,
  fill,
  align = "left",
  keyPrefix = "auto-text",
}: AutoTextProps): Node {
  const layout = createComputed<TextLayoutResult>(() => {
    const context = getMeasureContext();
    return layoutText(readText(text), {
      maxWidth: width,
      maxLines,
      fontSize,
      minFontSize,
      lineHeight,
      measure: (value, size) => {
        if (!context) return value.length * size * 0.6;
        context.font = `${fontWeight} ${size}px ${fontFamily}`;
        if ("letterSpacing" in context) {
          (context as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
            `${letterSpacing}px`;
        }
        return context.measureText(value).width;
      },
    });
  });

  return (
    <Layout layout direction="column" width={width} gap={0} alignItems={align === "center" ? "center" : "start"}>
      {Array.from({ length: maxLines }, (_, index) => (
        <Txt
          key={keyPrefix + "-" + index}
          text={() => layout().lines[index] ?? ""}
          width={width}
          height={() => (layout().lines[index] ? layout().lineHeightPx : 0)}
          fill={fill}
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          fontSize={() => layout().fontSize}
          lineHeight={lineHeight}
          letterSpacing={letterSpacing}
          textAlign={align}
        />
      ))}
    </Layout>
  );
}
