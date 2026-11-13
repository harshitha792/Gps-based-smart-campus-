import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Clock, MapPin, Navigation } from "lucide-react";
import { AppShell, Panel } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { PLACES, type PlaceCategory } from "@/lib/campus-data";
import { Button } from "@/components/ui/button";
import { PlacePhoto } from "@/components/PlacePhoto";
const library = "/images/library.jpg";
const cafeteria = "/images/cafeteria.jpg";
const lab = "/images/computer-lab.jpg";
const sports = "/images/sports.jpg";
import { FEATURES } from "@/lib/features";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/find-places")({
  head: pageHead("Find Places", "Search classrooms, labs, libraries, cafeterias and facilities at REVA."),
  component: FindPlaces,
});

const CATS: ("All" | PlaceCategory)[] = ["All", "Classrooms", "Labs", "Library", "Cafeteria", "Facilities"];
const PHOTOS: Record<string, string> = { lib: library, caf: cafeteria, lab: lab, sports: sports };

function FindPlaces() {
  const f = FEATURES[1];
  const [q, setQ] = useState(""); const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const list = useMemo(() => PLACES.filter((p) => (cat === "All" || p.category === cat) && (p.name + p.block).toLowerCase().includes(q.toLowerCase())), [q, cat]);
  const [selId, setSelId] = useState(PLACES[0]?.id);
  const sel = list.find((p) => p.id === selId) ?? list[0];

  return (
    <AppShell title="Find Places" subtitle="Classrooms, labs, libraries and facilities" icon={f ? <FeatureIcon icon={f.icon} tone={f.tone} size="sm" /> : undefined}>
      <Panel className="mb-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input aria-label="Search places" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for classrooms, labs, libraries…" className="w-full rounded-lg border border-input bg-muted/60 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {CATS.map((c) => <Button key={c} variant={cat === c ? "default" : "outline"} size="sm" aria-pressed={cat === c} onClick={() => setCat(c)} className="text-xs">{c}</Button>)}
        </div>
      </Panel>
      {list.length === 0 ? <Panel><p className="py-10 text-center text-sm text-muted-foreground">No places match your filters.</p></Panel> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            {list.map((p) => (
              <Button variant="ghost" key={p.id} aria-label={`Select ${p.name}`} aria-pressed={sel?.id === p.id} onClick={() => setSelId(p.id)} className={`glass lift flex h-auto w-full justify-start gap-3 whitespace-normal p-3 text-left ${sel?.id === p.id ? "ring-2 ring-ring" : ""}`}>
                <PlacePhoto {...(PHOTOS[p.id] ? { src: PHOTOS[p.id] } : {})} alt={p.name} className="h-20 w-28 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1"><div className="text-sm font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.category}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Sample details · hours unverified</div></div>
              </Button>
            ))}
          </div>
          {sel && (
            <Panel className="h-fit">
              <PlacePhoto {...(PHOTOS[sel.id] ? { src: PHOTOS[sel.id] } : {})} alt={sel.name} className="mb-4 aspect-video w-full rounded-lg" />
              <h2 className="text-base font-semibold">{sel.name}</h2>
              <p className="text-xs text-muted-foreground">{sel.category} · Sample details</p>
              <p className="mt-3 text-sm leading-relaxed">{sel.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-4 w-4" />Sample hours: {sel.hours}</div>
              <p className="mt-2 text-xs text-muted-foreground">Building location and opening hours are not verified.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button disabled title="Directions require a verified building location"><Navigation />Get Directions</Button>
                <Button variant="outline" asChild><Link to="/campus-map" search={{ place: sel.id }}><MapPin />View on Map</Link></Button>
              </div>
            </Panel>
          )}
        </div>
      )}
    </AppShell>
  );
}
