import { describe, expect, it } from "vitest";
import { diffCode } from "../src/code/diff";

describe("diffCode", () => {
  it("classifies same, removed and added lines", () => {
    const result = diffCode("a\nb\n", "a\nc\n");
    expect(result.before.map((line) => [line.text, line.state, line.lineNumber])).toEqual([
      ["a", "same", 0],
      ["b", "removed", 1],
    ]);
    expect(result.after.map((line) => [line.text, line.state, line.lineNumber])).toEqual([
      ["a", "same", 0],
      ["c", "added", 1],
    ]);
    expect(result.changedBefore).toEqual([1]);
    expect(result.changedAfter).toEqual([1]);
  });

  it("returns no changes for identical text", () => {
    const result = diffCode("x", "x");
    expect(result.before).toHaveLength(1);
    expect(result.after).toHaveLength(1);
    expect(result.before[0].state).toBe("same");
    expect(result.changedBefore).toEqual([]);
    expect(result.changedAfter).toEqual([]);
  });

  it("handles an empty before side", () => {
    const result = diffCode("", "x");
    expect(result.before).toEqual([]);
    expect(result.after).toHaveLength(1);
    expect(result.after[0]).toMatchObject({ text: "x", state: "added", lineNumber: 0 });
    expect(result.changedAfter).toEqual([0]);
  });

  it("handles an empty after side", () => {
    const result = diffCode("x", "");
    expect(result.before).toHaveLength(1);
    expect(result.after).toEqual([]);
    expect(result.before[0]).toMatchObject({ text: "x", state: "removed", lineNumber: 0 });
    expect(result.changedBefore).toEqual([0]);
  });

  it("does not count a trailing newline as an empty line", () => {
    const result = diffCode("a\n", "a\n");
    expect(result.before).toHaveLength(1);
    expect(result.after).toHaveLength(1);
  });
});
