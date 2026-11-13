import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Phone, Shield, Stethoscope, Flame, Headphones, Loader2, AlertTriangle } from "lucide-react";
import { AppShell, Panel, PageHero } from "@/components/AppShell";
import { FeatureIcon } from "@/components/Brand";
import { FEATURES } from "@/lib/features";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-auth";
import { pageHead } from "@/lib/seo";
import safetyImg from "@/assets/safety.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/safety")({
  head: pageHead("Safety & Emergency", "SOS, emergency contacts and incident reporting for REVA students."),
  component: Safety,
});

const CONTACTS = [
  { name: "National Emergency", tel: "112", icon: Phone, tone: "from-destructive to-violet" },
  { name: "Ambulance", tel: "108", icon: Stethoscope, tone: "from-success to-chart-2" },
  { name: "Fire & Rescue", tel: "101", icon: Flame, tone: "from-warning to-destructive" },
  { name: "Police", tel: "100", icon: Shield, tone: "from-electric to-primary" },
  { name: "Women Helpline", tel: "1091", icon: Headphones, tone: "from-violet to-primary" },
];
const schema = z.object({ category: z.string().min(1), description: z.string().trim().min(5, "Describe the issue (5+ characters)").max(1000) });

function Safety() {
  const f = FEATURES[6];
  const { user } = useUser();
  const qc = useQueryClient();
  const [category, setCategory] = useState("Security"); const [description, setDescription] = useState("");
  const [sosOpen, setSosOpen] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const responses = useQuery({ queryKey: ["my-incident-responses"], refetchInterval: 30000, queryFn: async () => { const { data, error } = await supabase.from("incident_responses").select("*"); if (error) throw error; return data; } });
  const reports = useQuery({ queryKey: ["reports"], queryFn: async () => { const { data, error } = await supabase.from("incident_reports").select("*").order("created_at", { ascending: false }).limit(20); if (error) throw error; return data; } });

  const submit = useMutation({
    mutationFn: async () => {
      const v = schema.parse({ category, description });
      if (!user) throw new Error("Sign in to submit an incident");
      let lat: number | null = null, lng: number | null = null;
      if (shareLocation) try { const p = await new Promise<GeolocationPosition>((r, j) => navigator.geolocation.getCurrentPosition(r, j, { timeout: 8000 })); lat = p.coords.latitude; lng = p.coords.longitude; } catch { toast.info("Location unavailable; the report will be saved without GPS."); }
      const { error } = await supabase.from("incident_reports").insert({ user_id: user.id, category: v.category, description: v.description, latitude: lat, longitude: lng });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Report saved"); setDescription(""); qc.invalidateQueries({ queryKey: ["reports"] }); },
    onError: (e) => toast.error(e instanceof z.ZodError ? e.issues[0]?.message : e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AppShell title="Safety & Emergency" subtitle="Help is one tap away" icon={f ? <FeatureIcon icon={f.icon} tone={f.tone} size="sm" /> : undefined}>
      <PageHero image={safetyImg} title="Stay safe on campus" text="Call emergency services directly or report an incident." />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Emergency Assistance">
          <div className="flex flex-col items-center py-4">
            <Button onClick={() => setSosOpen(true)} variant="destructive" className="relative grid h-40 w-40 place-items-center rounded-full text-4xl font-extrabold transition hover:scale-105">
              <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" /><span className="relative">SOS</span>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">Tap to start an emergency call</p>
          </div>
          {sosOpen && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-destructive" />Choose who to call</div>
              <p className="mt-1 text-xs text-muted-foreground">No automatic alert is sent — no notification provider is configured. Use these to place a real phone call.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="tel:112" className="rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">Call 112</a>
                <a href="tel:108" className="rounded-lg border border-border px-4 py-2 text-sm">Ambulance 108</a>
                <Button variant="ghost" onClick={() => setSosOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Panel>
        <Panel title="Quick Contacts">
          <ul className="space-y-2">{CONTACTS.map((c) => (
            <li key={c.tel}><a href={`tel:${c.tel}`} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 hover:bg-accent"><FeatureIcon icon={c.icon} tone={c.tone} size="sm" /><div className="flex-1"><div className="text-sm font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.tel}</div></div><Phone className="h-4 w-4 text-primary" /></a></li>
          ))}</ul>
          <p className="mt-3 text-xs text-muted-foreground">Add your campus security desk number here once confirmed.</p>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Report an incident">
          <form onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} className="space-y-3">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-input bg-muted p-2.5 text-sm">
              {["Security", "Medical", "Fire", "Harassment", "Infrastructure", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={4} placeholder="What happened and where?" className="w-full rounded-lg border border-input bg-muted/60 p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={shareLocation} onChange={(e) => setShareLocation(e.target.checked)} />Share my GPS location with approved campus security</label>
            <Button disabled={submit.isPending}>{submit.isPending && <Loader2 className="h-4 w-4 animate-spin" />}Submit report</Button>
            <p className="text-xs text-muted-foreground">Saved incidents are visible to authorized security accounts in the app. No SMS or external dispatch is sent; call 112 for urgent help.</p>
          </form>
        </Panel>
        <Panel title="Your reports">
          {reports.isLoading ? <Loader2 className="mx-auto animate-spin" /> : !reports.data?.length ? <p className="py-6 text-center text-sm text-muted-foreground">No reports yet.</p> : (
            <ul className="space-y-2">{reports.data.map((r) => <li key={r.id} className="rounded-lg bg-muted/50 p-3"><div className="flex justify-between text-xs"><span className="font-semibold text-primary">{r.category}</span><span className="text-muted-foreground">{new Date(r.created_at).toLocaleString("en-IN")}</span></div><p className="mt-1 text-sm">{r.description}</p><p className="mt-2 text-xs text-primary">Security response: {responses.data?.find((s) => s.incident_id === r.id)?.status ?? "Not acknowledged"}</p></li>)}</ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
