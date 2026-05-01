
-- Make user_id nullable for anonymous generations
ALTER TABLE public.generations ALTER COLUMN user_id DROP NOT NULL;

-- Allow anonymous inserts via service_role (handled by edge function)
-- Add policy for anon insert (will be done via edge function with service_role, so no RLS policy needed for anon)
