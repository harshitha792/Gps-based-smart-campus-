import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/_authenticated/operations")({
  head: pageHead(
    "Campus Operations",
    "Approved campus location, parking and emergency response management.",
  ),
  component: Operations,
});
function Operations() {
  const account = useCampusAccount();
  const qc = useQueryClient();
  const [location, setLocation] = useState({
    name: "",
    latitude: "",
    longitude: "",
    accessible: false,
    accessibility_note: "",
  });
  const [parking, setParking] = useState({ area: "", number: 1 });
  const data = useQuery({
    queryKey: ["campus-operations"],
    enabled: account.admin || account.security,
    queryFn: async () => {
      const [locations, slots, incidents, responses] = await Promise.all([
        supabase.from("campus_locations").select("*"),
        supabase.from("campus_parking_slots").select("*").order("number"),
        supabase.from("incident_reports").select("*").order("created_at", { ascending: false }),
        supabase.from("incident_responses").select("*"),
      ]);
      for (const r of [locations, slots, incidents, responses]) if (r.error) throw r.error;
      return {
        locations: locations.data ?? [],
        slots: slots.data ?? [],
        incidents: incidents.data ?? [],
        responses: responses.data ?? [],
      };
    },
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["campus-operations"] });
    qc.invalidateQueries({ queryKey: ["verified-locations"] });
  };
  const addLocation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("campus_locations")
        .insert({
          ...location,
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        });
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      toast.success("Verified location saved");
    },
    onError: (e) => toast.error(e.message),
  });
  const addSlot = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("campus_parking_slots").insert(parking);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const slot = useMutation({
    mutationFn: async ({ id, occupied }: { id: string; occupied: boolean }) => {
      const { error } = await supabase
        .from("campus_parking_slots")
        .update({ occupied, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const response = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("incident_responses")
        .upsert({ incident_id: id, status, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  return (
    <AppShell
      title="Campus Operations"
      subtitle="Verified campus configuration"
      icon={<ShieldCheck className="size-5 text-primary" />}
    >
      {!account.admin && !account.security ? (
        <p className="text-muted-foreground">Approved campus management access is required.</p>
      ) : (
        <>
          {account.admin && (
            <div className="grid gap-8 lg:grid-cols-2">
              <section>
                <h2 className="mb-4">Verified building location</h2>
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addLocation.mutate();
                  }}
                >
                  <label className="block text-xs">
                    Building name
                    <input
                      required
                      className={input}
                      value={location.name}
                      onChange={(e) => setLocation({ ...location, name: e.target.value })}
                    />
                  </label>
                  {(["latitude", "longitude"] as const).map((k) => (
                    <label className="block text-xs capitalize" key={k}>
                      {k}
                      <input
                        required
                        type="number"
                        step="any"
                        min={k === "latitude" ? -90 : -180}
                        max={k === "latitude" ? 90 : 180}
                        className={input}
                        value={location[k]}
                        onChange={(e) => setLocation({ ...location, [k]: e.target.value })}
                      />
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={location.accessible}
                      onChange={(e) => setLocation({ ...location, accessible: e.target.checked })}
                    />
                    Verified accessible facility
                  </label>
                  <label className="block text-xs">
                    Accessibility details
                    <input
                      className={input}
                      value={location.accessibility_note}
                      onChange={(e) =>
                        setLocation({ ...location, accessibility_note: e.target.value })
                      }
                    />
                  </label>
                  <Button disabled={addLocation.isPending}>Save verified location</Button>
                </form>
                <ul className="mt-4 divide-y divide-border">
                  {data.data?.locations.map((l) => (
                    <li key={l.id} className="py-3 text-sm">
                      {l.name} · {l.latitude}, {l.longitude}
                      {l.accessible && " · Accessible"}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="mb-4">Manually maintained parking</h2>
                <form
                  className="mb-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    addSlot.mutate();
                  }}
                >
                  <label className="block text-xs">
                    Parking area
                    <input
                      required
                      className={input}
                      value={parking.area}
                      onChange={(e) => setParking({ ...parking, area: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs">
                    Slot number
                    <input
                      required
                      min={1}
                      type="number"
                      className={input}
                      value={parking.number}
                      onChange={(e) => setParking({ ...parking, number: Number(e.target.value) })}
                    />
                  </label>
                  <Button disabled={addSlot.isPending}>Add slot</Button>
                </form>
                <ul className="divide-y divide-border">
                  {data.data?.slots.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span>
                        {s.area} · Slot {s.number}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={slot.isPending}
                        onClick={() => slot.mutate({ id: s.id, occupied: !s.occupied })}
                      >
                        {s.occupied ? "Occupied" : "Free"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
          <section className="mt-8 border-t border-border pt-6">
            <h2 className="mb-4">Emergency response tracking</h2>
            <ul className="divide-y divide-border">
              {data.data?.incidents.map((i) => (
                <li key={i.id} className="py-4">
                  <h3>{i.category}</h3>
                  <p className="my-2 text-sm">{i.description}</p>
                  {i.latitude !== null && (
                    <p className="text-xs text-muted-foreground">
                      GPS: {i.latitude}, {i.longitude}
                    </p>
                  )}
                  <select
                    aria-label={`Response for ${i.id}`}
                    className={`${input} mt-3 max-w-52`}
                    value={data.data?.responses.find((r) => r.incident_id === i.id)?.status ?? ""}
                    onChange={(e) => response.mutate({ id: i.id, status: e.target.value })}
                  >
                    <option value="" disabled>
                      Not acknowledged
                    </option>
                    {["Acknowledged", "Assigned", "Responding", "Resolved"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
            {!data.data?.incidents.length && (
              <p className="text-muted-foreground">No incidents to review.</p>
            )}
          </section>
          {data.error && (
            <p role="alert" className="mt-4 text-destructive">
              Could not load campus operations.
            </p>
          )}
        </>
      )}
    </AppShell>
  );
}
