import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
import { StarterContent } from "@/components/StarterContent";

const options = queryOptions({
  queryKey: ["notice-board"],
  queryFn: async () => {
    const [notices, reads] = await Promise.all([
      supabase.from("campus_notices").select("*").order("created_at", { ascending: false }),
      supabase.from("notice_reads").select("notice_id"),
    ]);
    if (notices.error) throw notices.error;
    if (reads.error) throw reads.error;
    return { notices: notices.data, reads: reads.data };
  },
});
export const Route = createFileRoute("/_authenticated/notices")({
  head: pageHead(
    "Digital Notice Board",
    "Official published university and department announcements for REVA members.",
  ),
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  component: Notices,
});
const CATEGORIES = ["University", "Department", "Academic", "Examination", "Event", "Emergency"];
function Notices() {
  const { data } = useSuspenseQuery(options);
  const account = useCampusAccount();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [unread, setUnread] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", department: "", category: "University" });
  const [publishing, setPublishing] = useState(false);
  const publish = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campus_notices").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      setPublishing(false);
      setForm({ title: "", body: "", department: "", category: "University" });
      qc.invalidateQueries({ queryKey: ["notice-board"] });
      qc.invalidateQueries({ queryKey: ["campus-notifications"] });
      toast.success("Notice published");
    },
    onError: () => toast.error("Could not publish notice"),
  });
  const read = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const result = value
        ? await supabase.from("notice_reads").insert({ notice_id: id })
        : await supabase.from("notice_reads").delete().eq("notice_id", id);
      if (result.error) throw result.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notice-board"] }),
    onError: () => toast.error("Could not update read status"),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campus_notices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notice-board"] }),
    onError: () => toast.error("Could not remove notice"),
  });
  const rows = data.notices.filter(
    (n) =>
      (category === "All" || category === n.category) &&
      (!unread || !data.reads.some((r) => r.notice_id === n.id)) &&
      `${n.title} ${n.body} ${n.department}`.toLowerCase().includes(q.toLowerCase()),
  );
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  return (
    <AppShell
      title="Digital Notice Board"
      subtitle="University & department announcements"
      icon={<Megaphone className="size-5 text-primary" />}
    >
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          aria-label="Search notices"
          placeholder="Search announcements…"
          className={`${input} max-w-80`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          aria-label="Notice category"
          className={`${input} max-w-48`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {["All", ...CATEGORIES].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={unread} onChange={(e) => setUnread(e.target.checked)} />
          Unread only
        </label>
        {account.admin && (
          <Button onClick={() => setPublishing(!publishing)}>
            <Plus />
            Publish notice
          </Button>
        )}
      </div>
      {publishing && (
        <form
          className="mb-6 max-w-2xl space-y-3 border-b border-border pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            publish.mutate();
          }}
        >
          <label className="block text-xs">
            Title
            <input
              required
              maxLength={150}
              className={input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">
              Category
              <select
                className={input}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              Department
              <input
                maxLength={120}
                className={input}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </label>
          </div>
          <label className="block text-xs">
            Announcement
            <textarea
              required
              maxLength={5000}
              rows={4}
              className={input}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </label>
          <Button disabled={publish.isPending}>Publish</Button>
          <Button type="button" variant="ghost" onClick={() => setPublishing(false)}>
            Cancel
          </Button>
        </form>
      )}
      <ul className="divide-y divide-border">
        {rows.map((n) => {
          const isRead = data.reads.some((r) => r.notice_id === n.id);
          return (
            <li key={n.id} className="py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-primary">
                    {n.category}
                    {n.department && ` · ${n.department}`}
                  </p>
                  <h2>{n.title}</h2>
                </div>
                {account.admin && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remove ${n.title}`}
                    onClick={() => {
                      if (window.confirm("Remove this announcement?")) remove.mutate(n.id);
                    }}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {n.body}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <time className="text-xs text-muted-foreground">
                  {new Date(n.created_at).toLocaleString("en-IN")}
                </time>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={read.isPending}
                  onClick={() => read.mutate({ id: n.id, value: !isRead })}
                >
                  {isRead ? "Mark unread" : "Mark read"}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      {!rows.length && (
        <p className="py-16 text-center text-muted-foreground">
          No published announcements
          {q || category !== "All" || unread ? " match these filters" : " yet"}.
        </p>
      )}
      {!data.notices.length && <StarterContent kind="notices" />}
    </AppShell>
  );
}
