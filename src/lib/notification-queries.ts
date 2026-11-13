import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const notificationsOptions = queryOptions({
  queryKey: ["campus-notifications"],
  refetchInterval: 30000,
  queryFn: async () => {
    const reminders = await supabase.rpc("deliver_personal_reminders");
    if (reminders.error) throw reminders.error;
    const { data, error } = await supabase
      .from("campus_notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
