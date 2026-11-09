import { describe, expect, it } from "vitest";

describe("web test setup", () => {
  it("runs in the configured DOM environment", () => {
    expect(document.createElement("main").tagName).toBe("MAIN");
  });
});
