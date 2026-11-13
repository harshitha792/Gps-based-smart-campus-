import { describe, expect, it } from "vitest";
import { CAMPUS, distanceFromCampus, isInsideCampus } from "./geo";

describe("campus geofence", () => {
  it("campus centre is inside", () => {
    expect(isInsideCampus(CAMPUS.lat, CAMPUS.lng)).toBe(true);
  });
  it("Bengaluru city centre (~17 km away) is outside", () => {
    expect(distanceFromCampus(12.9716, 77.5946)).toBeGreaterThan(15000);
    expect(isInsideCampus(12.9716, 77.5946)).toBe(false);
  });
  it("a point ~1 km north is outside the 500 m radius", () => {
    expect(isInsideCampus(CAMPUS.lat + 0.009, CAMPUS.lng)).toBe(false);
  });
});
