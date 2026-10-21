-- ==============================================================================
-- LORE & LEDGER: STRICT ADMIN CONSOLE & PROFILES RLS ENFORCEMENT
-- Migration: 20261021_strict_admin_role_enforcement.sql
-- Description:
--   1. Eliminates self-referencing RLS policy subqueries (preventing infinite recursion).
--   2. Ensures only verified admins can view all profiles; librarians and students
--      can only read their own profile row (id = auth.uid()).
--   3. Prevents privilege escalation by forbidding non-admins from altering role
--      or scholar_id via a safe BEFORE UPDATE trigger (using in-memory OLD vs NEW).
--   4. Preserves legitimate user profile editing (e.g. full_name) and full admin features.
--   5. Cleanses any legacy, permissive, or duplicate policies on public.profiles.
-- ==============================================================================

-- 1. Ensure RLS is active on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Hardened Helper Functions (SECURITY DEFINER with safe fixed search_path)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Drop all existing, legacy, or overly permissive policies on public.profiles
DROP POLICY IF EXISTS "View profiles policy" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Update profiles policy" ON public.profiles;
DROP POLICY IF EXISTS "Staff can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- 4. Create Strict, Recursion-Free SELECT Policy
--    - Regular users, librarians, and students can ONLY read their own profile row.
--    - High Chancellors (admins) can read all profiles for university governance.
--    - Short-circuits on `id = auth.uid()` so own-profile queries never call subqueries.
CREATE POLICY "View profiles policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR public.get_user_role() = 'admin'
  );

-- 5. Create Strict, Recursion-Free UPDATE Policy
--    - Users can update their own row; Admins can update any user row.
--    - Does NOT contain recursive subqueries like `(SELECT role FROM profiles WHERE id = auth.uid())`.
CREATE POLICY "Update profiles policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR public.get_user_role() = 'admin'
  )
  WITH CHECK (
    id = auth.uid() OR public.get_user_role() = 'admin'
  );

-- 6. Trigger-Based Field Immutability (Zero RLS Recursion)
--    - Compares transition records (OLD vs NEW) entirely in-memory.
--    - Non-admins are strictly forbidden from changing `role` or `scholar_id`.
--    - Legitimate profile updates (e.g. `full_name`) pass through smoothly.
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- If updater is not an admin, block any alteration of role or scholar_id
  IF public.get_user_role() IS DISTINCT FROM 'admin' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Security Violation: Only High Chancellors (admins) may alter station roles.';
    END IF;
    IF NEW.scholar_id IS DISTINCT FROM OLD.scholar_id THEN
      RAISE EXCEPTION 'Security Violation: Only High Chancellors (admins) may link scholar folios.';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();
