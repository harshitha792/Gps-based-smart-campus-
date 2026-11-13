import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { MapClient } from "@/components/MapClient";
import { FEATURES } from "@/lib/features";
import { useGeolocation } from "@/hooks/use-geolocation";
import { CAMPUS } from "@/lib/geo";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { PLACES } from "@/lib/campus-data";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/campus-map")({
  validateSearch: (search: Record<string, unknown>): { place?: string } => typeof search['place'] === "string" && PLACES.some((p) => p.id === search['place']) ? { place: search['place'] } : {},
  head: pageHead("Campus Map", "Interactive REVA University campus map with buildings and directions."),
  component: CampusMap,
});

function CampusMap() {
  const { place } = Route.useSearch();
  const selectedPlace = PLACES.find((p) => p.id === place);
  const f = FEATURES[0];
  const geo = useGeolocation();
  const locations = useQuery({ queryKey: ["verified-locations"], queryFn: async () => { const { data, error } = await supabase.from("campus_locations").select("*"); if (error) throw error; return data; } });
  const [target, setTarget] = useState<{ lat: number; lng: number; zoom: number; request: number }>();
  useEffect(() => { geo.locate(); }, [geo.locate]);
  useEffect(() => {
    if (geo.status === "ready" && geo.lat != null && geo.lng != null) {
      setTarget({ lat: geo.lat, lng: geo.lng, zoom: 16, request: geo.at ?? Date.now() });
    }
  }, [geo.status, geo.lat, geo.lng, geo.at]);
  const user = geo.status === "ready" && geo.lat != null && geo.lng != null ? { lat: geo.lat, lng: geo.lng, accuracy: geo.accuracy } : undefined;
  const locateMe = () => {
    if (user) setTarget({ ...user, zoom: 17, request: Date.now() });
    else geo.locate();
  };

  return (
    <AppShell title="Campus Map" subtitle="REVA University · Kattigenahalli, Bengaluru" icon={f ? <FeatureIcon icon={f.icon} tone={f.tone} size="sm" /> : undefined}>
      {selectedPlace && <div className="mb-3 rounded-lg border border-ring bg-accent p-3"><h2 className="text-sm font-medium">{selectedPlace.name}</h2><p className="text-xs text-muted-foreground">Selected place · Exact building location awaits verification; no building pin is shown.</p></div>}
      <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0" aria-live="polite">
          {user ? <><p className={`text-sm font-medium ${geo.inside ? "text-success" : "text-warning"}`}>{geo.inside ? "Inside Campus" : "Outside Campus"}</p><p className="text-xs text-muted-foreground">{geo.distance != null && (geo.distance < 1000 ? `${Math.round(geo.distance)} m` : `${(geo.distance / 1000).toFixed(2)} km`)} from REVA · GPS ±{Math.round(user.accuracy ?? 0)} m</p></>
            : <p className="text-sm text-muted-foreground">{geo.status === "locating" ? "Finding your location…" : geo.error ?? "Location unavailable"}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={locateMe} disabled={geo.status === "locating"}>{geo.status === "locating" ? <Loader2 className="animate-spin" /> : <LocateFixed />}Locate Me</Button>
          <Button onClick={() => setTarget({ lat: CAMPUS.lat, lng: CAMPUS.lng, zoom: 17, request: Date.now() })}><MapPin />Show REVA Campus</Button>
        </div>
      </div>
      {(geo.status === "error" || geo.status === "unsupported") && <p className="mb-3 rounded-lg border border-border bg-muted/50 p-3 text-sm">You can still explore REVA campus. Allow location access and select Locate Me whenever you're ready.</p>}
      <div className="campus-map-surface overflow-hidden rounded-lg border border-border">
        <MapClient height={680} user={user} viewTarget={target} markers={[{ id: "reva", lat: CAMPUS.lat, lng: CAMPUS.lng, title: CAMPUS.name, subtitle: "Configured campus centre" }, ...(locations.data ?? []).map((l) => ({ id: l.id, lat: l.latitude, lng: l.longitude, title: l.name, subtitle: l.accessible ? `Accessible · ${l.accessibility_note}` : "Verified campus location" }))]} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Boundary: configured {CAMPUS.radiusM} m attendance zone, not a surveyed campus boundary. Buildings and nearby places are from OpenStreetMap; individual building pins await verified locations.</p>
    </AppShell>
  );
}
