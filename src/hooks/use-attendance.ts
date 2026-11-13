import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const attendanceQuery = {
  queryKey: ["attendance"],
  queryFn: async () => {
    const { data, error } = await supabase.from("attendance").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return data;
  },
};
export const useAttendance = () => useQuery(attendanceQuery);
export const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
