import { describe, expect, it } from "vitest";
import { translateUiString } from "../editor/i18n";

describe("editor UI translation", () => {
  it("translates common chrome labels", () => {
    expect(translateUiString("Video Settings")).toBe("视频设置");
    expect(translateUiString("General")).toBe("常规");
    expect(translateUiString("PAUSED")).toBe("已暂停");
  });

  it("translates dynamic console counts", () => {
    expect(translateUiString("Console (3)")).toBe("控制台 (3)");
  });

  it("leaves unknown user content untouched", () => {
    expect(translateUiString("CodeWorkflow")).toBe("CodeWorkflow");
    expect(translateUiString("const answer = 42;")).toBe("const answer = 42;");
  });
});
