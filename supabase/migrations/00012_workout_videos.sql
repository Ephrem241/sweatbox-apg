-- On-demand workout video library. Access gated by active membership in app.

CREATE TABLE public.workout_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  video_url text NOT NULL,
  duration_sec integer,
  tags text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Anyone can read (app will gate by membership when rendering/playing)
ALTER TABLE public.workout_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read workout_videos"
  ON public.workout_videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage workout_videos"
  ON public.workout_videos FOR ALL USING (public.is_admin());
