import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, ImageIcon, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-auth";
import { useCampusAccount } from "@/hooks/use-campus-account";
import { canRateReport, classifyComplaint, validPhoto } from "@/lib/campus-rules";
import { StarterContent } from "@/components/StarterContent";

function ReportPhoto({ path }: { path: string }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    let active = true;
    supabase.storage
      .from("campus-reports")
      .createSignedUrl(path, 300)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl);
      });
    return () => {
      active = false;
    };
  }, [path]);
  return url ? (
    <img
      src={url}
      alt="Reported item or issue"
      className="mb-3 aspect-video w-full rounded-md object-cover"
    />
  ) : (
    <div className="mb-3 grid aspect-video place-items-center bg-muted">
      <ImageIcon className="text-muted-foreground" />
    </div>
  );
}
export function CampusReports({ mode }: { mode: "Complaint" | "LostFound" | "Feedback" }) {
  const { user } = useUser();
  const account = useCampusAccount();
  const qc = useQueryClient();
  const title =
    mode === "Complaint"
      ? "Complaint Management"
      : mode === "Feedback"
        ? "Student Feedback"
        : "Lost & Found";
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    kind: mode === "LostFound" ? "Lost" : mode,
    category: "Other",
    rating: 5,
  });
  const [photo, setPhoto] = useState<File>();
  const [claim, setClaim] = useState<string>();
  const [evidence, setEvidence] = useState("");
  const reports = useQuery({
    queryKey: ["campus-reports", mode, user?.id, account.admin],
    queryFn: async () => {
      if (mode === "LostFound" && !account.admin) {
        const { data, error } = await supabase.rpc("lost_found_feed");
        if (error) throw error;
        return data.map((r) => ({
          ...r,
          user_id: "",
          department: "",
          rating: null as number | null,
        }));
      }
      let query = supabase
        .from("campus_reports")
        .select("*")
        .order("created_at", { ascending: false });
      query = mode === "LostFound" ? query.in("kind", ["Lost", "Found"]) : query.eq("kind", mode);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
  const claims = useQuery({
    queryKey: ["item-claims", user?.id],
    enabled: mode === "LostFound",
    queryFn: async () => {
      const { data, error } = await supabase.from("item_claims").select("*");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["campus-reports"] });
    qc.invalidateQueries({ queryKey: ["item-claims"] });
  };
  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to submit");
      let path: string | null = null;
      if (photo) {
        if (!validPhoto(photo)) throw new Error("Choose a JPG, PNG or WebP photo up to 5MB");
        path = `${user.id}/${crypto.randomUUID()}.${photo.type.split("/")[1]}`;
        const { error } = await supabase.storage.from("campus-reports").upload(path, photo);
        if (error) throw error;
      }
      const { error } = await supabase.from("campus_reports").insert({
        title: form.title.trim(),
        description: form.description.trim(),
        kind: form.kind,
        category: form.category,
        photo_path: path,
        rating: mode === "Feedback" ? form.rating : null,
      });
      if (error) {
        if (path) await supabase.storage.from("campus-reports").remove([path]);
        throw error;
      }
    },
    onSuccess: () => {
      refresh();
      setAdding(false);
      setPhoto(undefined);
      setForm({ ...form, title: "", description: "" });
      toast.success("Report saved");
    },
    onError: (e) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: async ({
      id,
      status,
      department,
      rating,
    }: {
      id: string;
      status?: string;
      department?: string;
      rating?: number;
    }) => {
      const { error } = await supabase
        .from("campus_reports")
        .update({
          ...(status ? { status } : {}),
          ...(department !== undefined ? { department } : {}),
          ...(rating ? { rating } : {}),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const claimItem = useMutation({
    mutationFn: async () => {
      if (!claim) throw new Error("Choose an item");
      const { error } = await supabase.from("item_claims").insert({ report_id: claim, evidence });
      if (error) throw error;
    },
    onSuccess: () => {
      refresh();
      setClaim(undefined);
      setEvidence("");
      toast.success("Claim submitted for verification");
    },
    onError: (e) => toast.error(e.message),
  });
  const verify = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("item_claims").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e) => toast.error(e.message),
  });
  const input = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  const rows =
    reports.data?.filter(
      (r) =>
        `${r.title} ${r.description} ${r.category}`.toLowerCase().includes(q.toLowerCase()) &&
        (filter === "All" || r.status === filter || r.kind === filter),
    ) ?? [];
  return (
    <AppShell
      title={title}
      subtitle="REVA campus community"
      icon={<ClipboardList className="size-5 text-primary" />}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <input
            aria-label="Search reports"
            className={`${input} pl-9`}
            placeholder="Search reports…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          aria-label="Filter reports"
          className={`${input} max-w-40`}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {[
            "All",
            ...(mode === "LostFound" ? ["Lost", "Found"] : []),
            "Open",
            "Assigned",
            "In progress",
            "Resolved",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Button onClick={() => setAdding(!adding)}>
          <Plus />
          {mode === "Feedback" ? "Submit feedback" : "New report"}
        </Button>
      </div>
      {adding && (
        <form
          className="mb-6 max-w-2xl space-y-3 border-b border-border pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {mode === "LostFound" && (
            <label className="block text-xs">
              Report type
              <select
                className={input}
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
              >
                <option>Lost</option>
                <option>Found</option>
              </select>
            </label>
          )}
          <label className="block text-xs">
            Title
            <input
              required
              minLength={3}
              maxLength={150}
              className={input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="block text-xs">
            Description
            <textarea
              required
              minLength={5}
              maxLength={3000}
              rows={4}
              className={input}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                  ...(mode === "Complaint" ? { category: classifyComplaint(e.target.value) } : {}),
                })
              }
            />
          </label>
          <label className="block text-xs">
            Category
            <select
              className={input}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {[
                "Other",
                "Wi-Fi",
                "Maintenance",
                "Classroom",
                "Laboratory",
                "Library",
                "Food",
                "Parking",
                "Personal item",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {mode === "Feedback" && (
            <label className="block text-xs">
              Facility rating
              <select
                className={input}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-xs">
            Photograph
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={`${input} mt-1`}
              onChange={(e) => setPhoto(e.target.files?.[0])}
            />
          </label>
          <Button disabled={save.isPending}>{save.isPending ? "Saving…" : "Submit"}</Button>
          <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </form>
      )}
      {reports.error && (
        <p role="alert" className="text-destructive">
          Could not load reports.{" "}
          <Button variant="link" onClick={() => reports.refetch()}>
            Retry
          </Button>
        </p>
      )}
      {reports.isPending ? (
        <p className="py-12 text-muted-foreground">Loading reports…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => (
            <article key={r.id} className="rounded-lg border border-border bg-card p-4">
              {r.photo_path && <ReportPhoto path={r.photo_path} />}
              <p className="text-xs text-primary">
                {r.kind} · {r.category} · {r.status}
              </p>
              <h3 className="mt-1 break-words font-semibold">{r.title}</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {r.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("en-IN")}
                {r.department && ` · ${r.department}`}
              </p>
              {r.rating && <p className="mt-2 text-sm text-warning">Rating: {r.rating} / 5</p>}
              {account.admin && (
                <div className="mt-3 space-y-2">
                  <label className="block text-xs">
                    Progress
                    <select
                      className={input}
                      value={r.status}
                      onChange={(e) => update.mutate({ id: r.id, status: e.target.value })}
                    >
                      {["Open", "Assigned", "In progress", "Resolved"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs">
                    Department
                    <input
                      className={input}
                      defaultValue={r.department}
                      onBlur={(e) => {
                        if (e.target.value !== r.department)
                          update.mutate({ id: r.id, department: e.target.value });
                      }}
                    />
                  </label>
                </div>
              )}
              {r.user_id === user?.id && canRateReport(r.kind, r.status) && (
                <label className="mt-3 block text-xs">
                  {r.kind === "Feedback" ? "Your rating" : "Rate resolution"}
                  <select
                    className={input}
                    value={r.rating ?? ""}
                    onChange={(e) => update.mutate({ id: r.id, rating: Number(e.target.value) })}
                  >
                    <option value="" disabled>
                      Select rating
                    </option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} / 5
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {r.kind === "Found" &&
                r.status !== "Resolved" &&
                !claims.data?.some((c) => c.report_id === r.id && c.user_id === user?.id) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setClaim(r.id)}
                  >
                    Claim ownership
                  </Button>
                )}
              {claims.data
                ?.filter((c) => c.report_id === r.id)
                .map((c) => (
                  <div key={c.id} className="mt-3 border-t border-border pt-3 text-xs">
                    <p>Claim: {c.status}</p>
                    <p className="break-words text-muted-foreground">{c.evidence}</p>
                    {account.admin && c.status === "Pending" && (
                      <div className="mt-2 flex gap-2">
                        {["Approved", "Rejected"].map((s) => (
                          <Button
                            size="sm"
                            variant="outline"
                            key={s}
                            disabled={verify.isPending}
                            onClick={() => verify.mutate({ id: c.id, status: s })}
                          >
                            {s === "Approved" ? "Approve" : "Reject"}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </article>
          ))}
        </div>
      )}
      {!reports.isPending && !rows.length && (
        <p className="py-16 text-center text-muted-foreground">
          No reports{q || filter !== "All" ? " match these filters" : " yet"}.
        </p>
      )}
      {mode !== "LostFound" && <StarterContent kind={mode === "Complaint" ? "complaints" : "feedback"} />}
      {claim && (
        <form
          className="mt-5 max-w-xl space-y-3 border-t border-border pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            claimItem.mutate();
          }}
        >
          <h2>Ownership claim</h2>
          <label className="block text-xs">
            Private ownership evidence
            <textarea
              required
              minLength={10}
              maxLength={2000}
              rows={3}
              className={input}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            />
          </label>
          <Button disabled={claimItem.isPending}>Submit claim</Button>
          <Button type="button" variant="ghost" onClick={() => setClaim(undefined)}>
            Cancel
          </Button>
        </form>
      )}
    </AppShell>
  );
}
