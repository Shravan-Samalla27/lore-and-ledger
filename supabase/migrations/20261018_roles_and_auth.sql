-- ==============================================================================
-- Lore & Ledger Migration: Role-Based Authentication, Profiles & RLS Security
-- Migration Version: 20261018_roles_and_auth
-- ==============================================================================

-- 1. PROFILES & ROLE MAPPING TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('admin', 'librarian', 'student')) DEFAULT 'student',
  scholar_id TEXT REFERENCES public.scholars(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on role and scholar_id for fast access-control lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_scholar_id ON public.profiles(scholar_id);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. HARDENED SECURITY DEFINER HELPER FUNCTIONS
-- Explicit search_path prevents search_path hijacking
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_scholar_id()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT scholar_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Restrict function execution permissions to authenticated users only
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_scholar_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_scholar_id() TO authenticated;

-- 3. AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- Default role is ALWAYS 'student'. Never permits self-assignment of staff roles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, scholar_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'student', -- Enforce student default
    NULL       -- scholar_id must be assigned through verification by librarian or admin
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 4. REVOKE ANONYMOUS WRITE POLICIES ON LIBRARY TABLES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can insert books" ON public.books;
DROP POLICY IF EXISTS "Public can update books" ON public.books;
DROP POLICY IF EXISTS "Public can insert scholars" ON public.scholars;
DROP POLICY IF EXISTS "Public can update scholars" ON public.scholars;
DROP POLICY IF EXISTS "Public can insert loans" ON public.loans;
DROP POLICY IF EXISTS "Public can update loans" ON public.loans;
DROP POLICY IF EXISTS "Public can update settings" ON public.library_settings;
DROP POLICY IF EXISTS "Public can insert settings" ON public.library_settings;

-- ==============================================================================
-- 5. LEAST-PRIVILEGE ROLE-BASED POLICIES
-- ==============================================================================

-- BOOKS POLICIES
-- Read: Open to all authenticated users (students, librarians, admins)
DROP POLICY IF EXISTS "Public can view books" ON public.books;
DROP POLICY IF EXISTS "Authenticated can view books" ON public.books;
CREATE POLICY "Authenticated can view books" ON public.books
  FOR SELECT TO authenticated USING (true);

-- Create/Edit: Only Librarian or Admin
DROP POLICY IF EXISTS "Staff can insert books" ON public.books;
CREATE POLICY "Staff can insert books" ON public.books
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('librarian', 'admin'));

DROP POLICY IF EXISTS "Staff can update books" ON public.books;
CREATE POLICY "Staff can update books" ON public.books
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('librarian', 'admin'));

-- Delete: Only Admin
DROP POLICY IF EXISTS "Admin can delete books" ON public.books;
CREATE POLICY "Admin can delete books" ON public.books
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');


-- SCHOLARS POLICIES
-- Read: Staff can view all scholars; Students can only view their own linked scholar record
DROP POLICY IF EXISTS "Public can view scholars" ON public.scholars;
DROP POLICY IF EXISTS "Role based scholars view" ON public.scholars;
CREATE POLICY "Role based scholars view" ON public.scholars
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('librarian', 'admin')
    OR id = public.get_user_scholar_id()
  );

-- Create/Edit: Only Librarian or Admin
DROP POLICY IF EXISTS "Staff can insert scholars" ON public.scholars;
CREATE POLICY "Staff can insert scholars" ON public.scholars
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('librarian', 'admin'));

DROP POLICY IF EXISTS "Staff can update scholars" ON public.scholars;
CREATE POLICY "Staff can update scholars" ON public.scholars
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('librarian', 'admin'));

-- Delete: Only Admin
DROP POLICY IF EXISTS "Admin can delete scholars" ON public.scholars;
CREATE POLICY "Admin can delete scholars" ON public.scholars
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');


-- LOANS POLICIES
-- Read: Staff can view all circulation movement; Students can ONLY view their personal loans
DROP POLICY IF EXISTS "Public can view loans" ON public.loans;
DROP POLICY IF EXISTS "Role based loans view" ON public.loans;
CREATE POLICY "Role based loans view" ON public.loans
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() IN ('librarian', 'admin')
    OR scholar_id = public.get_user_scholar_id()
  );

-- Create/Edit (Lend/Return): Only Librarian or Admin
DROP POLICY IF EXISTS "Staff can insert loans" ON public.loans;
CREATE POLICY "Staff can insert loans" ON public.loans
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('librarian', 'admin'));

DROP POLICY IF EXISTS "Staff can update loans" ON public.loans;
CREATE POLICY "Staff can update loans" ON public.loans
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('librarian', 'admin'));

-- Delete: Only Admin
DROP POLICY IF EXISTS "Admin can delete loans" ON public.loans;
CREATE POLICY "Admin can delete loans" ON public.loans
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');


-- LIBRARY SETTINGS POLICIES
DROP POLICY IF EXISTS "Public can view settings" ON public.library_settings;
DROP POLICY IF EXISTS "Authenticated can view settings" ON public.library_settings;
CREATE POLICY "Authenticated can view settings" ON public.library_settings
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff can update settings" ON public.library_settings;
CREATE POLICY "Staff can update settings" ON public.library_settings
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('librarian', 'admin'));


-- PROFILES POLICIES
-- Read: Users can view their own profile; Staff can view all profiles
DROP POLICY IF EXISTS "View profiles policy" ON public.profiles;
CREATE POLICY "View profiles policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid() OR public.get_user_role() IN ('admin', 'librarian')
  );

-- Update: Users can update their own name only; Admins can update roles and assign scholar_ids
DROP POLICY IF EXISTS "Update profiles policy" ON public.profiles;
CREATE POLICY "Update profiles policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    id = auth.uid() OR public.get_user_role() = 'admin'
  )
  WITH CHECK (
    CASE
      -- Admins can update any field including role and scholar_id
      WHEN public.get_user_role() = 'admin' THEN true
      -- Regular users can only update their own profile AND cannot alter their role or scholar_id
      WHEN id = auth.uid() THEN (
        role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
        AND scholar_id IS NOT DISTINCT FROM (SELECT p.scholar_id FROM public.profiles p WHERE p.id = auth.uid())
      )
      ELSE false
    END
  );

-- ==============================================================================
-- 6. FIRST-ADMIN & STAFF PROVISIONING INSTRUCTIONS
-- ==============================================================================
/*
  SAFE FIRST ADMINISTRATOR ASSIGNMENT:
  1. Have the administrator sign up via the app or create the user in the Supabase Dashboard -> Authentication.
  2. Run the following single command in the Supabase SQL Editor, replacing with the administrator's email:

     UPDATE public.profiles
     SET role = 'admin', full_name = 'High Chancellor'
     WHERE email = 'admin@yourinstitution.edu';

  3. Once an admin exists, they can manage staff directly via the /admin management console or promote librarians via SQL:

     UPDATE public.profiles
     SET role = 'librarian', full_name = 'Archivist Eleanor Vance'
     WHERE email = 'librarian@yourinstitution.edu';

  4. To link a student account to an existing scholar record:

     UPDATE public.profiles
     SET scholar_id = 'SCH-2023-412'
     WHERE email = 'student@yourinstitution.edu';
*/
