-- Additional sample data: more classes (HIIT, Combat, Personal Training), extra plans.
-- Idempotent: ON CONFLICT DO NOTHING.

-- More plans (3-month, 6-month)
INSERT INTO public.plans (id, name, peak, duration_months, price_etb)
VALUES
  ('b2c3d4e5-0003-4000-8000-000000000003'::uuid, '3-Month Peak', true, 3, 6500),
  ('b2c3d4e5-0004-4000-8000-000000000004'::uuid, '6-Month Peak', true, 6, 12000)
ON CONFLICT (id) DO NOTHING;

-- More classes: Mon–Fri variety (day_of_week 1=Mon .. 7=Sun)
INSERT INTO public.classes (id, name, day_of_week, start_time)
VALUES
  ('c3d4e5f6-0003-4000-8000-000000000003'::uuid, 'HIIT Morning', 1, '07:00'),
  ('c3d4e5f6-0004-4000-8000-000000000004'::uuid, 'CrossFit AM', 2, '06:00'),
  ('c3d4e5f6-0005-4000-8000-000000000005'::uuid, 'CrossFit PM', 2, '17:30'),
  ('c3d4e5f6-0006-4000-8000-000000000006'::uuid, 'Combat', 3, '18:00'),
  ('c3d4e5f6-0007-4000-8000-000000000007'::uuid, 'HIIT Evening', 3, '19:00'),
  ('c3d4e5f6-0008-4000-8000-000000000008'::uuid, 'CrossFit AM', 4, '06:00'),
  ('c3d4e5f6-0009-4000-8000-000000000009'::uuid, 'Personal Training Slot', 4, '10:00'),
  ('c3d4e5f6-000a-4000-8000-00000000000a'::uuid, 'CrossFit PM', 4, '17:00'),
  ('c3d4e5f6-000b-4000-8000-00000000000b'::uuid, 'CrossFit AM', 5, '06:00'),
  ('c3d4e5f6-000c-4000-8000-00000000000c'::uuid, 'Open Gym', 5, '08:00'),
  ('c3d4e5f6-000d-4000-8000-00000000000d'::uuid, 'CrossFit Saturday', 6, '09:00'),
  ('c3d4e5f6-000e-4000-8000-00000000000e'::uuid, 'HIIT Saturday', 6, '10:30')
ON CONFLICT (id) DO NOTHING;
