import { useCallback, useEffect, useRef, useState } from "react";
import { distanceFromCampus, CAMPUS } from "@/lib/geo";

export type GeoState = {
  status: "idle" | "locating" | "ready" | "error" | "unsupported";
  lat?: number; lng?: number; accuracy?: number; distance?: number; inside?: boolean; error?: string; at?: number;
};

/** Real browser GPS. Never fakes a position. */
export function useGeolocation(watch = false) {
  const [state, setState] = useState<GeoState>({ status: "idle" });
  const watchId = useRef<number | null>(null);

  const onPos = (p: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, accuracy } = p.coords;
    const distance = distanceFromCampus(lat, lng);
    setState({ status: "ready", lat, lng, accuracy, distance, inside: distance <= CAMPUS.radiusM, at: p.timestamp });
  };
  const onErr = (e: GeolocationPositionError) =>
    setState({ status: "error", error: e.code === 1 ? "Location access is off. Your location stays private; the campus map is still available." : e.message || "Unable to get location." });

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) { setState({ status: "unsupported", error: "Geolocation is not supported in this browser." }); return; }
    setState((s) => ({ ...s, status: "locating" }));
    navigator.geolocation.getCurrentPosition(onPos, onErr, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
  }, []);

  useEffect(() => {
    if (!watch || typeof navigator === "undefined" || !navigator.geolocation) return;
    setState((s) => ({ ...s, status: "locating" }));
    watchId.current = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy: true, timeout: 20000 });
    return () => { if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current); };
  }, [watch]);

  return { ...state, locate };
}
