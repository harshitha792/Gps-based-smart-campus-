import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { accountLabel } from "@/lib/account-types";
import { useUser } from "@/hooks/use-auth";

export function EventAttendees({ eventId }: { eventId: string }) {
  const [search, setSearch] = useState("");
  const { user } = useUser();
  const query = useQuery({
    queryKey: ["event-attendees", eventId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("event_rsvps").select("id,created_at,profiles(full_name,account_type)").eq("event_id", eventId).order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const rows = query.data?.filter((row) => (row.profiles?.full_name ?? "Campus member").toLowerCase().includes(search.toLowerCase())) ?? [];
  return <section className="mt-3 border-t border-border pt-3" aria-label="Event attendees">
    <h4 className="text-sm font-semibold">Attendees{query.data ? ` (${query.data.length})` : ""}</h4>
    {query.isPending ? <p className="py-3 text-xs text-muted-foreground">Loading sign-ups…</p> : query.error ? <p role="alert" className="text-xs text-destructive">Could not load attendees. <Button variant="link" size="sm" onClick={() => query.refetch()}>Retry</Button></p> : <>
      <input aria-label="Search attendees" placeholder="Search attendees…" value={search} onChange={(e) => setSearch(e.target.value)} className="my-2 w-full rounded-md border border-input bg-background px-3 py-2 text-xs" />
      {!query.data?.length ? <p className="text-xs text-muted-foreground">No registrations yet.</p> : !rows.length ? <p className="text-xs text-muted-foreground">No matching attendees.</p> : <ul className="max-h-64 divide-y divide-border overflow-y-auto">{rows.map((row) => <li key={row.id} className="py-2"><div className="break-words text-sm font-medium">{row.profiles?.full_name ?? "Campus member"}</div><div className="text-xs text-muted-foreground">{accountLabel(row.profiles?.account_type)} · Registered {new Date(row.created_at).toLocaleString("en-IN")}</div></li>)}</ul>}
    </>}
    <Button variant="outline" size="sm" className="mt-2" onClick={() => query.refetch()} disabled={query.isFetching}>Refresh attendees</Button>
  </section>;
}