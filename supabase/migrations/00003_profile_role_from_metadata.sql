-- Set profile role from auth.users.raw_user_meta_data on signup (for role selection on signup).
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
