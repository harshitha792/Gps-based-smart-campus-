import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { CAMPUS } from "@/lib/geo";

const pin = (selected: boolean) => L.divIcon({ className: "", html: `<div class="map-pin ${selected ? "map-pin-selected" : ""}"></div>`, iconSize: [26, 26], iconAnchor: [13, 26] });
const ICON = pin(false);
const ICON_SEL = pin(true);

export type MapMarker = { id: string; lat: number; lng: number; title: string; subtitle?: string };

function FlyTo({ lat, lng }: { lat?: number | undefined; lng?: number | undefined }) {
  const map = useMap();
  useEffect(() => { if (lat != null && lng != null) map.flyTo([lat, lng], 18, { duration: 0.8 }); }, [lat, lng, map]);
  return null;
}

function ViewCommand({ target }: { target?: { lat: number; lng: number; zoom: number; request: number } | undefined }) {
  const map = useMap();
  useEffect(() => { if (target) map.setView([target.lat, target.lng], target.zoom); }, [map, target]);
  return null;
}

export default function LeafletMap({ markers = [], selectedId, onSelect, user, showFence = true, height = 480, viewTarget }: {
  markers?: MapMarker[]; selectedId?: string | undefined; onSelect?: ((id: string) => void) | undefined; user?: { lat: number; lng: number; accuracy?: number | undefined } | undefined; showFence?: boolean; height?: number; viewTarget?: { lat: number; lng: number; zoom: number; request: number } | undefined;
}) {
  const sel = markers.find((m) => m.id === selectedId);
  return (
    <MapContainer center={[CAMPUS.lat, CAMPUS.lng]} zoom={16} style={{ height, width: "100%" }} scrollWheelZoom>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {showFence && <Circle center={[CAMPUS.lat, CAMPUS.lng]} radius={CAMPUS.radiusM} pathOptions={{ color: "var(--violet)", fillOpacity: 0.08 }} />}
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={m.id === selectedId ? ICON_SEL : ICON} eventHandlers={{ click: () => onSelect?.(m.id) }}>
          <Popup><b>{m.title}</b>{m.subtitle && <><br />{m.subtitle}</>}</Popup>
        </Marker>
      ))}
      {user && <CircleMarker center={[user.lat, user.lng]} radius={9} pathOptions={{ color: "var(--primary-foreground)", fillColor: "var(--electric)", fillOpacity: 1, weight: 3 }}><Tooltip permanent direction="top" className="map-you">You are here</Tooltip><Popup>You are here (±{Math.round(user.accuracy ?? 0)} m)</Popup></CircleMarker>}
      <FlyTo lat={sel?.lat} lng={sel?.lng} />
      <ViewCommand target={viewTarget} />
    </MapContainer>
  );
}
