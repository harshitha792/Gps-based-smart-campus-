import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, GraduationCap, Building2, Bus, Wifi, Wrench, HeartHandshake, Phone, Mail, HelpCircle } from "lucide-react";
import { AppShell, Panel, PageHero } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { FEATURES } from "@/lib/features";
import { pageHead } from "@/lib/seo";
import lab from "@/assets/computer-lab.jpg";

export const Route = createFileRoute("/_authenticated/services")({
  head: pageHead("Campus Services", "Academic, hostel, transport, Wi‑Fi and maintenance services at REVA."),
  component: Services,
});

const SERVICES = [
  { id: "acad", name: "Academic", desc: "Academic records, certificates", icon: GraduationCap, tone: "from-electric to-primary", items: ["Transcript & bonafide certificates", "Course registration", "Exam re-evaluation requests"], email: "academics@reva.edu.in", hours: "Mon–Sat, 9 AM – 5 PM" },
  { id: "hostel", name: "Hostel", desc: "Rooms, mess, facilities", icon: Building2, tone: "from-violet to-primary", items: ["Room allotment & change", "Mess menu & feedback", "Visitor permissions"], email: "hostel@reva.edu.in", hours: "24×7 warden desk" },
  { id: "transport", name: "Transport", desc: "Bus routes, schedules", icon: Bus, tone: "from-warning to-chart-5", items: ["Bus pass applications", "Route & stop timings", "Lost & found on buses"], email: "transport@reva.edu.in", hours: "Mon–Sat, 7 AM – 7 PM" },
  { id: "wifi", name: "Wi‑Fi", desc: "Access & support", icon: Wifi, tone: "from-chart-2 to-electric", items: ["Device registration", "Password reset", "Connectivity issues"], email: "it-helpdesk@reva.edu.in", hours: "Mon–Sat, 8 AM – 8 PM" },
  { id: "maint", name: "Maintenance", desc: "Report an issue", icon: Wrench, tone: "from-success to-chart-2", items: ["Electrical & plumbing", "Classroom equipment", "Furniture repair"], email: "facilities@reva.edu.in", hours: "Mon–Sat, 8 AM – 6 PM" },
  { id: "support", name: "Student Support", desc: "Grievance, counselling", icon: HeartHandshake, tone: "from-destructive to-violet", items: ["Confidential counselling", "Grievance redressal", "Scholarship guidance"], email: "studentsupport@reva.edu.in", hours: "Mon–Fri, 9 AM – 5 PM" },
];

function Services() {
  const f = FEATURES[2]!;
  const [q, setQ] = useState(""); const [sel, setSel] = useState(SERVICES[0]!.id);
  const list = SERVICES.filter((s) => (s.name + s.desc + s.items.join(" ")).toLowerCase().includes(q.toLowerCase()));
  const s = SERVICES.find((x) => x.id === sel)!;
  return (
    <AppShell title="Campus Services" subtitle="Everything you need, in one place" icon={<FeatureIcon icon={f.icon} tone={f.tone} size="sm" />}>
      <PageHero image={lab} title="Services" text="Raise requests and reach the right campus desk quickly." />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="w-full rounded-lg border border-input bg-muted/60 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          {list.length === 0 && <Panel><p className="text-center text-sm text-muted-foreground">No services found.</p></Panel>}
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={`glass lift flex items-center gap-3 p-4 text-left ${sel === x.id ? "ring-2 ring-ring" : ""}`}>
                <FeatureIcon icon={x.icon} tone={x.tone} /><div><div className="font-semibold">{x.name}</div><div className="text-xs text-muted-foreground">{x.desc}</div></div>
              </button>
            ))}
          </div>
          <div className="glass mt-4 flex items-center gap-3 p-4">
            <FeatureIcon icon={HelpCircle} tone="from-primary to-violet" />
            <div className="flex-1"><div className="font-semibold">Need help?</div><div className="text-xs text-muted-foreground">Get support for any campus related queries.</div></div>
            <a href="mailto:studentsupport@reva.edu.in" className="rounded-lg bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Contact Us</a>
          </div>
        </div>
        <Panel title={s.name} className="h-fit">
          <p className="text-sm text-muted-foreground">{s.desc}</p>
          <ul className="mt-4 space-y-2">{s.items.map((i) => <li key={i} className="rounded-lg bg-muted/60 p-3 text-sm">{i}</li>)}</ul>
          <div className="mt-4 space-y-1 text-sm"><div className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{s.hours}</div><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{s.email}</div></div>
          <a href={`mailto:${s.email}?subject=${encodeURIComponent(s.name + " service request")}`} className="mt-4 inline-block rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Raise a request by email</a>
          <p className="mt-2 text-xs text-muted-foreground">Desk emails shown are placeholders until the university confirms official addresses.</p>
        </Panel>
      </div>
    </AppShell>
  );
}
