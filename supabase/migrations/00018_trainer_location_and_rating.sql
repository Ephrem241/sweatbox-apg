-- Trainer branch (location) and rating support
ALTER TABLE public.trainer_profiles
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS average_rating numeric(3,2),
  ADD COLUMN IF NOT EXISTS rating_count integer NOT NULL DEFAULT 0;

-- One rating per user per trainer (1-5)
CREATE TABLE IF NOT EXISTS public.trainer_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_profile_id uuid NOT NULL REFERENCES public.trainer_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trainer_profile_id, user_id)
);

ALTER TABLE public.trainer_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read trainer_ratings"
  ON public.trainer_ratings FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert own rating"
  ON public.trainer_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rating"
  ON public.trainer_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rating"
  ON public.trainer_ratings FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_trainer_ratings_trainer_profile_id
  ON public.trainer_ratings (trainer_profile_id);
