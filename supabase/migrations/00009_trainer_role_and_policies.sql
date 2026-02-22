-- Trainer role and policies (enum value added in 00008_add_trainer_enum.sql).
-- Optional: link classes to a trainer (for "my classes" filtering later)
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS trainer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Set profile role to trainer when signup metadata has role = 'trainer'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  role_val user_role;
BEGIN
  role_val := CASE
    WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
    WHEN NEW.raw_user_meta_data->>'role' = 'trainer' THEN 'trainer'::user_role
    ELSE 'member'::user_role
  END;
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    role_val
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    role = role_val;
  RETURN NEW;
END;
$$;

-- Helper: true if current user is trainer
CREATE OR REPLACE FUNCTION public.is_trainer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'trainer'
  );
$$;

-- Trainers can read all classes (to show today's schedule)
CREATE POLICY "Trainers can read classes"
  ON public.classes FOR SELECT
  USING (public.is_trainer());

-- Trainers can read all check_ins (to see who checked in)
CREATE POLICY "Trainers can read check_ins"
  ON public.check_ins FOR SELECT
  USING (public.is_trainer());

-- Trainers can insert check_ins (to record member check-in)
CREATE POLICY "Trainers can insert check_ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (public.is_trainer());
