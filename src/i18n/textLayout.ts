export type MeasureText = (text: string, fontSize: number) => number;

export type TextLayoutOptions = {
  maxWidth: number;
  maxLines?: number;
  fontSize?: number;
  minFontSize?: number;
  lineHeight?: number;
  measure: MeasureText;
};

export type TextLayoutResult = {
  fontSize: number;
  lineHeightPx: number;
  lines: string[];
};

const CJK = /[\u2e80-\u9fff\u3040-\u30ff\uac00-\ud7af\uf900-\ufaff]/;

function isCjk(char: string): boolean {
  return CJK.test(char);
}

function tokenize(text: string): string[] {
  const tokens: string[] = [];
  let buffer = "";

  const flush = () => {
    if (buffer) {
      tokens.push(buffer);
      buffer = "";
    }
  };

  for (const char of Array.from(text)) {
    if (/\s/.test(char)) {
      flush();
      tokens.push(char);
      continue;
    }
    if (isCjk(char)) {
      flush();
      tokens.push(char);
      continue;
    }
    buffer += char;
  }

  flush();
  return tokens;
}

function splitToken(
  token: string,
  maxWidth: number,
  measure: MeasureText,
  fontSize: number,
): string[] {
  const parts: string[] = [];
  let part = "";
  for (const char of Array.from(token)) {
    if (part && measure(part + char, fontSize) > maxWidth) {
      parts.push(part);
      part = char;
    } else {
      part += char;
    }
  }
  if (part) parts.push(part);
  return parts;
}

export function wrapParagraph(
  text: string,
  maxWidth: number,
  fontSize: number,
  measure: MeasureText,
): string[] {
  const lines: string[] = [];
  let line = "";

  for (const token of tokenize(text)) {
    if (/^\s+$/.test(token)) {
      if (!line) continue;
      if (measure(line + token, fontSize) <= maxWidth) {
        line += token;
      } else {
        lines.push(line.trimEnd());
        line = "";
      }
      continue;
    }

    const candidate = line + token;
    if (!line || measure(candidate, fontSize) <= maxWidth) {
      if (!line && measure(token, fontSize) > maxWidth) {
        const parts = splitToken(token, maxWidth, measure, fontSize);
        lines.push(...parts.slice(0, -1));
        line = parts[parts.length - 1] ?? "";
      } else {
        line = candidate;
      }
      continue;
    }

    lines.push(line.trimEnd());
    line = token;
    if (measure(token, fontSize) > maxWidth) {
      const parts = splitToken(token, maxWidth, measure, fontSize);
      lines.push(...parts.slice(0, -1));
      line = parts[parts.length - 1] ?? "";
    }
  }

  if (line.trim()) lines.push(line.trimEnd());
  return lines.length > 0 ? lines : [""];
}

function withEllipsis(
  line: string,
  maxWidth: number,
  fontSize: number,
  measure: MeasureText,
): string {
  if (measure(line + "\u2026", fontSize) <= maxWidth) return line + "\u2026";
  const chars = Array.from(line);
  while (chars.length > 0 && measure(chars.join("") + "\u2026", fontSize) > maxWidth) {
    chars.pop();
  }
  return chars.join("") + "\u2026";
}

export function layoutText(
  text: string,
  {
    maxWidth,
    maxLines = 1,
    fontSize: preferredFontSize = 32,
    minFontSize = 12,
    lineHeight = 1.2,
    measure,
  }: TextLayoutOptions,
): TextLayoutResult {
  const lineLimit = Math.max(1, Math.floor(maxLines));
  const preferred = Math.max(1, preferredFontSize);
  const minimum = Math.min(preferred, Math.max(1, minFontSize));
  const width = Math.max(1, maxWidth);
  const paragraphs = text.split("\n");

  const layoutAt = (size: number): TextLayoutResult => ({
    fontSize: size,
    lineHeightPx: Math.round(size * lineHeight),
    lines: paragraphs.flatMap((paragraph) =>
      paragraph === "" ? [""] : wrapParagraph(paragraph, width, size, measure),
    ),
  });

  for (let size = preferred; size >= minimum; size--) {
    const result = layoutAt(size);
    if (result.lines.length <= lineLimit) return result;
  }

  const result = layoutAt(minimum);
  if (result.lines.length <= lineLimit) return result;

  const lines = result.lines.slice(0, lineLimit);
  lines[lineLimit - 1] = withEllipsis(
    lines[lineLimit - 1],
    width,
    minimum,
    measure,
  );
  return { ...result, lines };
}
