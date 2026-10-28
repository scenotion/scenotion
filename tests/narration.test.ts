import { describe, expect, it } from "vitest";
import {
  clampNumber,
  defaultTakeManifest,
  isNarrationLocale,
  isSafeId,
  normalizeTakePatch,
  slugify,
  type VoiceTake,
} from "../src/narration/model";

const take: VoiceTake = {
  id: "take-1",
  lineId: "opening",
  locale: "en-US",
  file: "take-1.webm",
  mimeType: "audio/webm",
  duration: 4,
  size: 1200,
  createdAt: "2026-01-01T00:00:00.000Z",
  offset: 0,
  trimStart: 0,
  trimEnd: 4,
  gainDb: 0,
  fadeIn: 0,
  fadeOut: 0,
  active: true,
};

describe("narration model", () => {
  it("slugifies project names", () => {
    expect(slugify("Code Workflow")).toBe("code-workflow");
    expect(slugify("  Hello, World!  ")).toBe("hello-world");
    expect(slugify("")).toBe("project");
  });

  it("validates ids and locales", () => {
    expect(isSafeId("code-workflow")).toBe(true);
    expect(isSafeId("../escape")).toBe(false);
    expect(isSafeId("Code Workflow")).toBe(false);
    expect(isNarrationLocale("zh-CN")).toBe(true);
    expect(isNarrationLocale("fr-FR")).toBe(false);
  });

  it("clamps numeric values", () => {
    expect(clampNumber(10, 0, 5)).toBe(5);
    expect(clampNumber(-10, 0, 5)).toBe(0);
    expect(clampNumber(Number.NaN, 0, 5, 2)).toBe(2);
  });

  it("normalizes take metadata", () => {
    const next = normalizeTakePatch(take, {
      offset: 100,
      trimStart: 2,
      trimEnd: 1,
      gainDb: 100,
      fadeIn: 10,
      fadeOut: 10,
      active: false,
    });
    expect(next.offset).toBe(60);
    expect(next.trimStart).toBe(2);
    expect(next.trimEnd).toBe(2);
    expect(next.gainDb).toBe(24);
    expect(next.fadeIn).toBe(0);
    expect(next.fadeOut).toBe(0);
    expect(next.active).toBe(false);
  });

  it("creates an empty manifest", () => {
    expect(defaultTakeManifest("code-workflow", "zh-CN")).toEqual({
      version: 1,
      project: "code-workflow",
      locale: "zh-CN",
      lines: {},
    });
  });
});
