-- Seed data for Sweatbox: Addis Ababa locations (Sarbet, Bole, Summit), sample plans, classes.
-- Idempotent: safe to run multiple times. Replace placeholder user IDs for memberships/bookings after first sign-up.

-- Addis locations (match app copy: locations page + messages/en.json)
INSERT INTO public.locations (name, slug, address, phone, maps_query)
VALUES
  ('Sarbet (Old Airport)', 'sarbet', 'Old Airport area, Addis Ababa', '+251 11 XXX XXXX', 'Sarbet Old Airport Addis Ababa'),
  ('Bole (Atlas)', 'bole', 'Bole Atlas, Addis Ababa', '+251 11 XXX XXXX', 'Bole Atlas Addis Ababa'),
  ('Summit', 'summit', 'Summit area, Addis Ababa', '+251 11 XXX XXXX', 'Summit Addis Ababa')
ON CONFLICT (slug) DO NOTHING;

-- Sample plans (Monthly Peak, Off-Peak). Idempotent by fixed ids.
INSERT INTO public.plans (id, name, peak, duration_months, price_etb)
VALUES
  ('b2c3d4e5-0001-4000-8000-000000000001'::uuid, 'Monthly Peak', true, 1, 2500),
  ('b2c3d4e5-0002-4000-8000-000000000002'::uuid, 'Monthly Off-Peak', false, 1, 1800)
ON CONFLICT (id) DO NOTHING;

-- Sample classes
INSERT INTO public.classes (id, name, day_of_week, start_time)
VALUES
  ('c3d4e5f6-0001-4000-8000-000000000001'::uuid, 'CrossFit AM', 1, '06:00'),
  ('c3d4e5f6-0002-4000-8000-000000000002'::uuid, 'CrossFit PM', 1, '17:00')
ON CONFLICT (id) DO NOTHING;

-- Optional: sample memberships and bookings require real auth.users ids.
-- After first user sign-up, run for example:
--   INSERT INTO public.memberships (user_id, plan_id, status, end_date)
--   SELECT '<user-uuid>', id, 'active', (CURRENT_DATE + (duration_months || ' months')::interval)::date
--   FROM public.plans WHERE name = 'Monthly Peak' LIMIT 1;
--   INSERT INTO public.bookings (user_id, class_id, location_id, booked_date, status)
--   VALUES ('<user-uuid>', (SELECT id FROM public.classes LIMIT 1), (SELECT id FROM public.locations WHERE slug = 'sarbet'), CURRENT_DATE, 'confirmed');
