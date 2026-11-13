import { describe, expect, it } from "vitest";
import { ACCOUNT_TYPES, canManageCampus, canAccessCampusTool } from "./account-types";
import { EVENTS } from "./campus-data";

describe("campus access", () => {
  it("supports students, teachers and working staff, not visitors", () => {
    expect(ACCOUNT_TYPES.map((type) => type.value)).toEqual(["student", "teacher", "staff"]);
  });
  it("does not grant management from a self-selected teacher account", () => {
    expect(canManageCampus(["teacher"])).toBe(false);
  });
  it("does not grant management from a self-selected staff account", () => {
    expect(canManageCampus(["staff"])).toBe(false);
  });
  it("grants management only to an approved campus manager", () => {
    expect(canManageCampus(["campus_manager"])).toBe(true);
  });
  it.each(["student", "teacher", "staff"])("keeps shared services available without approvals for %s", () => {
    const access = { manager: false, admin: false, security: false };
    expect(canAccessCampusTool("/bookings", access)).toBe(true);
    expect(canAccessCampusTool("/attendance", access)).toBe(true);
    expect(canAccessCampusTool("/operations", access)).toBe(false);
  });
  it("does not grant campus operations to event managers", () => {
    expect(canAccessCampusTool("/operations", { manager: true, admin: false, security: false })).toBe(false);
  });
  it("grants campus operations to approved administration or security", () => {
    expect(canAccessCampusTool("/operations", { manager: false, admin: true, security: false })).toBe(true);
    expect(canAccessCampusTool("/operations", { manager: false, admin: false, security: true })).toBe(true);
  });
});
describe("sample campus events", () => {
  it("contains fifteen events", () => { expect(EVENTS).toHaveLength(15); });
  it("contains four hackathons", () => { expect(EVENTS.filter((event) => /hackathon/i.test(event.title))).toHaveLength(4); });
  it("keeps invented schedules labelled as sample events", () => { expect(EVENTS.every((event) => event.demo === true)).toBe(true); });
});