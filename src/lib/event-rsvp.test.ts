import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ insert: vi.fn(), delete: vi.fn(), eq: vi.fn(), from: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from } }));
import { cancelEvent, isBookableEvent, reserveEvent } from "./event-rsvp";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.from.mockReturnValue({ insert: mocks.insert, delete: mocks.delete });
  mocks.insert.mockResolvedValue({ error: null });
  mocks.delete.mockReturnValue({ eq: mocks.eq });
});
describe("event reservations", () => {
  it("reserves a published event for the signed-in member", async () => {
    await reserveEvent({ id: "event-1", demo: false }, "member-1");
    expect(mocks.from).toHaveBeenCalledWith("event_rsvps");
    expect(mocks.insert).toHaveBeenCalledWith({ event_id: "event-1", user_id: "member-1" });
  });
  it("does not register a sample event", async () => {
    expect(isBookableEvent({ demo: true })).toBe(false);
    await expect(reserveEvent({ id: "e1", demo: true }, "member-1")).rejects.toThrow("Sample events");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it("treats a duplicate RSVP as an existing reservation rather than another seat", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "23505" } });
    await expect(reserveEvent({ id: "event-1", demo: false }, "member-1")).resolves.toBeUndefined();
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });
  it("surfaces failed registration without reporting success", async () => {
    mocks.insert.mockResolvedValue({ error: { code: "42501", message: "Permission denied" } });
    await expect(reserveEvent({ id: "event-1", demo: false }, "member-1")).rejects.toThrow("Permission denied");
  });
  it("cancels only the member's registration for the selected event", async () => {
    mocks.eq.mockReturnValueOnce({ eq: mocks.eq }).mockResolvedValueOnce({ error: null });
    await cancelEvent("event-1", "member-1");
    expect(mocks.eq.mock.calls).toEqual([["event_id", "event-1"], ["user_id", "member-1"]]);
  });
});