import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, CalendarDays, MapPin, Clock, CalendarPlus } from "lucide-react";
import { AppShell, Panel, DemoBadge } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FEATURES } from "@/lib/features";
import { fmtDate, type CampusEvent } from "@/lib/campus-data";
import { publishedNoticesOptions } from "@/lib/notice-queries";
import { pageHead } from "@/lib/seo";
import { campusEventsOptions } from "@/lib/campus-event-queries";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-auth";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { supabase } from "@/integrations/supabase/client";
import { cancelEvent, isBookableEvent, reserveEvent } from "@/lib/event-rsvp";
import { EventAttendees } from "@/components/EventAttendees";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/events")({
  head: pageHead("Events & Notices", "Upcoming REVA events, announcements and notices."),
  loader: ({ context }) => context.queryClient.ensureQueryData(campusEventsOptions),
  component: Events,
});

const TAGS = ["All", "Academic", "Cultural", "Sports", "Technical"];
const gcal = (e: CampusEvent) => { const d = e.date.replace(/-/g, ""); return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${d}/${d}&location=${encodeURIComponent(e.venue)}&details=${encodeURIComponent(e.description)}`; };

function Events() {
  const f = FEATURES[7];
  const { data: events } = useSuspenseQuery(campusEventsOptions);
  const { data: notices = [] } = useQuery(publishedNoticesOptions);
  const { user } = useUser();
  const account = useCampusAccount();
  const qc = useQueryClient();
  const [myEvents, setMyEvents] = useState(false);
  const registrations = useQuery({
    queryKey: ["my-event-rsvps", user?.id], enabled: Boolean(user),
    queryFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("event_rsvps").select("event_id").eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });
  const registered = (id: string) => registrations.data?.some((row) => row.event_id === id) === true;
  const rsvp = useMutation({
    mutationFn: async ({ event, cancel }: { event: CampusEvent; cancel: boolean }) => {
      if (!user) throw new Error("Sign in to register");
      if (cancel) await cancelEvent(event.id, user.id); else await reserveEvent(event, user.id);
    },
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({ queryKey: ["my-event-rsvps"] });
      await qc.invalidateQueries({ queryKey: ["event-attendees", variables.event.id] });
      toast.success(variables.cancel ? "Registration cancelled" : "Your place is reserved");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update registration"),
  });
  const [tab, setTab] = useState<"events" | "notices">("events");
  const [q, setQ] = useState(""); const [tag, setTag] = useState("All"); const [open, setOpen] = useState<CampusEvent | null>(null);
  const evs = events.filter((e) => (!myEvents || registered(e.id)) && (tag === "All" || (tag === "Hackathons" ? /hackathon/i.test(e.title) : e.tag === tag)) && e.title.toLowerCase().includes(q.toLowerCase()));
  const nts = notices.filter((n) => (n.title + n.body).toLowerCase().includes(q.toLowerCase()));
  if (!f) return null;

  return (
    <AppShell title="Events & Notices" subtitle="Stay in the loop" icon={<FeatureIcon icon={f.icon} tone={f.tone} size="sm" />}>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex gap-2">{(["events", "notices"] as const).map((t) => <Button key={t} onClick={() => setTab(t)} variant={tab === t ? "default" : "outline"} className="capitalize">{t}</Button>)}</div>
          <div className="relative mb-3"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${tab}…`} className="w-full rounded-lg border border-input bg-muted/60 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></div>
          {tab === "events" ? (<>
            <div className="mb-4 flex flex-wrap gap-2">{[...TAGS, "Hackathons"].map((t) => <Button key={t} size="sm" aria-pressed={tag === t} onClick={() => setTag(t)} variant={tag === t ? "default" : "outline"}>{t}</Button>)}</div>
            <label className="mb-3 flex items-center gap-2 text-xs"><input type="checkbox" checked={myEvents} onChange={(e) => setMyEvents(e.target.checked)} />My registrations</label>
            {registrations.error && <p role="alert" className="mb-3 text-xs text-destructive">Could not load registrations. <Button variant="link" size="sm" onClick={() => registrations.refetch()}>Retry</Button></p>}
            <p className="mb-3 text-xs text-muted-foreground">{evs.length} events · Sample dates and venues are not official announcements.</p>
            {evs.length === 0 ? <Panel><p className="text-center text-sm text-muted-foreground">No events found.</p></Panel> : (
              <div className="grid gap-4 sm:grid-cols-2">{evs.map((e) => (
                <article key={e.id} className="glass lift overflow-hidden">
                  {e.image ? <img src={e.image} alt={e.title} loading="lazy" width={1024} height={640} className="aspect-video w-full object-cover" /> : <div className="grid aspect-video place-items-center bg-muted"><CalendarDays className="size-10 text-primary" /></div>}
                  <div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="min-w-0 break-words text-sm font-semibold">{e.title}</h3><span className="shrink-0 rounded bg-primary/30 px-2 py-0.5 text-[10px]">{e.tag}</span></div>{e.demo && <DemoBadge />}
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground"><div className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{fmtDate(e.date)} · {e.time}</div><div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</div></div>
                    <div className="mt-3 flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" onClick={() => setOpen(e)}>View Details</Button>{registered(e.id) && <span className="text-xs font-medium text-success">Registered ✓</span>}</div></div>
                </article>))}</div>)}
          </>) : (
            <div className="space-y-3">{nts.length === 0 && <Panel><p className="text-center text-sm text-muted-foreground">No notices found.</p></Panel>}
              {nts.map((n) => <Panel key={n.id} title={n.title} action={<span className="text-xs text-muted-foreground">{fmtDate(n.date)}</span>}><p className="text-sm text-muted-foreground">{n.body}</p></Panel>)}</div>
          )}
        </div>
        <Panel title="Recent Notices" className="h-fit">
          <ul className="space-y-2">{notices.map((n) => <li key={n.id} className="rounded-lg bg-muted/50 p-3"><div className="text-sm">{n.title}</div><div className="text-xs text-muted-foreground">{fmtDate(n.date)}</div></li>)}</ul>{!notices.length && <p className="text-xs text-muted-foreground">No published notices yet.</p>}
        </Panel>
      </div>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="glass max-h-[90dvh] overflow-y-auto">
          {open && <>
            {open.image && <img src={open.image} alt="" className="aspect-video w-full rounded-lg object-cover" width={1024} height={640} />}
            {open.demo && <DemoBadge />}
            <DialogHeader><DialogTitle>{open.title}</DialogTitle><DialogDescription>{open.description}</DialogDescription></DialogHeader>
            <div className="space-y-1 text-sm"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{fmtDate(open.date)}</div><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{open.time}</div><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{open.venue}</div></div>
            {isBookableEvent(open) ? <div className="space-y-2">{registered(open.id) && <p role="status" className="text-sm text-success">Your place is reserved.</p>}<Button className="w-full" variant={registered(open.id) ? "outline" : "default"} disabled={!user || registrations.isPending || Boolean(registrations.error) || rsvp.isPending} onClick={() => rsvp.mutate({ event: open, cancel: registered(open.id) })}>{rsvp.isPending ? "Updating registration…" : registered(open.id) ? "Cancel registration" : "Reserve a place"}</Button></div> : <p className="text-xs text-muted-foreground">Sample event — registration is not available.</p>}
            {account.manager && isBookableEvent(open) && <EventAttendees eventId={open.id} />}
            <a href={gcal(open)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><CalendarPlus className="h-4 w-4" />Add to calendar</a>
          </>}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
