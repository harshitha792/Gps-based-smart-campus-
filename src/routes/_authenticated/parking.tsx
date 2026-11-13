import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Car, CircleCheck, CircleX } from "lucide-react";
import { AppShell, Panel, DemoBadge, PageHero } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { MapClient } from "@/components/MapClient";
import { FEATURES } from "@/lib/features";
import { pageHead } from "@/lib/seo";
const parkingPhoto = "/images/parking.jpg";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/parking")({
  head: pageHead("Parking", "Campus parking areas, availability and slot status (demo data)."),
  component: Parking,
});

type Lot = { id: string; name: string; total: number; used: number; lat: number; lng: number };
const INITIAL: Lot[] = [
  { id: "p1", name: "Main Parking (P1)", total: 50, used: 26, lat: 13.1158, lng: 77.6330 },
  { id: "p2", name: "Block A (P2)", total: 30, used: 18, lat: 13.1171, lng: 77.6328 },
  { id: "p3", name: "Block B (P3)", total: 30, used: 24, lat: 13.1179, lng: 77.6358 },
  { id: "p4", name: "Staff Parking (P4)", total: 20, used: 20, lat: 13.1150, lng: 77.6348 },
];

function Parking() {
  const f = FEATURES[5];
  const inventory = useQuery({ queryKey: ["parking-inventory"], refetchInterval: 30000, queryFn: async () => { const { data, error } = await supabase.from("campus_parking_slots").select("*").order("number"); if (error) throw error; return data; } });
  const [lots, setLots] = useState(INITIAL);
  const [q, setQ] = useState(""); const [sel, setSel] = useState("p1");
  const [slot, setSlot] = useState<number | null>(null);
  useEffect(() => { // simulated live changes for demo purposes
    const t = setInterval(() => setLots((ls) => ls.map((l) => ({ ...l, used: Math.max(0, Math.min(l.total, l.used + Math.round(Math.random() * 2 - 1))) }))), 4000);
    return () => clearInterval(t);
  }, []);
  const total = lots.reduce((s, l) => s + l.total, 0); const used = lots.reduce((s, l) => s + l.used, 0);
  const list = lots.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()));
  const lot = lots.find((l) => l.id === sel) ?? lots[0];
  if (!f || !lot) return null;

  return (
    <AppShell title="Parking" subtitle="Find an open slot before you arrive" icon={<FeatureIcon icon={f.icon} tone={f.tone} size="sm" />}>
      <PageHero image={parkingPhoto} title="Smart Parking" text="Simulated availability — connect real sensors to go live." />
      <section className="mb-6 border-b border-border pb-6"><h2 className="mb-2">Campus parking inventory</h2><p className="mb-3 text-xs text-muted-foreground">Manually maintained status · not live sensor readings</p>{inventory.data?.length ? <div className="grid grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-3">{inventory.data.map((s) => <div key={s.id} className={`flex min-h-24 flex-col items-center justify-center rounded-md border p-3 ${s.occupied ? "border-destructive text-destructive" : "border-success text-success"}`}><Car className="mb-1 size-6" /><span className="text-xs">{s.area} · {s.number}</span><span className="text-xs">{s.occupied ? "Occupied" : "Free"}</span></div>)}</div> : <p className="text-sm text-muted-foreground">{inventory.error ? "Parking inventory unavailable." : "No approved parking inventory yet; the example below is simulated."}</p>}</section>
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[{ l: "Total Slots", v: total, c: "text-foreground" }, { l: "Available", v: total - used, c: "text-success" }, { l: "Occupied", v: used, c: "text-destructive" }].map((s) => (
          <div key={s.l} className="glass p-4"><div className="text-xs text-muted-foreground">{s.l}</div><div className={`text-2xl font-bold ${s.c}`}>{s.v}</div></div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Parking Areas" action={<DemoBadge />}>
          <div className="relative mb-3"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parking area…" className="w-full rounded-lg border border-input bg-muted/60 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          {list.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">No parking areas found.</p>}
          <ul className="space-y-2">{list.map((l) => { const pct = (l.used / l.total) * 100; return (
            <li key={l.id}><Button variant="ghost" onClick={() => { setSel(l.id); setSlot(null); }} className={`block h-auto w-full rounded-lg p-3 text-left ${sel === l.id ? "bg-accent" : "hover:bg-accent/60"}`}>
              <div className="flex justify-between text-sm"><span>{l.name}</span><span className={l.used >= l.total ? "text-destructive" : ""}>{l.used} / {l.total}</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${pct >= 100 ? "bg-destructive" : pct > 75 ? "bg-warning" : "bg-success"}`} style={{ width: `${pct}%` }} /></div>
            </Button></li>); })}</ul>
          <div className="mt-4"><div className="mb-2 text-sm font-semibold">{lot.name} — slot status</div>
            <div aria-label={`${lot.name} parking spaces`} className="grid grid-cols-[repeat(auto-fit,minmax(52px,1fr))] gap-2">{Array.from({ length: lot.total }).map((_, i) => (
              <Button key={i} variant="ghost" aria-label={`Slot ${i + 1}, ${i < lot.used ? "occupied" : "free"}`} aria-pressed={slot === i + 1} onClick={() => setSlot(i + 1)} className={`flex h-20 min-w-0 flex-col gap-1 rounded-md border-x-2 border-t-2 p-1 ${i < lot.used ? "border-destructive/50 bg-destructive/15 text-destructive hover:bg-destructive/25" : "border-success/50 bg-success/10 text-success hover:bg-success/20"} ${slot === i + 1 ? "ring-2 ring-ring" : ""}`}>
                <Car className="size-6" aria-hidden="true" /><span className="text-xs font-semibold">{i + 1}</span><span className="text-[10px]">{i < lot.used ? "Taken" : "Free"}</span>
              </Button>))}</div>
            {slot !== null && <p role="status" className="mt-3 text-xs text-muted-foreground">Slot {slot} · {slot <= lot.used ? "Occupied" : "Available"} · Simulated availability, not a reservation</p>}
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1"><CircleCheck className="h-3 w-3 text-success" />Free</span><span className="flex items-center gap-1"><CircleX className="h-3 w-3 text-destructive" />Occupied</span></div>
          </div>
        </Panel>
        <div className="glass overflow-hidden p-2">
          <MapClient height={560} showFence={false} markers={[]} />
          <p className="p-3 text-xs text-muted-foreground">Parking positions await campus verification; simulated areas are not shown as real map pins.</p>
        </div>
      </div>
    </AppShell>
  );
}
