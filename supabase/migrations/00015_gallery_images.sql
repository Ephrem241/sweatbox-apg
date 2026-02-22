-- Gallery images: public page shows these; admins manage.

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src text NOT NULL,
  alt text NOT NULL DEFAULT '',
  width integer,
  height integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gallery_images"
  ON public.gallery_images FOR SELECT USING (true);

CREATE POLICY "Admins can insert gallery_images"
  ON public.gallery_images FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update gallery_images"
  ON public.gallery_images FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete gallery_images"
  ON public.gallery_images FOR DELETE USING (public.is_admin());
