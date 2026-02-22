-- Trainer profiles: public display data for coach cards (name, photo, specialties).
-- Only profiles with role = 'trainer' should have a row; trainers and admins can manage.

CREATE TABLE public.trainer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text,
  image_url text,
  specialties text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Note: "profile must be trainer" is enforced by RLS (only trainer or admin can insert/update).

-- RLS: anyone can read (public trainers page)
ALTER TABLE public.trainer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trainer_profiles"
  ON public.trainer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Trainers can insert own trainer_profile"
  ON public.trainer_profiles FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Trainers can update own trainer_profile"
  ON public.trainer_profiles FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Trainers can delete own trainer_profile"
  ON public.trainer_profiles FOR DELETE
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can insert trainer_profiles"
  ON public.trainer_profiles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update trainer_profiles"
  ON public.trainer_profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete trainer_profiles"
  ON public.trainer_profiles FOR DELETE
  USING (public.is_admin());
