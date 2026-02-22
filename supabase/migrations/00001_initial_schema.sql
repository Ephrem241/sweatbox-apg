-- Sweatbox initial schema: user roles, profiles, locations, plans, classes,
-- memberships (subscriptions view), bookings, check_ins. RLS for members (own data) and admins (all).
-- First admin: set manually with UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- Enum for user role
CREATE TYPE user_role AS ENUM ('member', 'admin');

-- Profiles: extends auth.users. Create if not exists (e.g. fresh project); otherwise only add role.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  role user_role NOT NULL DEFAULT 'member'
);

-- Add role column if profiles already existed without it (e.g. from Supabase dashboard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role user_role NOT NULL DEFAULT 'member';
  END IF;
END $$;

-- Trigger: create profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    'member'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Locations (Addis branches)
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  address text,
  phone text,
  maps_query text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Plans (subscription plans)
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  peak boolean NOT NULL DEFAULT true,
  duration_months integer NOT NULL,
  price_etb numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Classes (schedule)
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  start_time text NOT NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL
);

-- Memberships (source of truth; exposed as subscriptions view for app compatibility)
CREATE TABLE public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_memberships_user_end ON public.memberships (user_id, end_date DESC);

-- View for backward compatibility: app uses "subscriptions" (dashboard, schedule, webhook)
CREATE VIEW public.subscriptions AS
SELECT id, user_id, plan_id, status, end_date, created_at
FROM public.memberships;

-- INSTEAD OF triggers so INSERT/UPDATE/DELETE on subscriptions go to memberships
CREATE OR REPLACE FUNCTION public.subscriptions_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.memberships (user_id, plan_id, status, start_date, end_date)
  VALUES (
    NEW.user_id,
    NEW.plan_id,
    COALESCE(NEW.status, 'active'),
    CURRENT_DATE,
    NEW.end_date
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.subscriptions_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.memberships
  SET user_id = NEW.user_id, plan_id = NEW.plan_id, status = NEW.status, end_date = NEW.end_date
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.subscriptions_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM public.memberships WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS subscriptions_insert_trigger ON public.subscriptions;
CREATE TRIGGER subscriptions_insert_trigger
  INSTEAD OF INSERT ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.subscriptions_insert();

DROP TRIGGER IF EXISTS subscriptions_update_trigger ON public.subscriptions;
CREATE TRIGGER subscriptions_update_trigger
  INSTEAD OF UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.subscriptions_update();

DROP TRIGGER IF EXISTS subscriptions_delete_trigger ON public.subscriptions;
CREATE TRIGGER subscriptions_delete_trigger
  INSTEAD OF DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.subscriptions_delete();

-- Bookings (class/slot bookings)
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  booked_date date NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Check-ins (admin counts by class_id)
CREATE TABLE public.check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  checked_in_at timestamptz NOT NULL DEFAULT now()
);

-- Helper: true if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- RLS: memberships
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own memberships"
  ON public.memberships FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all memberships"
  ON public.memberships FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert memberships"
  ON public.memberships FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update memberships"
  ON public.memberships FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete memberships"
  ON public.memberships FOR DELETE
  USING (public.is_admin());

-- Service role (webhook) bypasses RLS; no policy needed for anon insert.
-- Webhook uses service role client, so INSERT into subscriptions (-> memberships) works.

-- RLS: bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own bookings"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Members can insert own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update own bookings"
  ON public.bookings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  USING (public.is_admin());

-- RLS: check_ins (admin write; members read own)
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own check_ins"
  ON public.check_ins FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all check_ins"
  ON public.check_ins FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert check_ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete check_ins"
  ON public.check_ins FOR DELETE
  USING (public.is_admin());

-- Public read for classes, plans, locations (server-side only; anon key can read if we allow)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read classes"
  ON public.classes FOR SELECT USING (true);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read plans"
  ON public.plans FOR SELECT USING (true);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read locations"
  ON public.locations FOR SELECT USING (true);
