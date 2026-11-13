/** Configured REVA University campus geofence (Kattigenahalli, Yelahanka, Bengaluru). */
export const CAMPUS = { name: "REVA University", lat: 13.1167, lng: 77.6346, radiusM: 500 } as const;

export function distanceMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function distanceFromCampus(lat: number, lng: number) {
  return distanceMeters(lat, lng, CAMPUS.lat, CAMPUS.lng);
}

/** Inside only when the measured position is within the geofence radius. */
export function isInsideCampus(lat: number, lng: number) {
  return distanceFromCampus(lat, lng) <= CAMPUS.radiusM;
}
