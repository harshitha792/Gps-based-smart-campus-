import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { notificationsOptions } from "@/lib/notification-queries";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/seo";
import { StarterContent } from "@/components/StarterContent";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: pageHead(
    "Notifications",
    "Your REVA campus alerts, confirmations and announcement history.",
  ),
  loader: ({ context }) => context.queryClient.ensureQueryData(notificationsOptions),
  component: Notifications,
});

function Notifications() {
  const { data } = useSuspenseQuery(notificationsOptions);
  const [unread, setUnread] = useState(false);
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: async ({ id, read }: { id?: string; read: boolean }) => {
      let query = supabase
        .from("campus_notifications")
        .update({ read_at: read ? new Date().toISOString() : null });
      const result = id ? await query.eq("id", id) : await query.is("read_at", null);
      if (result.error) throw result.error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campus-notifications"] }),
    onError: () => toast.error("Could not update notification"),
  });
  return (
    <AppShell
      title="Notifications"
      subtitle={`${data.filter((n) => !n.read_at).length} unread`}
      icon={<Bell className="size-5 text-primary" />}
    >
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={unread} onChange={(e) => setUnread(e.target.checked)} />
          Unread only
        </label>
        <Button
          variant="outline"
          disabled={update.isPending || !data.some((n) => !n.read_at)}
          onClick={() => update.mutate({ read: true })}
        >
          <CheckCheck />
          Mark all read
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {data
          .filter((n) => !unread || !n.read_at)
          .map((n) => (
            <li key={n.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  {n.kind} · {new Date(n.created_at).toLocaleString("en-IN")}
                </p>
                <h2 className={n.read_at ? "text-muted-foreground" : "text-foreground"}>
                  {n.title}
                </h2>
                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {n.body}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={update.isPending}
                onClick={() => update.mutate({ id: n.id, read: !n.read_at })}
              >
                {n.read_at ? "Mark unread" : "Mark read"}
              </Button>
            </li>
          ))}
      </ul>
      {!data.filter((n) => !unread || !n.read_at).length && (
        <div className="py-16 text-center text-muted-foreground">
          <Bell className="mx-auto mb-3 size-8" />
          <p>No {unread ? "unread " : ""}notifications.</p>
        </div>
      )}
      {!data.length && <StarterContent kind="notifications" />}
    </AppShell>
  );
}
