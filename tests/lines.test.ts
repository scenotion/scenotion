import { describe, expect, it } from "vitest";
import { buildLinePlans } from "../src/code/lines";

describe("buildLinePlans", () => {
  it("keeps identical code", () => {
    const plans = buildLinePlans("const a = 1;\nreturn a;", "const a = 1;\nreturn a;");
    expect(plans.map((plan) => plan.kind)).toEqual(["keep", "keep"]);
    expect(plans.map((plan) => plan.beforeIndex)).toEqual([0, 1]);
    expect(plans.map((plan) => plan.afterIndex)).toEqual([0, 1]);
  });

  it("keeps line identity when a line is inserted", () => {
    const plans = buildLinePlans(
      "const a = 1;\nreturn a;",
      "const a = 1;\nconst b = 2;\nreturn a;",
    );
    expect(plans.map((plan) => plan.kind)).toEqual(["keep", "insert", "keep"]);
    const insert = plans[1];
    expect(insert.beforeIndex).toBeNull();
    expect(insert.afterIndex).toBe(1);
    expect(insert.afterText).toBe("const b = 2;");
  });

  it("marks a similar line as replace", () => {
    const plans = buildLinePlans("const answer = 41;", "const answer = 42;");
    expect(plans).toHaveLength(1);
    expect(plans[0].kind).toBe("replace");
    expect(plans[0].beforeText).toBe("const answer = 41;");
    expect(plans[0].afterText).toBe("const answer = 42;");
  });

  it("marks a deleted line as remove", () => {
    const plans = buildLinePlans("a\nb\nc", "a\nc");
    expect(plans.map((plan) => plan.kind)).toEqual(["keep", "remove", "keep"]);
    expect(plans[1].beforeText).toBe("b");
    expect(plans[1].afterText).toBe("");
  });

  it("handles empty code without inventing a blank line", () => {
    expect(buildLinePlans("only", "").map((plan) => plan.kind)).toEqual(["remove"]);
    expect(buildLinePlans("", "only").map((plan) => plan.kind)).toEqual(["insert"]);
    expect(buildLinePlans("", "")).toEqual([]);
  });

  it("assigns stable ids in order", () => {
    const plans = buildLinePlans("a\nb", "a\nb\nc");
    expect(plans.map((plan) => plan.id)).toEqual([0, 1, 2]);
  });
});
