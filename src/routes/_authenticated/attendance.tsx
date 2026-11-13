import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LocateFixed, ShieldCheck, ShieldX } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { MapClient } from "@/components/MapClient";
import { FEATURES } from "@/lib/features";
import { CAMPUS, distanceFromCampus } from "@/lib/geo";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useAttendance, isToday } from "@/hooks/use-attendance";
import { useUser } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: pageHead("GPS Attendance", "Mark attendance with live GPS and REVA campus geofence verification."),
  component: Attendance,
});

function Attendance() {
  const f = FEATURES[3]!;
  const geo = useGeolocation(true);
  const { user } = useUser();
  const { data, isLoading, error } = useAttendance();
  const qc = useQueryClient();
  const markedToday = data?.some((a) => isToday(a.created_at));

  const mark = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      // Fresh fix at the moment of marking — never reuse a stale or simulated position.
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }));
      const { latitude, longitude, accuracy } = pos.coords;
      const d = distanceFromCampus(latitude, longitude);
      if (d > CAMPUS.radiusM) throw new Error(`You are ${Math.round(d)} m from campus. Attendance can only be marked inside the ${CAMPUS.radiusM} m geofence.`);
      const { error } = await supabase.from("attendance").insert({ user_id: user.id, latitude, longitude, accuracy, distance_m: d, status: "present" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Attendance marked"); qc.invalidateQueries({ queryKey: ["attendance"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not get your location"),
  });

  const ready = geo.status === "ready";
  return (
    <AppShell title="GPS Attendance" subtitle="Live location with campus geofence verification" icon={<FeatureIcon icon={f.icon} tone={f.tone} size="sm" />}>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="GPS Attendance">
          <div className={`flex items-center gap-3 rounded-xl border p-4 ${ready ? (geo.inside ? "border-success/50 bg-success/10" : "border-warning/50 bg-warning/10") : "border-border bg-muted/50"}`}>
            {ready ? (geo.inside ? <ShieldCheck className="h-8 w-8 text-success" /> : <ShieldX className="h-8 w-8 text-warning" />) : <Loader2 className={`h-8 w-8 ${geo.status === "locating" ? "animate-spin" : ""}`} />}
            <div>
              <div className={`font-semibold ${ready ? (geo.inside ? "text-success" : "text-warning") : ""}`}>
                {ready ? (geo.inside ? "Inside Campus" : "Outside Campus") : geo.status === "error" || geo.status === "unsupported" ? "Location unavailable" : "Getting your location…"}
              </div>
              <div className="text-xs text-muted-foreground">{ready ? (geo.inside ? "You are within the REVA campus boundary" : `Move within ${CAMPUS.radiusM} m of campus to mark attendance`) : geo.error ?? "Allow location access when prompted"}</div>
            </div>
          </div>
          {ready && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-xs text-muted-foreground">Coordinates</div>{geo.lat!.toFixed(5)}, {geo.lng!.toFixed(5)}</div>
              <div className="rounded-lg bg-muted/60 p-3"><div className="text-xs text-muted-foreground">Accuracy</div>±{Math.round(geo.accuracy!)} m</div>
              <div className="col-span-2 rounded-lg bg-muted/60 p-3"><div className="text-xs text-muted-foreground">Distance from campus centre</div>{Math.round(geo.distance!)} m (geofence {CAMPUS.radiusM} m)</div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <button onClick={() => mark.mutate()} disabled={!ready || !geo.inside || mark.isPending || markedToday}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
              {mark.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{markedToday ? "Already marked today ✓" : "Mark Attendance"}
            </button>
            <button onClick={geo.locate} className="rounded-lg border border-border px-3 hover:bg-accent" aria-label="Refresh location"><LocateFixed className="h-4 w-4" /></button>
          </div>
        </Panel>
        <div className="glass overflow-hidden p-2">
          <MapClient height={380} user={ready ? { lat: geo.lat!, lng: geo.lng!, accuracy: geo.accuracy } : undefined} markers={[{ id: "c", lat: CAMPUS.lat, lng: CAMPUS.lng, title: "Campus Zone", subtitle: `${CAMPUS.radiusM} m geofence` }]} />
        </div>
      </div>
      <Panel title="Attendance History" className="mt-4">
        {isLoading ? <div className="flex justify-center p-6"><Loader2 className="animate-spin" /></div>
          : error ? <p className="text-sm text-destructive">Couldn't load history.</p>
          : !data?.length ? <p className="py-6 text-center text-sm text-muted-foreground">No attendance records yet.</p>
          : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs text-muted-foreground"><tr><th className="p-2">Date</th><th className="p-2">Time</th><th className="p-2">Status</th><th className="p-2">Distance</th></tr></thead>
              <tbody>{data.map((a) => { const d = new Date(a.created_at); return (
                <tr key={a.id} className="border-t border-border"><td className="p-2">{d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td><td className="p-2">{d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</td><td className="p-2 capitalize text-success">{a.status}</td><td className="p-2">{Math.round(a.distance_m)} m</td></tr>); })}</tbody></table></div>}
      </Panel>
    </AppShell>
  );
}
