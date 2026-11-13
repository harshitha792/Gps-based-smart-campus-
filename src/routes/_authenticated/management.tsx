import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Flag, Pencil, Plus, ShieldCheck, Trash2, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { useUser } from "@/hooks/use-auth";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/account-types";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
import { fmtDate } from "@/lib/campus-data";
import { EventAttendees } from "@/components/EventAttendees";
import { AccountTypeSelector } from "@/components/AccountTypeSelector";
import { registrationLabel, validRegistration } from "@/lib/profile-details";

export const Route = createFileRoute("/_authenticated/management")({
  head: pageHead("Account & Management", "Manage your REVA campus account; approved faculty and staff can publish events and review attendance."),
  component: Management,
});

const EMPTY_EVENT = { title: "", date: "", time: "09:00", venue: "", tag: "Technical", description: "" };
const inputClass = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function Management() {
  const account = useCampusAccount();
  const { user } = useUser();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"events" | "attendance">("events");
  const [type, setType] = useState<AccountType | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [registration, setRegistration] = useState<string | null>(null);
  const [event, setEvent] = useState(EMPTY_EVENT);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [attendeeEvent, setAttendeeEvent] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const profile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      const name = (fullName ?? account.data?.fullName ?? "").trim();
      const number = (registration ?? account.data?.registrationNumber ?? "").trim();
      if (!name || !validRegistration(number)) throw new Error("Enter your full name and registration number");
      const { error } = await supabase.from("profiles").update({ account_type: type ?? account.data?.accountType ?? "student", full_name: name, registration_number: number }).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campus-account"] }); toast.success("Account details saved"); },
    onError: (e) => toast.error(e.message),
  });
  const events = useQuery({
    queryKey: ["management-events", user?.id], enabled: account.manager,
    queryFn: async () => {
      const { data, error } = await supabase.from("campus_events").select("*").order("date");
      if (error) throw error;
      return data;
    },
  });
  const attendance = useQuery({
    queryKey: ["management-attendance", user?.id, date], enabled: account.manager && tab === "attendance",
    queryFn: async () => {
      let query = supabase.from("attendance").select("id,user_id,created_at,status,distance_m").order("created_at", { ascending: false }).limit(200);
      if (date) {
        const start = new Date(`${date}T00:00:00`);
        const end = new Date(start); end.setDate(end.getDate() + 1);
        query = query.gte("created_at", start.toISOString()).lt("created_at", end.toISOString());
      }
      const [rows, names, reviews] = await Promise.all([query, supabase.from("profiles").select("id,full_name,account_type"), supabase.from("attendance_reviews").select("*")]);
      if (rows.error) throw rows.error;
      if (names.error) throw names.error;
      if (reviews.error) throw reviews.error;
      return rows.data.map((row) => ({ ...row, name: names.data.find((p) => p.id === row.user_id)?.full_name ?? "Campus member", review: reviews.data.find((r) => r.attendance_id === row.id) }));
    },
  });
  const save = useMutation({
    mutationFn: async () => {
      if (!account.manager || !user) throw new Error("Management approval required");
      const payload = { ...event, title: event.title.trim(), venue: event.venue.trim(), description: event.description.trim() };
      const result = editing ? await supabase.from("campus_events").update(payload).eq("id", editing) : await supabase.from("campus_events").insert({ ...payload, created_by: user.id });
      if (result.error) throw result.error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campus-events"] }); qc.invalidateQueries({ queryKey: ["management-events"] }); setEvent(EMPTY_EVENT); setEditing(null); toast.success("Event published"); },
    onError: () => toast.error("Could not publish event"),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campus_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["campus-events"] }); qc.invalidateQueries({ queryKey: ["management-events"] }); setConfirmDelete(null); toast.success("Event removed"); },
    onError: () => toast.error("Could not remove event"),
  });
  const review = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: "approved" | "flagged" }) => {
      if (!user) throw new Error("Not signed in");
      const previousNote = attendance.data?.find((row) => row.id === id)?.review?.note ?? "";
      const { error } = await supabase.from("attendance_reviews").upsert({ attendance_id: id, reviewer_id: user.id, decision, note: notes[id] ?? previousNote, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["management-attendance"] }); toast.success("Attendance review saved"); },
    onError: () => toast.error("Could not save review"),
  });

  return <AppShell title="My Account & Access" subtitle="REVA campus identity" icon={<Users className="size-6 text-primary" />}>
    <section className="mb-6 border-b border-border pb-6">
      <h2 className="mb-3 text-lg font-semibold">Your account</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full max-w-sm space-y-2"><p className="text-xs text-muted-foreground">Account type</p>
          <AccountTypeSelector value={type ?? ACCOUNT_TYPES.find((t) => t.value === account.data?.accountType)?.value ?? "student"} onChange={setType} disabled={account.isLoading || profile.isPending} />
        </div>
        <label className="w-full max-w-sm text-xs text-muted-foreground">Full name<input aria-label="Full name" maxLength={100} className={`${inputClass} mt-1`} value={fullName ?? account.data?.fullName ?? ""} onChange={(e) => setFullName(e.target.value)} /></label>
        <label className="w-full max-w-sm text-xs text-muted-foreground">{registrationLabel(type ?? account.data?.accountType)}<input aria-label={registrationLabel(type ?? account.data?.accountType)} maxLength={50} className={`${inputClass} mt-1`} value={registration ?? account.data?.registrationNumber ?? ""} onChange={(e) => setRegistration(e.target.value)} /></label>
        <Button onClick={() => profile.mutate()} disabled={account.isLoading || profile.isPending}>Save account details</Button>
      </div>
      {!account.isLoading && !account.error && <div className="mt-5">
        <h3 className="text-sm font-semibold">Your access</h3>
        <ul className="mt-2 divide-y divide-border text-sm">
          {[{ title: "Personal campus services", allowed: true }, { title: "Event publishing & attendance review", allowed: account.manager }, { title: "Campus administration", allowed: account.admin }, { title: "Security & ID verification", allowed: account.security }].map((item) => <li key={item.title} className="flex flex-wrap items-center justify-between gap-2 py-2"><span>{item.title}</span><span className={`text-xs ${item.allowed ? "text-success" : "text-muted-foreground"}`}>{item.allowed ? "Available" : "Approval required"}</span></li>)}
        </ul>
      </div>}
    </section>
    {account.isLoading ? <p className="text-sm text-muted-foreground">Loading account…</p> : account.error ? <p role="alert" className="text-sm text-destructive">Could not load account permissions. <Button variant="link" onClick={() => account.refetch()}>Retry</Button></p> : !account.manager ? <div className="flex items-start gap-3 border-l-2 border-warning pl-4"><ShieldCheck className="size-5 shrink-0 text-warning" /><div><h2 className="text-base font-semibold">Management approval required</h2><p className="mt-1 text-sm text-muted-foreground">Only approved faculty and staff can publish events or review campus attendance.</p></div></div> : <>
      <div className="mb-5 flex gap-2" role="tablist" aria-label="Management views">{(["events", "attendance"] as const).map((view) => <Button key={view} role="tab" aria-selected={tab === view} variant={tab === view ? "default" : "outline"} onClick={() => setTab(view)} className="capitalize">{view}</Button>)}</div>
      {tab === "events" ? <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section><h2 className="mb-4 text-lg font-semibold">{editing ? "Edit event" : "Publish event"}</h2>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-3">
            <label className="block text-xs">Event title<input required maxLength={120} className={`${inputClass} mt-1`} value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-3"><label className="text-xs">Date<input required type="date" className={`${inputClass} mt-1`} value={event.date} onChange={(e) => setEvent({ ...event, date: e.target.value })} /></label><label className="text-xs">Time<input required type="time" className={`${inputClass} mt-1`} value={event.time} onChange={(e) => setEvent({ ...event, time: e.target.value })} /></label></div>
            <label className="block text-xs">Venue<input required maxLength={150} className={`${inputClass} mt-1`} value={event.venue} onChange={(e) => setEvent({ ...event, venue: e.target.value })} /></label>
            <label className="block text-xs">Category<select className={`${inputClass} mt-1`} value={event.tag} onChange={(e) => setEvent({ ...event, tag: e.target.value })}>{["Technical", "Academic", "Cultural", "Sports"].map((tag) => <option key={tag}>{tag}</option>)}</select></label>
            <label className="block text-xs">Description<textarea required maxLength={2000} rows={4} className={`${inputClass} mt-1`} value={event.description} onChange={(e) => setEvent({ ...event, description: e.target.value })} /></label>
            <div className="flex gap-2"><Button disabled={save.isPending}><Plus />{editing ? "Save event" : "Publish event"}</Button>{editing && <Button type="button" variant="outline" onClick={() => { setEditing(null); setEvent(EMPTY_EVENT); }}>Cancel</Button>}</div>
          </form>
        </section>
        <section><h2 className="mb-4 text-lg font-semibold">Published events</h2>{events.isLoading ? <p>Loading…</p> : events.error ? <p role="alert">Could not load events.</p> : !events.data?.length ? <p className="text-sm text-muted-foreground">No published events yet.</p> : <ul className="divide-y divide-border">{events.data.map((row) => <li key={row.id} className="py-3"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><h3 className="break-words text-sm font-semibold">{row.title}</h3><p className="text-xs text-muted-foreground">{fmtDate(row.date)} · {row.venue}</p></div><div className="flex shrink-0"><Button variant="ghost" size="icon" aria-label={`Attendees for ${row.title}`} onClick={() => setAttendeeEvent(attendeeEvent === row.id ? null : row.id)}><Users /></Button><Button variant="ghost" size="icon" aria-label={`Edit ${row.title}`} onClick={() => { setEditing(row.id); setEvent({ title: row.title, date: row.date, time: row.time, venue: row.venue, tag: row.tag, description: row.description }); }}><Pencil /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${row.title}`} onClick={() => setConfirmDelete(row.id)}><Trash2 /></Button></div></div>{attendeeEvent === row.id && <EventAttendees eventId={row.id} />}{confirmDelete === row.id && <div className="mt-2 flex items-center gap-2 text-xs">Remove this event?<Button variant="destructive" size="sm" disabled={remove.isPending} onClick={() => remove.mutate(row.id)}>Remove</Button><Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button></div>}</li>)}</ul>}</section>
      </div> : <section><h2 className="mb-4 text-lg font-semibold">Campus attendance reviews</h2><div className="mb-4 flex flex-wrap gap-3"><input aria-label="Search campus member" placeholder="Search name…" className={`${inputClass} max-w-72`} value={search} onChange={(e) => setSearch(e.target.value)} /><input aria-label="Attendance date" type="date" className={`${inputClass} max-w-52`} value={date} onChange={(e) => setDate(e.target.value)} /></div>
        {attendance.isLoading ? <p>Loading attendance…</p> : attendance.error ? <p role="alert">Could not load attendance.</p> : !attendance.data?.length ? <p className="text-sm text-muted-foreground">No attendance records for this period.</p> : <ul className="divide-y divide-border">{attendance.data.filter((row) => row.name.toLowerCase().includes(search.toLowerCase())).map((row) => <li className="py-4" key={row.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{row.name}</h3><p className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString("en-IN")} · {Math.round(row.distance_m)} m · {row.status}</p><p className="mt-1 text-xs capitalize">Review: {row.review?.decision ?? "Pending"}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" disabled={review.isPending} onClick={() => review.mutate({ id: row.id, decision: "approved" })}><Check />Approve</Button><Button size="sm" variant="outline" disabled={review.isPending} onClick={() => review.mutate({ id: row.id, decision: "flagged" })}><Flag />Flag</Button></div></div><input aria-label={`Review note for ${row.name}`} maxLength={500} placeholder="Review note" className={`${inputClass} mt-2 max-w-lg`} value={notes[row.id] ?? row.review?.note ?? ""} onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })} /></li>)}</ul>}
      </section>}
    </>}
  </AppShell>;
}