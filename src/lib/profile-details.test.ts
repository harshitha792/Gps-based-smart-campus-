import { describe, expect, it } from "vitest";
import { registrationLabel, validRegistration } from "./profile-details";
describe("registration details", () => {
  it("uses a student SRN field", () => expect(registrationLabel("student")).toBe("Student SRN"));
  it("uses a teacher registration field", () => expect(registrationLabel("teacher")).toBe("Teacher registration number"));
  it("uses a staff registration field", () => expect(registrationLabel("staff")).toBe("Staff ID / registration number"));
  it("rejects blank registration identifiers", () => expect(validRegistration(" ")).toBe(false));
  it("accepts a supplied SRN", () => expect(validRegistration("R26CS001")).toBe(true));
});