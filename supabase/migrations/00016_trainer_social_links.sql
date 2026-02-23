-- Trainer social links (Instagram, Facebook, Twitter) for profile cards
ALTER TABLE public.trainer_profiles
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text;
