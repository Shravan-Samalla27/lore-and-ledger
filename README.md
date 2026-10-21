# Lore & Ledger — Electronic Book Tracking System

> *"Where every book has a story."*

**Lore & Ledger** is an evocative electronic book tracking and circulation management system that blends the aesthetic charm of an antique collegiate archive with the speed and reliability of a modern web application. Built with Next.js App Router, TypeScript, and Supabase PostgreSQL, it provides role-based workspaces for **Students**, **Librarians**, and the **High Chancellor (Admin)**.

---

## 🏛️ Project Overview

Traditional library software can feel sterile and detached. Lore & Ledger reimagines circulation registers as digital archival ledgers—complete with collegiate typography, call numbers, Dewey decimal classifications, bindery condition assessments, and quill-and-seal motifs.

Beneath its antique scriptorium aesthetic lies a hardened, production-grade application featuring Row Level Security (RLS), strict role-based authentication, fail-closed route guards, and real-time database synchronization.

---

## ✨ Implemented Features

### 1. Multi-Station Role-Based Portals
* **Matriculated Scholar (Student) Portal** (`/login/student` & `/student`):
  * Personal Reading Desk displaying active book loans and past returns.
  * Real-time return deadlines, overdue day counters, and fine calculations.
  * Caution deposit balance and account status summary.
  * Direct catalogue consultation for available library folios.
* **Scriptorium Archivist (Librarian) Portal** (`/login/librarian`):
  * **Circulation Dashboard** (`/`): Real-time metrics on total volumes, active loans, overdue accounts, and caution funds.
  * **Volume Catalogue** (`/books`): Live instant search across Dewey decimal, title, author, and shelf locations.
  * **Lending Desk** (`/issue-book`): Issue books to scholars with customizable loan periods and validation.
  * **Intake & Quittance** (`/return-book`): Return books with binding condition grading, damage repair fees, and fine collection.
  * **Scholar Registry** (`/students`): Collegiate student register with borrowing status and caution balances.
  * **Audit Reports** (`/reports`): Circulation analytics, fine revenue breakdowns, and recent transactions.
  * **Statutes & Tariffs** (`/settings`): Configure active term names, daily fine tariffs, and bindery repair levies.
  * *Strictly denied from administrative governance (`/admin`).*
* **High Chancellor (Admin) Console** (`/login/admin` & `/admin`):
  * Full administrative governance and staff appointment.
  * Elevate student accounts to librarians or chancellors.
  * Link user accounts to scholar registry records (`scholar_id`).
  * Full access to all librarian circulation tools.

### 2. Security & Access Control
* **Fail-Closed RoleGuard**: Client-side route protection that redirects unauthorized accounts away from restricted portals and prevents unauthorized UI renders during auth transitions.
* **Database Row Level Security (RLS)**: Enforced directly in PostgreSQL via Supabase.
  * Only admins can inspect all user profiles and promote staff.
  * Students and librarians can only query their own profile record.
  * Trigger-based field immutability (`protect_profile_fields`) prevents users from modifying their own roles or scholar links.
  * Recursion-free RLS policies prevent circular query deadlocks.
* **Local Standby Mode**: If Supabase credentials are not configured, the application functions seamlessly in an offline local registry demo mode.

### 3. Archive Experience
* Collegiate typography featuring **EB Garamond**, **Literata**, and **Courier Prime**.
* Dynamic search bar with instant dropdown previews.
* Modal dialogue for accessioning new manuscripts into the catalog.
* Toast notification dispatch for actions and status changes.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) 5 |
| **UI & Styling** | [React](https://react.dev/) 19, [Tailwind CSS](https://tailwindcss.com/) 4 |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth) |
| **Typography** | Google Fonts (*EB Garamond*, *Literata*, *Courier Prime*) |
| **Icons** | Google Material Symbols Outlined |

---

## 📋 Prerequisites

Before installing, ensure your environment meets the following requirements:

* **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
* **npm**: `v9.0.0` or higher (bundled with Node.js)
* **Git**: Installed and configured
* *(Optional)* A free [Supabase](https://supabase.com/) account for database synchronization

---

## 🚀 Local Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Shravan-Samalla27/lore-and-ledger.git
cd lore-and-ledger
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment configuration to create your local `.env.local` file:

```bash
cp .env.example .env.local
```

Open `.env.local` and provide your Supabase project credentials (available in your Supabase Dashboard under **Project Settings** &rarr; **API**):

```env
# Project URL (e.g., https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Project Publishable Key (safe for client-side queries protected by RLS)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
```

> [!NOTE]
> If you do not configure `.env.local`, Lore & Ledger will automatically run in **Local Standby Mode** using in-memory mock data so you can test the UI immediately.

### 4. Database Setup (Optional for Cloud Sync)
To connect your Supabase database:
1. Open your Supabase project's **SQL Editor**.
2. Run [`supabase/schema.sql`](file:///c:/lore-and-ledger/supabase/schema.sql) to create tables (`books`, `scholars`, `loans`, `library_settings`) and seed demo records.
3. Run [`supabase/migrations/20261018_roles_and_auth.sql`](file:///c:/lore-and-ledger/supabase/migrations/20261018_roles_and_auth.sql) to enable role-based authentication and RLS security.
4. Run [`supabase/migrations/20261021_strict_admin_role_enforcement.sql`](file:///c:/lore-and-ledger/supabase/migrations/20261021_strict_admin_role_enforcement.sql) to apply the strict admin-only profile policies and recursion-free triggers.
5. Refer to [`SUPABASE_SETUP.md`](file:///c:/lore-and-ledger/SUPABASE_SETUP.md) for full account provisioning steps.

---

## 💻 Available Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the local development server at `http://localhost:3000` |
| `npm test` | Runs the automated role authentication and RLS security test suite |
| `npm run build` | Compiles an optimized production build using Next.js & Turbopack |
| `npm start` | Runs the compiled production build locally |
| `npm run lint` | Runs ESLint to check for code quality and style guidelines |

---

## 🛡️ Role Access Matrix

| Route | Purpose | Scholar (Student) | Archivist (Librarian) | High Chancellor (Admin) |
| :--- | :--- | :---: | :---: | :---: |
| `/login` | Station selection gateway | Accessible | Accessible | Accessible |
| `/login/student` | Student matriculation & login | **Authorized** | Denied | Denied |
| `/login/librarian` | Staff circulation login | Denied | **Authorized** | **Authorized** |
| `/login/admin` | High Chancellor governance login | Denied | Denied | **Authorized** |
| `/student` | Scholar personal reading desk | **Authorized** | Denied | Denied |
| `/` | Circulation desk dashboard | Denied | **Authorized** | **Authorized** |
| `/books` | Stacks catalogue & live search | Accessible (Catalogue) | **Authorized** (Full) | **Authorized** (Full) |
| `/issue-book` | Folio lending desk | Denied | **Authorized** | **Authorized** |
| `/return-book` | Intake & fine settlement | Denied | **Authorized** | **Authorized** |
| `/students` | Scholar matriculation registry | Denied | **Authorized** | **Authorized** |
| `/reports` | Circulation & revenue audits | Denied | **Authorized** | **Authorized** |
| `/settings` | Term tariffs & statutes | Denied | **Authorized** | **Authorized** |
| `/admin` | Chancellor governance console | **Denied** | **Denied** | **Authorized** |

---

## 🌐 Deploy on Vercel

1. Push your repository to your GitHub account.
2. Visit [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your `lore-and-ledger` repository.
4. In the **Environment Variables** section, add:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
5. Click **Deploy**. Vercel will build and serve your application globally.

---

## 📜 License & Credits

* Built with collegiate pride for archive and library enthusiasts.
* UI & Archival Design System inspired by the Bodleian Library and antique Oxford registers.
