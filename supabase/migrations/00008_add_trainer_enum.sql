-- Add trainer to user_role enum. Must run in its own migration so the new value
-- is committed before any function or policy uses it (PostgreSQL 55P04).
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'trainer';
