import { it, expect, describe } from "vitest";
import { useCreateDashboard } from "../hooks/useCreateDashboard";

describe("useCreateDashboard", () => {
  it("should be a function", () => {
    expect(typeof useCreateDashboard).toBe("function");
  });
});
