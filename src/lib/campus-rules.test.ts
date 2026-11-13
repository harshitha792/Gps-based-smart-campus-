import { describe, expect, it } from "vitest";
import { classifyComplaint, canRateReport, validInterval, validPhoto } from "./campus-rules";
describe("campus workflow rules", () => {
  it("categorizes Wi-Fi issues", () =>
    expect(classifyComplaint("Classroom Wi-Fi not working")).toBe("Wi-Fi"));
  it("only rates resolved complaints", () => {
    expect(canRateReport("Complaint", "Open")).toBe(false);
    expect(canRateReport("Complaint", "Resolved")).toBe(true);
  });
  it("requires an end after the start", () => {
    expect(validInterval("2026-12-01T10:00", "2026-12-01T09:00")).toBe(false);
    expect(validInterval("2026-12-01T10:00", "2026-12-01T11:00")).toBe(true);
  });
  it("accepts only supported photos within 5MB", () => {
    expect(validPhoto({ type: "image/png", size: 5242880 })).toBe(true);
    expect(validPhoto({ type: "image/png", size: 5242881 })).toBe(false);
    expect(validPhoto({ type: "text/html", size: 10 })).toBe(false);
  });
});
