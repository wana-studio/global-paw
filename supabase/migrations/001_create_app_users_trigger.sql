-- Supabase Auth Integration: Auto-create app_users on signup
-- Run this in your Supabase SQL Editor or as a migration

-- Note: Since Payload manages the 'app_users' table via Drizzle,
-- the table uses SERIAL (auto-increment integer) for the 'id' column.
-- We let PostgreSQL handle the ID generation automatically.

-- Create trigger function to auto-insert app user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_users (
    supabase_id,
    email,
    selected_language,
    selected_theme,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id::text,      -- Supabase Auth user ID (UUID as text)
    NEW.email,
    'en',              -- Default language
    'system',          -- Default theme
    NOW(),
    NOW()
  )
  ON CONFLICT (supabase_id) DO NOTHING; -- Prevent duplicates
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Failed to create app_user for %: %', NEW.id, SQLERRM;
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
GRANT USAGE, SELECT ON SEQUENCE app_users_id_seq TO postgres, anon, authenticated, service_role;
