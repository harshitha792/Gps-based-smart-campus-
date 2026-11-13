import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, User, Loader2 } from "lucide-react";
import { RevaLogo } from "@/components/Brand";
import { Button } from "@/components/ui/button";
const campusPhoto = "/images/reva-aerial.jpg";
import { type AccountType } from "@/lib/account-types";
import { AccountTypeSelector } from "@/components/AccountTypeSelector";
import { registrationLabel, validRegistration } from "@/lib/profile-details";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — REVA Smart Campus" },
      { name: "description", content: "Sign in to REVA Smart Campus for students, teachers and working staff: attendance, campus services and events." },
      { property: "og:title", content: "REVA Smart Campus — Campus Sign In" },
      { property: "og:description", content: "A secure campus experience for REVA students, teachers and working staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const pwSchema = z.string().min(8, "Password must be at least 8 characters").max(72);

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("reva_demo_session")) navigate({ to: "/horizon" });
  }, [navigate]);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const em = emailSchema.safeParse(email);
    if (!em.success) { toast.error(em.error.issues[0]?.message ?? "Invalid email"); return; }
    setBusy(true);
    try {
      if (mode === "forgot") {
        setSent("Demo mode is enabled. No password reset email is required.");
        return;
      }
      const pw = pwSchema.safeParse(password);
      if (!pw.success) { toast.error(pw.error.issues[0]?.message ?? "Password must be at least 8 characters"); return; }
      if (mode === "signup" && !name.trim()) { toast.error("Enter your full name"); return; }
      // DEMO ONLY: accepts any syntactically valid email and any password of 8+ characters.
      // This is not real identity verification and must not be used for production access.
      const demoUser = {
        id: `demo-${btoa(em.data).replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}`,
        email: em.data,
        name: name.trim() || em.data.split("@")[0],
        accountType,
        signedInAt: new Date().toISOString(),
      };
      localStorage.setItem("reva_demo_session", JSON.stringify(demoUser));
      navigate({ to: "/horizon" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  };


  const inputCls = "w-full rounded-lg border border-input bg-background/50 py-3 pl-10 pr-10 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring";


  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={campusPhoto} alt="REVA University aerial campus photograph" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1088} />
      <div className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-background/30" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
        <header className="flex items-center gap-10">
          <RevaLogo />
          
        </header>
        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div>
            <h1 className="text-2xl font-semibold leading-snug">REVA<br /><span className="text-gradient">Smart Campus</span></h1>
            <p className="mt-4 max-w-sm text-sm text-foreground/85">A shared campus experience for students, teachers and working staff.</p>
          </div>
          <div className="glass mx-auto w-full max-w-[380px] p-6">
            <h2 className="text-xl font-semibold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signup" ? "Create your campus account" : mode === "forgot" ? "Reset your password" : "Sign in to your campus account"}
            </p>
            {mode !== "forgot" && !sent && <div className="mt-5 space-y-2">
              <p className="text-xs font-medium">{mode === "signup" ? "I am a" : "Sign in as"}</p>
              <AccountTypeSelector value={accountType} onChange={setAccountType} disabled={busy} />
              <p className="text-xs text-muted-foreground">{mode === "signup" ? "Management tools require campus approval." : "Access follows your saved account and campus approvals."}</p>
            </div>}
            {sent ? (
              <div className="mt-6 rounded-lg border border-success/40 bg-success/10 p-4 text-sm">
                {sent}
                <Button className="mt-3 block text-primary underline" onClick={() => { setSent(null); setMode("signin"); }}>Back to sign in</Button>
              </div>
            ) : (
              <>
                <form onSubmit={submit} className="mt-5 space-y-3">
                  {mode === "signup" && (
                    <div className="relative"><User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input required aria-label="Full name" className={inputCls} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></div>
                  )}
                  {mode === "signup" && <label className="block text-xs text-muted-foreground">{registrationLabel(accountType)}<input required aria-label={registrationLabel(accountType)} className="mt-1 w-full rounded-lg border border-input bg-background/50 px-3 py-3 text-sm text-foreground" value={registration} onChange={(e) => setRegistration(e.target.value)} maxLength={50} /></label>}
                  <div className="relative"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input className={inputCls} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
                  {mode !== "forgot" && (
                    <div className="relative"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input className={inputCls} type={show ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                      <Button type="button" onClick={() => setShow(!show)} variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div>
                  )}
                  {mode === "signin" && <div className="text-right"><Button type="button" onClick={() => setMode("forgot")} variant="link" className="h-auto p-0 text-xs">Forgot password?</Button></div>}
                  <Button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 disabled:opacity-60">
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === "signup" ? "Create Campus Account" : mode === "forgot" ? "Send reset link" : "Sign In"}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {mode === "signin" ? <>Don't have an account? <Button onClick={() => setMode("signup")} variant="link" className="h-auto p-0 text-xs">Create Campus Account</Button></>
                    : <>Already have an account? <Button onClick={() => setMode("signin")} variant="link" className="h-auto p-0 text-xs">Sign in</Button></>}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
