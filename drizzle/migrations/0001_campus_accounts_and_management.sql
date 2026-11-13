ALTER TABLE public.profiles ADD COLUMN account_type text NOT NULL DEFAULT 'student' CHECK (account_type IN ('student', 'teacher', 'staff'));
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, account_type)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), CASE WHEN NEW.raw_user_meta_data->>'account_type' IN ('teacher','staff') THEN NEW.raw_user_meta_data->>'account_type' ELSE 'student' END);
  RETURN NEW;
END $$;
CREATE TYPE public.app_role AS ENUM ('campus_manager');
CREATE TABLE public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role public.app_role NOT NULL,
 UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE POLICY "managers read attendance" ON public.attendance FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'campus_manager'));
CREATE POLICY "managers read names" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'campus_manager'));
CREATE TABLE public.campus_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
 date date NOT NULL,
 time text NOT NULL,
 venue text NOT NULL,
 tag text NOT NULL CHECK (tag IN ('Academic','Cultural','Sports','Technical')),
 description text NOT NULL CHECK (char_length(description) BETWEEN 1 AND 2000),
 created_by uuid NOT NULL DEFAULT auth.uid(),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campus_events TO authenticated;
GRANT ALL ON public.campus_events TO service_role;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campus events read" ON public.campus_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "managers create events" ON public.campus_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'campus_manager') AND created_by = auth.uid());
CREATE POLICY "managers update events" ON public.campus_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'campus_manager')) WITH CHECK (public.has_role(auth.uid(), 'campus_manager'));
CREATE POLICY "managers delete events" ON public.campus_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'campus_manager'));
CREATE TABLE public.attendance_reviews (
 attendance_id uuid PRIMARY KEY REFERENCES public.attendance(id),
 reviewer_id uuid NOT NULL DEFAULT auth.uid(),
 decision text NOT NULL CHECK (decision IN ('approved', 'flagged')),
 note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.attendance_reviews TO authenticated;
GRANT ALL ON public.attendance_reviews TO service_role;
ALTER TABLE public.attendance_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "manager reviews read" ON public.attendance_reviews FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'campus_manager'));
CREATE POLICY "manager reviews insert" ON public.attendance_reviews FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'campus_manager') AND reviewer_id = auth.uid());
CREATE POLICY "manager reviews update" ON public.attendance_reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'campus_manager')) WITH CHECK (public.has_role(auth.uid(), 'campus_manager') AND reviewer_id = auth.uid());