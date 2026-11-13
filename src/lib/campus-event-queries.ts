import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EVENTS, type CampusEvent } from "@/lib/campus-data";

export const campusEventsOptions = queryOptions({
  queryKey: ["campus-events"],
  queryFn: async (): Promise<CampusEvent[]> => {
    const { data, error } = await supabase.from("campus_events").select("id,title,date,time,venue,tag,description").order("date");
    if (error) throw error;
    const published = data.map((event) => ({ ...event, image: "", demo: false }));
    return [...published, ...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  },
});