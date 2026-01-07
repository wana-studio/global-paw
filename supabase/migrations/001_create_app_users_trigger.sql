-- Supabase Auth Integration: Auto-create app_users on signup
-- Run this in your Supabase SQL Editor or as a migration

-- Note: Since Payload manages the 'app_users' table via Drizzle,
-- we create a trigger that inserts into Payload's table.
-- The table name follows Payload's naming convention.

-- Create trigger function to auto-insert app user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_users (
    id,
    supabase_id,
    email,
    selected_language,
    selected_theme,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(), -- Payload uses its own ID
    NEW.id,            -- Supabase Auth user ID
    NEW.email,
    'en',              -- Default language
    'system',          -- Default theme
    NOW(),
    NOW()
  )
  ON CONFLICT (supabase_id) DO NOTHING; -- Prevent duplicates
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.app_users TO postgres, anon, authenticated, service_role;
