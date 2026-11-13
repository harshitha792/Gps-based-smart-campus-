CREATE TABLE public.event_rsvps (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 event_id uuid NOT NULL REFERENCES public.campus_events(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (event_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.event_rsvps TO authenticated;
GRANT ALL ON public.event_rsvps TO service_role;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read own rsvps" ON public.event_rsvps FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "organizers read attendee lists" ON public.event_rsvps FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'campus_manager'));
CREATE POLICY "members reserve own place" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "members cancel own rsvp" ON public.event_rsvps FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX event_rsvps_user_idx ON public.event_rsvps(user_id);