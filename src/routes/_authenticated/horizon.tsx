import { createFileRoute, Link } from "@tanstack/react-router";
import { AudioWaveform, CalendarCheck, CalendarDays, MapPin, Navigation, ChevronRight, Loader2, Megaphone, BarChart3, ImageOff } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AppShell, Panel, DemoBadge } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { FEATURES } from "@/lib/features";
import { EVENTS, fmtDate } from "@/lib/campus-data";
import { publishedNoticesOptions } from "@/lib/notice-queries";
import { useUser, displayName } from "@/hooks/use-auth";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useAttendance, isToday } from "@/hooks/use-attendance";
import { pageHead } from "@/lib/seo";
const aerial = "/images/reva-aerial.jpg";
const library = "/images/library.jpg";
const campusPhoto = "/images/reva-campus.jpg";
const parkingPhoto = "/images/parking.jpg";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { useQuery } from "@tanstack/react-query";
import { campusEventsOptions } from "@/lib/campus-event-queries";

export const Route = createFileRoute("/_authenticated/horizon")({
  head: pageHead("Horizon", "Your personalised REVA campus dashboard."),
  component: Horizon,
});

const WEEK = [{ d: "Mon", v: 210 }, { d: "Tue", v: 280 }, { d: "Wed", v: 340 }, { d: "Thu", v: 300 }, { d: "Fri", v: 420 }, { d: "Sat", v: 460 }, { d: "Sun", v: 390 }];

function StatCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return <div className="glass lift flex gap-3 p-4"><div>{icon}</div><div className="min-w-0"><div className="text-xs text-muted-foreground">{label}</div>{children}</div></div>;
}

function HighlightImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-[16/8] w-full overflow-hidden bg-muted">
      {src && !failed ? (
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div role="img" aria-label={`${alt}: photo unavailable`} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">Photo unavailable</span>
        </div>
      )}
    </div>
  );
}

function Horizon() {
  const { user } = useUser();
  const account = useCampusAccount();
  const { data: campusEvents } = useQuery(campusEventsOptions);
  const { data: notices = [] } = useQuery(publishedNoticesOptions);
  const events = campusEvents ?? EVENTS;
  const geo = useGeolocation(true);
  const { data: att } = useAttendance();
  const today = att?.find((a) => isToday(a.created_at));
  const total = att?.length ?? 0;
  const next = events[0];

  return (
    <AppShell title="Horizon" subtitle="Your personalized campus dashboard" icon={<div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary"><AudioWaveform className="h-5 w-5" /></div>}>
      <div className="relative mb-5 h-44 overflow-hidden rounded-2xl border border-border md:h-52">
        <img src={aerial} alt="Aerial view of REVA University campus" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1088} />
        <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-center p-6">
          <p className="text-sm font-medium">Welcome back,</p>
          <h2 className="text-2xl font-semibold">{account.data?.fullName || displayName(user)}! 👋</h2>
          <p className="mt-2 text-sm text-muted-foreground">{account.label} · REVA University</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Campus Status" icon={<FeatureIcon icon={MapPin} tone="from-success to-chart-2" />}>
          {geo.status === "ready" ? (
            <><div className={`font-semibold ${geo.inside ? "text-success" : "text-warning"}`}>{geo.inside ? "Inside Campus" : "Outside Campus"}</div>
              <div className="text-xs text-muted-foreground">{Math.round((geo.distance ?? 0))} m from campus centre</div></>
          ) : geo.status === "locating" || geo.status === "idle" ? <div className="flex items-center gap-2 text-sm"><Loader2 className="h-3 w-3 animate-spin" />Checking…</div>
            : <div className="text-xs text-destructive">{geo.error}</div>}
        </StatCard>
        <StatCard label="Current Location" icon={<FeatureIcon icon={Navigation} tone="from-electric to-primary" />}>
          {geo.status === "ready" ? <><div className="font-semibold">{geo.lat?.toFixed(4)}° N, {geo.lng?.toFixed(4)}° E</div><div className="text-xs text-muted-foreground">Accuracy: ±{Math.round((geo.accuracy ?? 0))} m</div></>
            : <div className="text-sm text-muted-foreground">{geo.status === "error" || geo.status === "unsupported" ? "Unavailable" : "Locating…"}</div>}
        </StatCard>
        <StatCard label="Today's Attendance" icon={<FeatureIcon icon={CalendarCheck} tone="from-violet to-primary" />}>
          {today ? <div className="font-semibold text-success">Marked ✓</div> : <Link to="/attendance" className="text-sm font-semibold text-primary hover:underline">Not marked — mark now</Link>}
          <div className="text-xs text-muted-foreground">{total} total check-ins</div>
        </StatCard>
        <StatCard label="Next Event" icon={<FeatureIcon icon={CalendarDays} tone="from-violet to-electric" />}>
          <div className="font-semibold">{next?.title ?? "No upcoming events"}</div><div className="text-xs text-muted-foreground">{next ? `${fmtDate(next.date)} · ${next.venue}` : "Check back later"}</div>{next?.demo && <DemoBadge />}
        </StatCard>
      </div>

      <h2 className="mb-3 mt-7 text-lg font-semibold">Quick Access</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {FEATURES.map((f) => (
          <Link key={f.to} to={f.to} className="glass lift flex flex-col items-center gap-2 px-2 py-3 text-center">
            <FeatureIcon icon={f.icon} tone={f.tone} size="lg" /><span className="text-xs font-medium">{f.title}</span>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Panel title={<span className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Campus Analytics</span>} action={<DemoBadge />}>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="grid h-24 w-24 place-items-center rounded-full" style={{ background: "conic-gradient(var(--violet) 0 92%, var(--muted) 92% 100%)" }}>
                <div className="grid h-19 w-19 place-items-center rounded-full bg-background text-xl font-bold">92%</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Overall attendance</div>
            </div>
            <div className="h-36 flex-1">
              <ResponsiveContainer><BarChart data={WEEK}><XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} /><YAxis hide /><Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} /><Bar dataKey="v" fill="var(--primary)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
            </div>
          </div>
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" />Recent Notices</span>} action={<Link to="/notices" className="text-xs text-primary">View all →</Link>}>
          <ul className="space-y-2">{notices.slice(0, 3).map((n) => (
            <li key={n.id}><Link to="/notices" className="flex items-center justify-between rounded-lg p-2 hover:bg-accent"><div><div className="text-sm">{n.title}</div><div className="text-xs text-muted-foreground">{fmtDate(n.date)}</div></div><ChevronRight className="h-4 w-4 text-muted-foreground" /></Link></li>
          ))}</ul>{!notices.length && <p className="text-xs text-muted-foreground">No published notices yet.</p>}
        </Panel>
        <Panel title={<span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />Upcoming Events</span>} action={<Link to="/events" className="text-xs text-primary">View all →</Link>}>
          <ul className="space-y-3">{events.slice(0, 2).map((e) => (
            <li key={e.id} className="flex gap-3">{e.image ? <img src={e.image} alt="" loading="lazy" width={1024} height={640} className="h-14 w-20 rounded-lg object-cover" /> : <CalendarDays className="h-14 w-14 shrink-0 text-primary" />}
              <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium">{e.title}</span><span className="rounded bg-primary/30 px-2 py-0.5 text-[10px]">{e.tag}</span></div><div className="text-xs text-muted-foreground">{fmtDate(e.date)} · {e.venue}</div>{e.demo && <DemoBadge />}</div></li>
          ))}</ul>
        </Panel>
      </div>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Campus Highlights</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[{ title: "REVA Campus", image: campusPhoto, to: "/campus-map", label: "Kattigenahalli · Bengaluru" }, { title: "Library", image: library, to: "/find-places", label: "REVA University library" }, { title: "Campus Parking", image: parkingPhoto, to: "/parking", label: "Availability is simulated" }].map((item) => (
            <Link key={item.title} to={item.to} className="glass lift overflow-hidden">
              <HighlightImage {...(item.image ? { src: item.image } : {})} alt={item.title} />
              <div className="p-3"><h3 className="text-sm font-medium">{item.title}</h3><p className="text-xs text-muted-foreground">{item.label}</p></div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
