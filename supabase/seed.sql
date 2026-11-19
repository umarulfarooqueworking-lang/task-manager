-- ==============================================================================
-- TaskFlow Seed Data (Optional for testing)
-- ==============================================================================
-- You can run this in the Supabase SQL Editor to verify tables or create test users.
-- Note: When creating users through the TaskFlow Admin UI (/admin/users),
-- users are created automatically in auth.users and profiles.

-- If you want to create an initial Admin directly in Supabase SQL editor:
-- 1. Create a user via Supabase Dashboard -> Authentication -> Users -> "Add User"
--    (e.g., admin@taskflow.dev with password)
-- 2. Then update or insert their profile record with role 'admin':

-- UPDATE public.profiles
-- SET role = 'admin', full_name = 'System Administrator'
-- WHERE email = 'admin@taskflow.dev';

-- Or verify RLS functions:
select * from public.profiles limit 5;
select * from public.tasks limit 5;
