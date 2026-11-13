import { BookOpen, CalendarDays, ClipboardList, Bell, Star, Megaphone } from "lucide-react";
import { DemoBadge } from "@/components/AppShell";

const examples = {
  complaints: [
    { title: "Classroom projector not working", detail: "Classroom · Open", body: "The projector is not displaying the connected laptop.", icon: ClipboardList },
    { title: "Campus Wi-Fi connection", detail: "Wi-Fi · In progress", body: "A sample connectivity issue awaiting a technical review.", icon: ClipboardList },
    { title: "Library reading light", detail: "Maintenance · Resolved", body: "Example of a resolved facility report.", icon: BookOpen },
  ],
  feedback: [
    { title: "Library study spaces", detail: "Library · 5 / 5", body: "Quiet reading areas and more charging points would make study sessions better.", icon: Star },
    { title: "Food court suggestions", detail: "Food · 4 / 5", body: "Example feedback requesting more meal choices.", icon: Star },
    { title: "Campus transport", detail: "Other · 4 / 5", body: "A sample suggestion for clearer shuttle information.", icon: Star },
  ],
  timetable: [
    { title: "Programming fundamentals", detail: "Sample Monday · 09:00–10:00", body: "Class · Classroom to be confirmed", icon: CalendarDays },
    { title: "Laboratory session", detail: "Sample Monday · 11:00–12:30", body: "Class · Laboratory to be confirmed", icon: CalendarDays },
    { title: "Faculty consultation", detail: "Sample Tuesday · 14:00–14:30", body: "Faculty · Appointment to be confirmed", icon: CalendarDays },
  ],
  notices: [
    { title: "Academic announcements", detail: "Academic · Example notice", body: "Course updates and department announcements will appear here when published.", icon: Megaphone },
    { title: "Examination information", detail: "Examination · Example notice", body: "A preview of examination notices. No examination date has been announced here.", icon: BookOpen },
    { title: "Campus activities", detail: "Event · Example notice", body: "A preview of campus event announcements, not an official event invitation.", icon: CalendarDays },
  ],
  notifications: [
    { title: "Timetable reminder", detail: "Example alert", body: "A preview of a personal class reminder.", icon: Bell },
    { title: "Report progress update", detail: "Example alert", body: "A preview of an update when an authorized team changes your complaint status.", icon: ClipboardList },
    { title: "Event registration confirmation", detail: "Example alert", body: "A preview of a confirmation for a published event registration.", icon: CalendarDays },
  ],
};

export function StarterContent({ kind }: { kind: keyof typeof examples }) {
  return <section className="my-6 border-t border-border pt-5">
    <div className="mb-2 flex flex-wrap items-center gap-3"><h2>Sample {kind === "timetable" ? "week" : kind}</h2><DemoBadge /></div>
    <p className="mb-4 text-xs text-muted-foreground">Examples only · Not official records, personal submissions or live alerts.</p>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{examples[kind].map((item) => <article key={item.title} className="rounded-lg border border-border bg-card p-4">
      <item.icon className="mb-4 size-5 text-electric" /><p className="text-xs text-primary">{item.detail}</p><h3 className="mt-1">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
    </article>)}</div>
  </section>;
}