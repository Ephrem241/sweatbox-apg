-- Sample trainer profile
-- Prerequisite: At least one user must exist (sign up in the app or create in Supabase Auth).
-- How to run: Supabase Dashboard → SQL Editor → paste this file → Run.
-- This script: (1) sets the first profile to role 'trainer',
--             (2) inserts a public trainer_profiles row so /trainers shows a sample coach.

-- Option A: Use the first profile in the table (e.g. after you've signed up once)
DO $$
DECLARE
  pid uuid;
BEGIN
  SELECT id INTO pid FROM public.profiles LIMIT 1;
  IF pid IS NULL THEN
    RAISE NOTICE 'No profile found. Sign up a user in the app first, then run this seed again.';
    RETURN;
  END IF;

  UPDATE public.profiles SET role = 'trainer' WHERE id = pid;

  INSERT INTO public.trainer_profiles (profile_id, display_name, bio, image_url, specialties, sort_order)
  VALUES (
    pid,
    'Sample Coach',
    'CrossFit Level 1 trainer with a focus on strength and conditioning. I help members build consistency and reach their goals.',
    NULL,
    ARRAY['CrossFit', 'Strength', 'Conditioning'],
    0
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    bio = EXCLUDED.bio,
    image_url = EXCLUDED.image_url,
    specialties = EXCLUDED.specialties,
    sort_order = EXCLUDED.sort_order;

  RAISE NOTICE 'Sample trainer profile created for profile_id %', pid;
END $$;
