import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { RevaLogo } from "@/components/Brand";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset password — REVA Smart Campus" },
    { name: "description", content: "Set a new password for your REVA Smart Campus account." },
    { property: "og:title", content: "Reset password — REVA Smart Campus" },
    { property: "og:description", content: "Set a new password for your REVA Smart Campus account." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState(""); const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const go = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (pw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated"); navigate({ to: "/horizon" });
  };
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <form onSubmit={go} className="glass w-full max-w-sm space-y-4 p-7">
        <RevaLogo />
        <h1 className="text-xl font-bold">Set a new password</h1>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="w-full rounded-lg border border-input bg-background/50 p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <button disabled={busy} className="w-full rounded-lg bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">Update password</button>
      </form>
    </div>
  );
}
