import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
import { StarterContent } from "@/components/StarterContent";
export const Route = createFileRoute("/_authenticated/timetable")({
  head: pageHead("Smart Timetable", "Your REVA class, faculty and examination schedule."),
  component: Timetable,
});
function Timetable() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({
    title: "",
    kind: "Class",
    location: "",
    starts_at: "",
    ends_at: "",
  });
  const schedule = useQuery({
    queryKey: ["campus-schedule"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campus_schedule").select("*").order("starts_at");
      if (error) throw error;
      return data;
    },
  });
  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("campus_schedule")
        .insert({
          ...form,
          starts_at: new Date(form.starts_at).toISOString(),
          ends_at: new Date(form.ends_at).toISOString(),
          reminder_at: new Date(Date.parse(form.starts_at) - 15 * 60000).toISOString(),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campus-schedule"] });
      setForm({ ...form, title: "", location: "" });
      toast.success("Schedule saved");
    },
    onError: (e) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campus_schedule").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campus-schedule"] }),
    onError: (e) => toast.error(e.message),
  });
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  return (
    <AppShell
      title="Smart Timetable"
      subtitle="Your personal schedule"
      icon={<CalendarDays className="size-5 text-primary" />}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4">Add class or examination</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <label className="block text-xs">
              Title
              <input
                required
                minLength={2}
                maxLength={150}
                className={input}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className="block text-xs">
              Type
              <select
                className={input}
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
              >
                {["Class", "Examination", "Faculty"].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs">
              Location
              <input
                className={input}
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </label>
            {(["starts_at", "ends_at"] as const).map((k) => (
              <label className="block text-xs" key={k}>
                {k === "starts_at" ? "Start" : "End"}
                <input
                  required
                  type="datetime-local"
                  className={input}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
            <Button disabled={save.isPending}>Save schedule</Button>
          </form>
        </section>
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2>Upcoming schedule</h2>
            <select
              aria-label="Schedule type"
              className={`${input} max-w-36`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {["All", "Class", "Examination", "Faculty"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {schedule.error && <p role="alert">Could not load schedule.</p>}
          <ul className="divide-y divide-border">
            {schedule.data
              ?.filter((r) => filter === "All" || r.kind === filter)
              .map((r) => (
                <li className="flex items-start justify-between gap-3 py-4" key={r.id}>
                  <div>
                    <p className="text-xs text-primary">{r.kind}</p>
                    <h3>{r.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.starts_at).toLocaleString("en-IN")} · {r.location}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${r.title}`}
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(r.id)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
          </ul>
          {!schedule.data?.length && (
            <p className="text-muted-foreground">No schedule entries yet.</p>
          )}
        </section>
      </div>
      {!schedule.isPending && !schedule.error && <StarterContent kind="timetable" />}
    </AppShell>
  );
}
