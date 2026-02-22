-- Storage buckets and RLS for profile-pics and workout-logs.
-- Path pattern: {user_id}/{filename}. Members can only access their own folder; admins can read all.
--
-- If bucket creation via SQL is not supported in your Supabase version, create the buckets
-- in Dashboard (Storage): "profile-pics" (public) and "workout-logs" (private).

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-pics', 'profile-pics', true),
  ('workout-logs', 'workout-logs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS on storage.objects: profile-pics
-- Members: SELECT, INSERT, UPDATE, DELETE only in own folder (first path segment = auth.uid())
CREATE POLICY "profile-pics: own folder access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'profile-pics'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-pics'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins: SELECT all in profile-pics (for support)
CREATE POLICY "profile-pics: admins read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'profile-pics'
    AND public.is_admin()
  );

-- RLS on storage.objects: workout-logs
-- Members: full access only in own folder
CREATE POLICY "workout-logs: own folder access"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'workout-logs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'workout-logs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins: SELECT all in workout-logs
CREATE POLICY "workout-logs: admins read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'workout-logs'
    AND public.is_admin()
  );
