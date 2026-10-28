import { afterEach, describe, expect, it } from "vitest";
import {
  formatMessage,
  localeSignal,
  parseLocale,
  resolveLocale,
  setLocale,
  t,
  translate,
} from "../src/i18n";
import { enUS } from "../src/i18n/catalogs/en-US";
import { zhCN } from "../src/i18n/catalogs/zh-CN";

afterEach(() => {
  setLocale("en-US");
});

describe("locale resolution", () => {
  it("accepts language and region forms", () => {
    expect(parseLocale("zh")).toBe("zh-CN");
    expect(parseLocale("zh-Hans")).toBe("zh-CN");
    expect(parseLocale("en-GB")).toBe("en-US");
    expect(parseLocale("fr-FR")).toBeNull();
    expect(parseLocale(null)).toBeNull();
  });

  it("prefers the URL over stored preference", () => {
    expect(resolveLocale({ search: "?locale=zh-CN", stored: "en-US" })).toBe("zh-CN");
    expect(resolveLocale({ search: "?locale=fr", stored: "zh-CN" })).toBe("zh-CN");
    expect(resolveLocale({ search: "?locale=fr", stored: "fr" })).toBe("en-US");
  });
});

describe("catalog", () => {
  it("keeps both locales in sync", () => {
    expect(Object.keys(zhCN).sort()).toEqual(Object.keys(enUS).sort());
  });

  it("translates and interpolates", () => {
    expect(translate("en-US", "codeWorkflow.title")).toBe("Code is a timeline.");
    expect(translate("zh-CN", "codeWorkflow.title")).toBe("代码就是时间轴。");
    expect(formatMessage("Hello {name}", { name: "Scenotion" })).toBe("Hello Scenotion");
    expect(formatMessage("Hello {name}")).toBe("Hello {name}");
  });

  it("reads the active locale signal", () => {
    setLocale("zh-CN");
    expect(localeSignal()).toBe("zh-CN");
    expect(t("codeWorkflow.title")).toBe("代码就是时间轴。");
    setLocale("en-US");
    expect(t("codeWorkflow.title")).toBe("Code is a timeline.");
  });
});
