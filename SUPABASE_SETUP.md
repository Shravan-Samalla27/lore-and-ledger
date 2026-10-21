# Lore & Ledger — Supabase PostgreSQL Setup & Role-Based Auth Guide

This guide explains how to connect your **Supabase PostgreSQL** cloud database to the **Lore & Ledger** project, execute the role-based security migration, and provision accounts for **Students**, **Librarians**, and the **High Chancellor (Admin)**.

---

## 1. Step 1: Execute Initial Schema & Safe Seed (If Not Run Yet)

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left-hand navigation sidebar, click on the **SQL Editor** icon (`>_`).
3. Click **+ New Query** at the top.
4. Copy the entire contents of [`supabase/schema.sql`](file:///c:/lore-and-ledger/supabase/schema.sql), paste into the editor, and click **Run**.
5. This creates `books`, `scholars`, `loans`, and `library_settings` with the safe, non-duplicating seed data.

---

## 2. Step 2: Execute Role-Based Authentication & Security Migration

To enable separate login experiences and enforce database-level access control:

1. In the Supabase **SQL Editor** (`>_`), click **+ New Query**.
2. Open [`supabase/migrations/20261018_roles_and_auth.sql`](file:///c:/lore-and-ledger/supabase/migrations/20261018_roles_and_auth.sql).
3. Copy its entire content, paste into the editor, and click **Run**.
4. This migration applies:
   - `profiles` table linked to `auth.users` with `role` (`student`, `librarian`, `admin`) and `scholar_id`.
   - Hardened `SECURITY DEFINER` functions with fixed `search_path = public, pg_temp`.
   - Revocation of anonymous write policies on all library tables.
   - Least-privilege RLS policies restricting students to their personal loans and reserving circulation operations to staff.
   - Automatic signup trigger defaulting all new users to the `student` role.

---

## 3. Step 3: Configure Environment Variables

1. In your Supabase Dashboard, click on **Project Settings** (gear icon) -> **API**.
2. Copy your **Project URL** and your **Publishable Key** (or anon public key).
3. On your local machine, create or verify `.env.local` at the root of the project:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-actual-publishable-key-here
   ```

> [!CAUTION]
> Never commit `.env.local` to Git. It is already safely listed in `.gitignore`. Never use the `service_role` key in client code.

---

## 4. Step 4: Provisioning Accounts & First Administrator

### A. Assigning the First Administrator (High Chancellor)
Because public signup never permits selecting the `admin` role, you assign the first administrator safely via the Supabase Dashboard:

1. Sign up through the app at `/login/student` (or create a user in Supabase Dashboard -> **Authentication** -> **Users** -> **Add user**).
2. In the Supabase **SQL Editor**, run this single command using your administrator email:
   ```sql
   UPDATE public.profiles
   SET role = 'admin', full_name = 'High Chancellor'
   WHERE email = 'your-admin-email@institution.edu';
   ```
3. You can now log into `/login/admin` and access the **High Chancellor Console** (`/admin`) to manage staff roles directly from the interface.

### B. Appointing Librarians (Archivists)
Once an administrator is signed in, you can appoint staff:
- **Via the Admin Console**: Go to `/admin` and click **Librarian** next to any user.
- **Or via SQL**:
  ```sql
  UPDATE public.profiles
  SET role = 'librarian', full_name = 'Archivist Eleanor Vance'
  WHERE email = 'librarian@institution.edu';
  ```

### C. Linking Students to Existing Scholar Records
To link a student user account to their collegiate scholar folio:
- In the Admin Console (`/admin`), choose their scholar ID from the dropdown (e.g. `SCH-2023-412`).
- Or via SQL:
  ```sql
  UPDATE public.profiles
  SET scholar_id = 'SCH-2023-412'
  WHERE email = 'student@institution.edu';
  ```

---

## 5. Step 5: Role-Specific Login Routes & Strict Access Matrix

| Station / Role | Dedicated Login Route | Permitted Views & Portals | Restricted From |
| :--- | :--- | :--- | :--- |
| **Student** | `/login/student` | Reading Desk (`/student`), browse catalogue (`/books`), personal loans, due dates, caution deposit | Strictly denied from staff circulation desk (`/`, `/issue-book`, `/return-book`, `/students`, `/reports`, `/settings`) and Chancellor console (`/admin`) |
| **Librarian** | `/login/librarian` | Circulation Desk (`/`), Issue Folio (`/issue-book`), Return Folio (`/return-book`), Students Register (`/students`), Audit Reports (`/reports`), Statutes (`/settings`), browse catalogue (`/books`) | Strictly denied from Chancellor admin console (`/admin`) and Scholar Reading Desk (`/student`) |
| **Admin** | `/login/admin` | Full Administrative & Library Management: High Chancellor Console (`/admin`), Circulation Desk (`/`), Issue Folio (`/issue-book`), Return Folio (`/return-book`), Students Register (`/students`), Audit Reports (`/reports`), Statutes (`/settings`), browse catalogue (`/books`) | Strictly denied from Scholar Reading Desk (`/student`) |
| **Gateway** | `/login` | Station selection portal with antique seal cards | N/A |

---

## 6. Step 6: Preparing for Vercel Deployment

When deploying to Vercel:
1. Connect your GitHub repository to Vercel.
2. In the Vercel project creation screen, open **Environment Variables**.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy!
