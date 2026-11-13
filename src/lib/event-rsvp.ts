import { supabase } from "@/integrations/supabase/client";
import type { CampusEvent } from "@/lib/campus-data";

export function isBookableEvent(event: Pick<CampusEvent, "demo">) {
  return event.demo === false;
}

export async function reserveEvent(event: Pick<CampusEvent, "id" | "demo">, userId: string) {
  if (!isBookableEvent(event)) throw new Error("Sample events are not open for registration.");
  const { error } = await supabase.from("event_rsvps").insert({ event_id: event.id, user_id: userId });
  if (error && error.code !== "23505") throw new Error(error.message);
}

export async function cancelEvent(eventId: string, userId: string) {
  const { error } = await supabase.from("event_rsvps").delete().eq("event_id", eventId).eq("user_id", userId);
  if (error) throw new Error(error.message);
}