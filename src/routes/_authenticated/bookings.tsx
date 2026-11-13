import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { validInterval } from "@/lib/campus-rules";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/bookings")({
  head: pageHead(
    "Resource Booking",
    "Reserve available REVA laboratories, seminar halls, classrooms and study rooms.",
  ),
  component: Bookings,
});
function Bookings() {
  const account = useCampusAccount();
  const qc = useQueryClient();
  const resources = useQuery({
    queryKey: ["campus-resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campus_resources").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
  const bookings = useQuery({
    queryKey: ["resource-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resource_bookings")
        .select("*")
        .order("starts_at");
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState({ resource_id: "", starts_at: "", ends_at: "", purpose: "" });
  const [resource, setResource] = useState({
    name: "",
    category: "Laboratory",
    capacity: 1,
    location: "",
  });
  const [q, setQ] = useState("");
  const [available, setAvailable] = useState<boolean>();
  const check = useMutation({
    mutationFn: async () => {
      if (!validInterval(form.starts_at, form.ends_at) || !form.resource_id)
        throw new Error("Choose a resource and valid times");
      const { data, error } = await supabase.rpc("resource_availability", {
        resource: form.resource_id,
        from_time: new Date(form.starts_at).toISOString(),
        to_time: new Date(form.ends_at).toISOString(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: setAvailable,
    onError: (e) => toast.error(e.message),
  });
  const reserve = useMutation({
    mutationFn: async () => {
      if (!validInterval(form.starts_at, form.ends_at))
        throw new Error("End time must follow start time");
      const { error } = await supabase
        .from("resource_bookings")
        .insert({
          ...form,
          starts_at: new Date(form.starts_at).toISOString(),
          ends_at: new Date(form.ends_at).toISOString(),
        });
      if (error)
        throw new Error(
          error.code === "23P01"
            ? "This resource is already booked during those times"
            : error.message,
        );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resource-bookings"] });
      qc.invalidateQueries({ queryKey: ["campus-notifications"] });
      setAvailable(undefined);
      toast.success("Booking confirmed");
    },
    onError: (e) => toast.error(e.message),
  });
  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("resource_bookings")
        .update({ status: "Cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resource-bookings"] });
      qc.invalidateQueries({ queryKey: ["campus-notifications"] });
    },
    onError: (e) => toast.error(e.message),
  });
  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campus_resources").insert(resource);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campus-resources"] });
      setResource({ ...resource, name: "", location: "" });
      toast.success("Resource added");
    },
    onError: (e) => toast.error(e.message),
  });
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  return (
    <AppShell
      title="Resource Booking"
      subtitle="Availability & reservations"
      icon={<CalendarCheck className="size-5 text-primary" />}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4">Reserve a facility</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              reserve.mutate();
            }}
          >
            <input
              aria-label="Search resources"
              placeholder="Search facilities…"
              value={q}
              className={input}
              onChange={(e) => setQ(e.target.value)}
            />
            <label className="block text-xs">
              Resource
              <select
                required
                className={input}
                value={form.resource_id}
                onChange={(e) => {
                  setForm({ ...form, resource_id: e.target.value });
                  setAvailable(undefined);
                }}
              >
                <option value="">Choose resource</option>
                {resources.data
                  ?.filter(
                    (r) =>
                      r.available &&
                      `${r.name} ${r.category}`.toLowerCase().includes(q.toLowerCase()),
                  )
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} · {r.category} · {r.capacity} people
                    </option>
                  ))}
              </select>
            </label>
            {!resources.data?.length && (
              <p className="text-sm text-muted-foreground">No approved bookable facilities yet.</p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {(["starts_at", "ends_at"] as const).map((k) => (
                <label key={k} className="text-xs">
                  {k === "starts_at" ? "Start" : "End"}
                  <input
                    required
                    type="datetime-local"
                    value={form[k]}
                    className={input}
                    onChange={(e) => {
                      setForm({ ...form, [k]: e.target.value });
                      setAvailable(undefined);
                    }}
                  />
                </label>
              ))}
            </div>
            <label className="block text-xs">
              Purpose
              <input
                required
                minLength={3}
                maxLength={500}
                className={input}
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={check.isPending || !form.resource_id}
                onClick={() => check.mutate()}
              >
                Check availability
              </Button>
              <Button disabled={reserve.isPending || !form.resource_id}>Confirm booking</Button>
            </div>
            {available !== undefined && (
              <p role="status" className={available ? "text-success" : "text-destructive"}>
                {available ? "Available for these times" : "Not available for these times"}
              </p>
            )}
          </form>
        </section>
        <section>
          <h2 className="mb-4">Your reservations{account.admin ? " & campus bookings" : ""}</h2>
          {bookings.error && <p role="alert">Could not load bookings.</p>}
          <ul className="divide-y divide-border">
            {bookings.data?.map((b) => (
              <li key={b.id} className="py-4">
                <h3>
                  {resources.data?.find((r) => r.id === b.resource_id)?.name ?? "Campus resource"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(b.starts_at).toLocaleString("en-IN")} —{" "}
                  {new Date(b.ends_at).toLocaleString("en-IN")}
                </p>
                <p className="my-2 text-sm">
                  {b.purpose} · {b.status}
                </p>
                {b.status === "Confirmed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={cancel.isPending}
                    onClick={() => cancel.mutate(b.id)}
                  >
                    Cancel booking
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {!bookings.data?.length && <p className="text-muted-foreground">No bookings yet.</p>}
        </section>
      </div>
      {account.admin && (
        <section className="mt-8 max-w-xl border-t border-border pt-6">
          <h2 className="mb-4">Add approved resource</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              add.mutate();
            }}
          >
            <label className="block text-xs">
              Name
              <input
                required
                minLength={2}
                maxLength={150}
                className={input}
                value={resource.name}
                onChange={(e) => setResource({ ...resource, name: e.target.value })}
              />
            </label>
            <label className="block text-xs">
              Category
              <select
                className={input}
                value={resource.category}
                onChange={(e) => setResource({ ...resource, category: e.target.value })}
              >
                {["Laboratory", "Seminar hall", "Classroom", "Study room", "Other"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs">
              Capacity
              <input
                type="number"
                required
                min={1}
                className={input}
                value={resource.capacity}
                onChange={(e) => setResource({ ...resource, capacity: Number(e.target.value) })}
              />
            </label>
            <label className="block text-xs">
              Verified location
              <input
                className={input}
                value={resource.location}
                onChange={(e) => setResource({ ...resource, location: e.target.value })}
              />
            </label>
            <Button disabled={add.isPending}>Add resource</Button>
          </form>
        </section>
      )}
    </AppShell>
  );
}
