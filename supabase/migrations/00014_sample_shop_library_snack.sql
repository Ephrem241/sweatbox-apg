-- Sample data for Pro-Shop, Video Library, and Snack Bar (for demo/testing).
-- Safe to run: uses ON CONFLICT so re-running won't duplicate.

-- Pro-Shop: sample products (gear, equipment, supplements)
INSERT INTO public.products (name, slug, description, price_etb, category, image_url, stock)
VALUES
  ('Sweatbox Logo Tee', 'sweatbox-logo-tee', 'Official Sweatbox APG cotton tee. Unisex fit.', 850, 'gear', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', 50),
  ('Training Shorts', 'training-shorts', 'Lightweight shorts for WODs and running.', 1200, 'gear', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&q=80', 30),
  ('Olympic Barbell 20kg', 'olympic-barbell-20kg', 'Standard 20kg Olympic barbell, 28mm grip.', 18500, 'equipment', 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=600&q=80', 5),
  ('Kettlebell 16kg', 'kettlebell-16kg', 'Cast iron kettlebell 16kg. Single.', 4500, 'equipment', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80', 12),
  ('Jump Rope', 'jump-rope', 'Speed jump rope, adjustable length.', 650, 'equipment', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80', 40),
  ('Whey Protein 1kg', 'whey-protein-1kg', 'Whey protein isolate, 1kg. Chocolate.', 2200, 'supplements', 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&q=80', 25),
  ('BCAA 300g', 'bcaa-300g', 'Branch chain amino acids, 300g. Mixed berry.', 950, 'supplements', NULL, 20)
ON CONFLICT (slug) DO NOTHING;

-- Video Library: sample workout videos (insert only when table is empty; replace video_url with real embed)
INSERT INTO public.workout_videos (title, description, thumbnail_url, video_url, duration_sec, tags, sort_order)
SELECT title, description, thumbnail_url, video_url, duration_sec, tags, sort_order
FROM (VALUES
  ('AMRAP 20: Burpees & Run'::text, '20 min AMRAP: 5 burpees, 200m run. Scale as needed.'::text, 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80'::text, 'https://www.youtube.com/watch?v=ml6cT4AZdqI'::text, 1200, ARRAY['AMRAP', 'cardio', 'beginner'], 1),
  ('Strength: Back Squat 5x5', 'Back squat 5 sets of 5. Build to heavy.', 'https://images.unsplash.com/photo-1534368959876-26bf04f2c947?w=800&q=80', 'https://www.youtube.com/watch?v=ultWZbUMPL8', 1800, ARRAY['strength', 'squat'], 2),
  ('EMOM 15: Kettlebell Swings', 'Every minute on the minute: 15 KB swings. Pick your weight.', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80', 'https://www.youtube.com/watch?v=ultWZbUMPL8', 900, ARRAY['EMOM', 'kettlebell', 'cardio'], 3),
  ('Mobility & Stretch', '15 min full-body mobility and cooldown.', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80', 'https://www.youtube.com/watch?v=ultWZbUMPL8', 900, ARRAY['mobility', 'recovery'], 4)
) AS v(title, description, thumbnail_url, video_url, duration_sec, tags, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.workout_videos LIMIT 1);

-- Snack Bar: sample items (no unique key on name, so we insert once; use name+price as loose guard)
INSERT INTO public.snack_items (name, description, price_etb, image_url, available, sort_order)
SELECT * FROM (VALUES
  ('Fresh Orange Juice', 'Freshly squeezed orange juice.', 80, NULL, true, 1),
  ('Green Smoothie', 'Spinach, banana, mango, lime.', 120, NULL, true, 2),
  ('Protein Shake', 'Whey protein shake, chocolate or vanilla.', 150, NULL, true, 3),
  ('Energy Bar', 'Oats, nuts, honey. One bar.', 60, NULL, true, 4),
  ('Banana', 'One banana.', 15, NULL, true, 5),
  ('Water 500ml', 'Bottled water 500ml.', 25, NULL, true, 6)
) AS v(name, description, price_etb, image_url, available, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.snack_items LIMIT 1);
