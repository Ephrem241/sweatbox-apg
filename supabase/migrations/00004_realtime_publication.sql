-- Enable Realtime for bookings and memberships so admins can subscribe to new signups and class bookings.
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.memberships;
