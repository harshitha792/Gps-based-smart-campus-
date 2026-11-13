import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IdCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUser, displayName } from "@/hooks/use-auth";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { pageHead } from "@/lib/seo";
import { QrScanner } from "@/components/QrScanner";
export const Route = createFileRoute("/_authenticated/digital-id")({
  head: pageHead(
    "Digital Campus ID",
    "Your approved REVA digital ID and authorized campus entry and exit history.",
  ),
  component: DigitalId,
});
function DigitalId() {
  const { user } = useUser();
  const account = useCampusAccount();
  const qc = useQueryClient();
  const [token, setToken] = useState("");
  const [direction, setDirection] = useState("Entry");
  const ids = useQuery({
    queryKey: ["digital-ids"],
    queryFn: async () => {
      const { data, error } = await supabase.from("digital_ids").select("*");
      if (error) throw error;
      return data;
    },
  });
  const access = useQuery({
    queryKey: ["campus-access"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campus_access")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const mine = ids.data?.find((i) => i.user_id === user?.id);
  const request = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("digital_ids").insert({ user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digital-ids"] }),
    onError: (e) => toast.error(e.message),
  });
  const approve = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase
        .from("digital_ids")
        .update({ active, approved_by: user.id, ...(active ? { token: crypto.randomUUID() } : {}) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["digital-ids"] }),
    onError: (e) => toast.error(e.message),
  });
  const verify = useMutation({
    mutationFn: async () => {
      const normalized = token.replace(/^reva-id:/, "").trim();
      const { data, error } = await supabase
        .from("digital_ids")
        .select("*")
        .eq("token", normalized)
        .eq("active", true)
        .single();
      if (error || !data) throw new Error("ID is invalid, inactive or unavailable to your account");
      const result = await supabase
        .from("campus_access")
        .insert({ id_id: data.id, user_id: data.user_id, direction });
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campus-access"] });
      toast.success(`Verified ${direction.toLowerCase()} recorded`);
      setToken("");
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <AppShell
      title="Digital Campus ID"
      subtitle="Approved identity & campus access"
      icon={<IdCard className="size-5 text-primary" />}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4">Your campus ID</h2>
          {mine?.active ? (
            <div className="max-w-sm rounded-lg border border-border bg-card p-5">
              <h3>{account.data?.fullName || displayName(user)}</h3>
              <p className="mt-1 text-sm">{account.data?.registrationNumber ?? "Registration number not added"}</p>
              <p className="mb-5 text-xs text-muted-foreground">
                {account.label} · REVA University
              </p>
              <div className="inline-block rounded-md bg-card p-3">
                <QRCodeSVG value={`reva-id:${mine.token}`} size={180} />
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-success">
                <ShieldCheck className="size-4" />
                Approved campus identity
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 max-w-sm rounded-lg border border-border bg-card p-5">
                <IdCard className="mb-4 size-8 text-electric" /><p className="text-xs text-primary">REVA UNIVERSITY · ID PREVIEW</p><h3 className="mt-2">{account.data?.fullName || displayName(user)}</h3><p className="mt-1 text-sm text-muted-foreground">{account.label}</p><p className="mt-2 text-sm">{account.data?.registrationNumber ?? "Registration number not added"}</p><p className="mt-5 text-xs text-warning">Not valid for campus access · Approval required</p>
              </div>
              <p className="mb-3 text-muted-foreground">
                {mine
                  ? "Your ID request awaits campus approval."
                  : "No approved ID has been issued."}
              </p>
              {!mine && (
                <Button disabled={request.isPending} onClick={() => request.mutate()}>
                  Request digital ID
                </Button>
              )}
            </>
          )}
        </section>
        <section>
          <h2 className="mb-4">Entry & exit history</h2>
          <ul className="divide-y divide-border">
            {access.data
              ?.filter((a) => a.user_id === user?.id)
              .map((a) => (
                <li key={a.id} className="py-3 text-sm">
                  {a.direction} · {new Date(a.created_at).toLocaleString("en-IN")}
                </li>
              ))}
          </ul>
          {!access.data?.some((a) => a.user_id === user?.id) && (
            <p className="text-muted-foreground">No authorized access records yet.</p>
          )}
        </section>
      </div>
      {(account.admin || account.security) && (
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="mb-4">ID approval & access verification</h2>
          <ul className="mb-5 divide-y divide-border">
            {account.admin &&
              ids.data?.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <span className="break-all text-xs">
                    Member {i.user_id} · {i.active ? "Active" : "Pending / inactive"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={approve.isPending}
                    onClick={() => approve.mutate({ id: i.id, active: !i.active })}
                  >
                    {i.active ? "Revoke" : "Approve"}
                  </Button>
                </li>
              ))}
          </ul>
          <QrScanner onScan={setToken} />
          <form
            className="flex max-w-xl flex-wrap gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              verify.mutate();
            }}
          >
            <input
              required
              aria-label="Scanned ID code"
              placeholder="Scanned QR code value"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="min-w-48 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <select
              aria-label="Access direction"
              className="rounded-md border border-input bg-background p-2"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option>Entry</option>
              <option>Exit</option>
            </select>
            <Button disabled={verify.isPending}>Verify & record</Button>
          </form>
        </section>
      )}
      {(ids.error || access.error) && (
        <p role="alert" className="mt-4 text-destructive">
          Could not load identity records.
        </p>
      )}
    </AppShell>
  );
}
