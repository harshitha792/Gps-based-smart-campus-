import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "./use-geolocation";

afterEach(() => vi.restoreAllMocks());

describe("real browser location", () => {
  it("uses returned GPS coordinates instead of substituting campus coordinates", async () => {
    const getCurrentPosition = vi.fn((success) => success({ coords: { latitude: 12.9716, longitude: 77.5946, accuracy: 18 }, timestamp: 100 }));
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.locate());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.lat).toBe(12.9716);
    expect(result.current.lng).toBe(77.5946);
    expect(result.current.inside).toBe(false);
    expect(result.current.distance).toBeGreaterThan(15000);
  });

  it("never fabricates a position after permission denial", async () => {
    const getCurrentPosition = vi.fn((_success, error) => error({ code: 1 }));
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition } });
    const { result } = renderHook(() => useGeolocation());
    act(() => result.current.locate());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.lat).toBeUndefined();
    expect(result.current.lng).toBeUndefined();
    expect(result.current.inside).toBeUndefined();
  });
});