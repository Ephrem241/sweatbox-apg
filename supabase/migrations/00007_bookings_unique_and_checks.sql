-- Prevent duplicate bookings: one booking per user per class per date.
CREATE UNIQUE INDEX IF NOT EXISTS bookings_user_class_date_key
  ON public.bookings (user_id, class_id, booked_date);
