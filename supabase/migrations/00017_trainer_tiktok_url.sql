-- Add TikTok URL to trainer profiles
ALTER TABLE public.trainer_profiles
  ADD COLUMN IF NOT EXISTS tiktok_url text;
