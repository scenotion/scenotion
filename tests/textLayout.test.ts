import { describe, expect, it } from "vitest";
import { layoutText, wrapParagraph } from "../src/i18n/textLayout";

const measure = (text: string, fontSize: number) => text.length * fontSize * 0.6;

describe("wrapParagraph", () => {
  it("wraps Latin words at spaces", () => {
    expect(wrapParagraph("hello world again", 40, 10, measure)).toEqual([
      "hello",
      "world",
      "again",
    ]);
  });

  it("wraps CJK text between characters", () => {
    expect(wrapParagraph("代码就是时间轴", 30, 10, measure)).toEqual([
      "代码就是时",
      "间轴",
    ]);
  });

  it("splits a long unbreakable token", () => {
    expect(wrapParagraph("abcdefghij", 30, 10, measure)).toEqual(["abcde", "fghij"]);
  });
});

describe("layoutText", () => {
  it("keeps a short title on one line", () => {
    const result = layoutText("Code is a timeline.", {
      maxWidth: 1000,
      maxLines: 1,
      fontSize: 40,
      minFontSize: 20,
      lineHeight: 1.1,
      measure,
    });
    expect(result.lines).toEqual(["Code is a timeline."]);
    expect(result.fontSize).toBe(40);
  });

  it("shrinks before wrapping a one-line title", () => {
    const result = layoutText("A very long localized title", {
      maxWidth: 300,
      maxLines: 1,
      fontSize: 40,
      minFontSize: 10,
      lineHeight: 1.1,
      measure,
    });
    expect(result.lines).toHaveLength(1);
    expect(result.fontSize).toBeLessThan(40);
  });

  it("uses multiple lines up to the limit", () => {
    const result = layoutText("one two three four five six", {
      maxWidth: 60,
      maxLines: 2,
      fontSize: 10,
      minFontSize: 10,
      lineHeight: 1.2,
      measure,
    });
    expect(result.lines.length).toBeLessThanOrEqual(2);
    expect(result.lines[result.lines.length - 1]).toContain("\u2026");
  });

  it("keeps explicit blank lines", () => {
    const result = layoutText("a\n\nb", {
      maxWidth: 100,
      maxLines: 3,
      fontSize: 10,
      minFontSize: 10,
      measure,
    });
    expect(result.lines).toEqual(["a", "", "b"]);
  });
});
