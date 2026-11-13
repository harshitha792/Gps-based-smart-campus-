ALTER TABLE public.profiles ADD COLUMN registration_number text;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_registration_length CHECK (registration_number IS NULL OR (char_length(btrim(registration_number)) BETWEEN 1 AND 50));
COMMENT ON COLUMN public.profiles.registration_number IS 'Self-declared student SRN, teacher registration number or staff ID; never an access credential or approval.';
CREATE OR REPLACE FUNCTION public.capture_profile_registration() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE submitted text;
BEGIN
  SELECT raw_user_meta_data->>'registration_number' INTO submitted FROM auth.users WHERE id = NEW.id;
  NEW.registration_number := NULLIF(left(btrim(submitted),50),'');
  RETURN NEW;
END;
$$;
CREATE TRIGGER capture_profile_registration BEFORE INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.capture_profile_registration();