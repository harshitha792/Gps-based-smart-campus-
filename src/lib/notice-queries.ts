import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const publishedNoticesOptions = queryOptions({
  queryKey: ["published-notices"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("campus_notices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      date: n.created_at.slice(0, 10),
    }));
  },
});
