import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { BookOpen, Coffee, Building, Footprints, Download } from "lucide-react";
import { AppShell, Panel, DemoBadge } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { FEATURES } from "@/lib/features";
import { useAttendance } from "@/hooks/use-attendance";
import { pageHead } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/insights")({
  head: pageHead("Smart Insights", "Attendance analytics, campus activity charts and downloadable reports."),
  component: Insights,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEMO = { week: DAYS.map((d, i) => ({ d, present: [150, 162, 158, 170, 165, 120, 60][i], absent: [20, 12, 18, 10, 14, 30, 50][i] })),
  month: ["W1", "W2", "W3", "W4"].map((d, i) => ({ d, present: [820, 860, 845, 880][i], absent: [90, 70, 80, 60][i] })) };
const ACTIVITY = [{ label: "Library Usage", v: 1248, icon: BookOpen, tone: "from-electric to-primary" }, { label: "Cafeteria Visits", v: 856, icon: Coffee, tone: "from-warning to-chart-5" }, { label: "Academic Blocks", v: 3421, icon: Building, tone: "from-violet to-primary" }, { label: "Total Movement", v: 12340, icon: Footprints, tone: "from-destructive to-violet" }];

function Insights() {
  const f = FEATURES[4];
  const summary = useQuery({ queryKey: ["campus-workflow-insights"], queryFn: async () => {
    const [reports, bookings, rsvps, parking] = await Promise.all([supabase.from("campus_reports").select("kind,status,rating"), supabase.from("resource_bookings").select("status"), supabase.from("event_rsvps").select("id"), supabase.from("campus_parking_slots").select("occupied")]);
    for (const r of [reports, bookings, rsvps, parking]) if (r.error) throw r.error;
    return [{ name: "Complaints", value: reports.data?.filter((r) => r.kind === "Complaint").length ?? 0 }, { name: "Resolved", value: reports.data?.filter((r) => r.status === "Resolved").length ?? 0 }, { name: "Feedback", value: reports.data?.filter((r) => r.kind === "Feedback").length ?? 0 }, { name: "Bookings", value: bookings.data?.filter((r) => r.status === "Confirmed").length ?? 0 }, { name: "Event RSVPs", value: rsvps.data?.length ?? 0 }, { name: "Parking occupied", value: parking.data?.filter((r) => r.occupied).length ?? 0 }];
  } });
  const [range, setRange] = useState<"week" | "month">("week");
  const { data } = useAttendance();
  const mine = DAYS.map((d) => ({ d, checkins: 0 }));
  data?.forEach((a) => { const i = (new Date(a.created_at).getDay() + 6) % 7; const day = mine[i]; if (day) day.checkins++; });

  const download = () => {
    const rows = [["date", "time", "status", "distance_m", "latitude", "longitude"], ...(data ?? []).map((a) => { const d = new Date(a.created_at); return [d.toLocaleDateString("en-CA"), d.toLocaleTimeString("en-GB"), a.status, Math.round(a.distance_m), a.latitude, a.longitude]; })];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const el = document.createElement("a"); el.href = url; el.download = "my-attendance.csv"; el.click(); URL.revokeObjectURL(url);
  };
  const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 } };

  return (
    <AppShell title="Smart Insights" subtitle="Attendance analytics and campus activity" icon={f ? <FeatureIcon icon={f.icon} tone={f.tone} size="sm" /> : undefined}>
      <section className="mb-6 border-b border-border pb-6"><h2 className="mb-2">Saved campus activity</h2><p className="mb-4 text-xs text-muted-foreground">All saved records visible to your permissions · parking status is manually maintained, not sensor occupancy.</p>{summary.error ? <p role="alert">Could not load saved activity.</p> : <div className="h-56"><ResponsiveContainer><BarChart data={summary.data ?? []}><XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)" /><YAxis allowDecimals={false} stroke="var(--muted-foreground)" /><Tooltip /><Bar dataKey="value" fill="var(--electric)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>}<p className="mt-3 text-xs text-muted-foreground">Crowd predictions and live occupancy are unavailable until sufficient verified readings are connected.</p></section>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel title="Your check-ins">
          <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-gradient-primary p-2"><div className="grid h-full w-full place-items-center rounded-full bg-background text-3xl font-bold">{data?.length ?? 0}</div></div>
          <p className="mt-2 text-center text-xs text-muted-foreground">Real GPS-verified attendance records</p>
          <div className="mt-4 h-32"><ResponsiveContainer><BarChart data={mine}><XAxis dataKey="d" fontSize={10} stroke="var(--muted-foreground)" /><YAxis hide allowDecimals={false} /><Tooltip {...tip} /><Bar dataKey="checkins" fill="var(--success)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Class attendance overview" action={<div className="flex items-center gap-2"><DemoBadge /><select value={range} onChange={(e) => setRange(e.target.value as "week" | "month")} className="rounded-md border border-input bg-muted px-2 py-1 text-xs"><option value="week">This week</option><option value="month">This month</option></select></div>}>
          <div className="h-72"><ResponsiveContainer><BarChart data={DEMO[range]}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><Tooltip {...tip} /><Legend /><Bar dataKey="present" fill="var(--primary)" radius={[4, 4, 0, 0]} /><Bar dataKey="absent" fill="var(--violet)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_320px]">
        <Panel title="Campus Activity" action={<DemoBadge />}>
          <ul className="space-y-2">{ACTIVITY.map((a) => <li key={a.label} className="flex items-center gap-3 rounded-lg bg-muted/50 p-2"><FeatureIcon icon={a.icon} tone={a.tone} size="sm" /><span className="flex-1 text-sm">{a.label}</span><span className="font-semibold">{a.v.toLocaleString("en-IN")}</span></li>)}</ul>
        </Panel>
        <Panel title="Footfall trend" action={<DemoBadge />}>
          <div className="h-56"><ResponsiveContainer><LineChart data={DEMO.week.map((x) => ({ d: x.d, v: (x.present ?? 0) * 7 }))}><XAxis dataKey="d" fontSize={11} stroke="var(--muted-foreground)" /><YAxis hide /><Tooltip {...tip} /><Line type="monotone" dataKey="v" stroke="var(--electric)" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>
        </Panel>
        <Panel title="Download Report">
          <p className="text-sm text-muted-foreground">Export your real attendance history as a CSV file.</p>
          <button onClick={download} disabled={!data?.length} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Download className="h-4 w-4" />Generate Report</button>
          {!data?.length && <p className="mt-2 text-xs text-muted-foreground">No records to export yet.</p>}
        </Panel>
      </div>
    </AppShell>
  );
}
