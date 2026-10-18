-- ==============================================================================
-- Lore & Ledger: Archival Library Register & Scriptorium Database Schema
-- Compatible with PostgreSQL / Supabase
-- ==============================================================================

-- 1. BOOKS (Master Card Catalogue & Folio Registry)
CREATE TABLE IF NOT EXISTS books (
  call_no TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  edition TEXT NOT NULL DEFAULT 'First Edition, 1888',
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  dewey TEXT NOT NULL DEFAULT '',
  total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 1),
  available_copies INTEGER NOT NULL DEFAULT 1 CHECK (available_copies >= 0 AND available_copies <= total_copies),
  shelf TEXT NOT NULL DEFAULT 'General Stacks',
  wing TEXT NOT NULL DEFAULT 'North Gallery',
  binding TEXT NOT NULL DEFAULT 'Calfskin',
  status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'CIRCULATING', 'RESERVED', 'RESTOCKING')) DEFAULT 'AVAILABLE',
  notes TEXT DEFAULT '',
  conservation_rating TEXT NOT NULL CHECK (conservation_rating IN ('Pristine', 'Good', 'Moderate Wear', 'Fragile Codex')) DEFAULT 'Good',
  accession_no TEXT UNIQUE NOT NULL,
  year INTEGER DEFAULT 1888,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for searching and filtering books
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_books_wing ON books(wing);

-- 2. SCHOLARS (Matriculated Scholars & Readers Register)
CREATE TABLE IF NOT EXISTS scholars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  faculty TEXT NOT NULL,
  college TEXT NOT NULL,
  standing TEXT NOT NULL CHECK (standing IN ('In Good Standing', 'Cautionary Fine', 'Under Audit')) DEFAULT 'In Good Standing',
  deposit TEXT NOT NULL DEFAULT '₹2,500',
  active_loans_count INTEGER NOT NULL DEFAULT 0 CHECK (active_loans_count >= 0),
  max_loans INTEGER NOT NULL DEFAULT 5 CHECK (max_loans >= 1),
  joined_year INTEGER NOT NULL DEFAULT 2024,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for scholar lookup by college or standing
CREATE INDEX IF NOT EXISTS idx_scholars_standing ON scholars(standing);
CREATE INDEX IF NOT EXISTS idx_scholars_college ON scholars(college);

-- 3. LOANS (Folio Circulation & Movement Ledger)
CREATE TABLE IF NOT EXISTS loans (
  ref TEXT PRIMARY KEY,
  book_call_no TEXT NOT NULL REFERENCES books(call_no) ON UPDATE CASCADE ON DELETE RESTRICT,
  book_title TEXT NOT NULL,
  book_author TEXT NOT NULL,
  accession TEXT NOT NULL,
  scholar_id TEXT NOT NULL REFERENCES scholars(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  scholar_name TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  return_date TEXT DEFAULT NULL,
  status TEXT NOT NULL CHECK (status IN ('ISSUED', 'OVERDUE', 'RETURNED')) DEFAULT 'ISSUED',
  days_late INTEGER NOT NULL DEFAULT 0 CHECK (days_late >= 0),
  deposit TEXT NOT NULL DEFAULT '₹2,500',
  base_fine NUMERIC NOT NULL DEFAULT 0 CHECK (base_fine >= 0),
  repair_fee NUMERIC DEFAULT 0 CHECK (repair_fee >= 0),
  condition TEXT DEFAULT 'Good',
  wing TEXT DEFAULT 'North Gallery',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for active/overdue loans and borrower lookups
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_scholar_id ON loans(scholar_id);
CREATE INDEX IF NOT EXISTS idx_loans_book_call_no ON loans(book_call_no);

-- 4. LIBRARY SETTINGS (Archival Circulation Statutes & Term Governance)
CREATE TABLE IF NOT EXISTS library_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  term_name TEXT NOT NULL DEFAULT 'Michaelmas Term 1888',
  daily_fine_rate NUMERIC NOT NULL DEFAULT 50 CHECK (daily_fine_rate >= 0),
  bindery_fee NUMERIC NOT NULL DEFAULT 150 CHECK (bindery_fee >= 0),
  max_loan_days INTEGER NOT NULL DEFAULT 28 CHECK (max_loan_days >= 1),
  chaperone_required BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS CONTROL
-- ==============================================================================
-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_settings ENABLE ROW LEVEL SECURITY;

/*
  SECURITY NOTICE & ACCESS CONTROL OPTIONS:

  The current Lore & Ledger client application is designed as an open archival
  register with no user login authentication or role-based session system.

  Option 1 (Demo / Portfolio Mode):
    Grants SELECT, INSERT, and UPDATE permissions to the anon (public) role.
    SECURITY IMPLICATION: Anyone who discovers your public Supabase anon key can
    read and write to the database tables. This is suitable for university
    submissions, grading, and local demonstration, but NOT for production with sensitive data.

  Option 2 (Authenticated Custodian Mode):
    Grants SELECT to anon, but restricts INSERT/UPDATE/DELETE to authenticated users
    (Supabase Auth). This requires a login screen for librarians before issuing/returning books.

  Below, we apply Option 1 policies so your project functions smoothly out-of-the-box
  for your college evaluator without requiring them to create an account.
*/

-- RLS Policies for Books
DROP POLICY IF EXISTS "Public can view books" ON books;
CREATE POLICY "Public can view books" ON books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert books" ON books;
CREATE POLICY "Public can insert books" ON books FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update books" ON books;
CREATE POLICY "Public can update books" ON books FOR UPDATE USING (true);

-- RLS Policies for Scholars
DROP POLICY IF EXISTS "Public can view scholars" ON scholars;
CREATE POLICY "Public can view scholars" ON scholars FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert scholars" ON scholars;
CREATE POLICY "Public can insert scholars" ON scholars FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update scholars" ON scholars;
CREATE POLICY "Public can update scholars" ON scholars FOR UPDATE USING (true);

-- RLS Policies for Loans
DROP POLICY IF EXISTS "Public can view loans" ON loans;
CREATE POLICY "Public can view loans" ON loans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert loans" ON loans;
CREATE POLICY "Public can insert loans" ON loans FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update loans" ON loans;
CREATE POLICY "Public can update loans" ON loans FOR UPDATE USING (true);

-- RLS Policies for Settings
DROP POLICY IF EXISTS "Public can view settings" ON library_settings;
CREATE POLICY "Public can view settings" ON library_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update settings" ON library_settings;
CREATE POLICY "Public can update settings" ON library_settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public can insert settings" ON library_settings;
CREATE POLICY "Public can insert settings" ON library_settings FOR INSERT WITH CHECK (true);


-- ==============================================================================
-- SAFE, IDEMPOTENT SEED DATA (Runs once without overwriting existing data)
-- ==============================================================================

-- Seed Initial Books
INSERT INTO books (
  call_no, title, edition, author, category, dewey, total_copies, available_copies,
  shelf, wing, binding, status, notes, conservation_rating, accession_no, year
) VALUES
(
  'PR-4581-V1',
  'The Anatomy of Melancholy',
  'Oxford Folio, 1621',
  'Robert Burton',
  'Alchemy & Medicine',
  '157.3 BUR',
  4, 3,
  'Bay IV, Shelf C',
  'North Gallery',
  'Parchment',
  'AVAILABLE',
  'A medical treatise exploring psychological affliction, sorrow, and philosophical balms with woodcut emblems.',
  'Good',
  '#A-1082',
  1621
),
(
  'QA-803-N4',
  'Philosophiae Naturalis Principia Mathematica (3rd Ed.)',
  'London Royal Press, 1726',
  'Sir Isaac Newton',
  'Mathematics & Natural Philosophy',
  '531 NEW',
  2, 1,
  'Vault II, Cage B',
  'Special Collections Vault',
  'Calfskin',
  'AVAILABLE',
  'Exemplar with hand-annotated astronomical marginalia by Astronomer Royal John Flamsteed.',
  'Fragile Codex',
  '#A-0042',
  1726
),
(
  'MS-AR-940.1',
  'Chronicles of Antiquity & Northern Realms',
  'Edinburgh Folio, 1874',
  'H. G. Ravenscroft',
  'History & Cartography',
  '940.1 RAV',
  3, 0,
  'Bay IX, Shelf A',
  'North Gallery',
  'Morocco Leather',
  'CIRCULATING',
  'Contains illuminated heraldic crests of Northumbrian and Mercian baronies; currently in circulation.',
  'Moderate Wear',
  '#A-4481',
  1874
),
(
  'BOT-FOL-581',
  'Flora & Sylva of the Levant',
  'Oxford Botanical Press, 1858',
  'Lady Marian Hastings',
  'Botany & Herbal',
  '581.95 HAS',
  2, 0,
  'Bay I, Shelf E',
  'West Wing',
  'Velvet Cloth',
  'CIRCULATING',
  'Hand-coloured lithograph botanical plates of Syrian cyclamens and Mediterranean flora.',
  'Fragile Codex',
  '#A-7821',
  1858
),
(
  'KD-600-B5',
  'Commentaries on Common Law & Writs',
  'Clarendon Press, 1765',
  'Sir William Blackstone',
  'Jurisprudence',
  '349.42 BLA',
  6, 5,
  'Bay VI, Shelf D',
  'West Wing',
  'Vellum',
  'AVAILABLE',
  'Standard jurisprudential treatise in full vellum over boards; heavily consulted by law scholars.',
  'Good',
  '#A-3190',
  1765
),
(
  'QD-25-A8',
  'Theatrum Chemicum Britannicum',
  'London Folio, 1652',
  'Elias Ashmole',
  'Alchemy & Medicine',
  '540.1 ASH',
  1, 0,
  'Vault I, Enclosed Shelf',
  'Special Collections Vault',
  'Calfskin',
  'RESERVED',
  'Rare poetic collection of English alchemical treatises with copper engravings by Robert Vaughan.',
  'Fragile Codex',
  '#A-0019',
  1652
),
(
  'AST-520.4-A',
  'Treatise on Celestial Cartography',
  'Utrecht Press, 1862',
  'G. Brahe-Vane',
  'Mathematics & Natural Philosophy',
  '520.4 BRA',
  3, 0,
  'Bay VII, Shelf B',
  'North Gallery',
  'Parchment',
  'CIRCULATING',
  'Detailed lunar mapping and double-star catalogues with copper star charts.',
  'Pristine',
  '#A-1903',
  1862
),
(
  'LNG-439.9',
  'Lexicon of Gothic Dialects & Runes',
  'Leipzig Academic Press, 1881',
  'Dr. K. W. Meyer',
  'History & Cartography',
  '439.9 MEY',
  5, 0,
  'Bay III, Shelf A',
  'South Cloisters',
  'Morocco Leather',
  'CIRCULATING',
  'Comprehensive cross-etymological index of Ulfilas translation fragments with phonetic reconstructions.',
  'Good',
  '#A-3092',
  1881
)
ON CONFLICT (call_no) DO NOTHING;

-- Seed Initial Scholars
INSERT INTO scholars (
  id, name, faculty, college, standing, deposit, active_loans_count, max_loans, joined_year
) VALUES
(
  'SCH-2023-412',
  'Eleanor Finch',
  'Medieval & Modern History',
  'Balliol College',
  'In Good Standing',
  '₹2,500',
  2, 5, 2023
),
(
  'SCH-2024-089',
  'Julian S. Thorne',
  'Natural Philosophy & Astronomy',
  'Magdalen College',
  'In Good Standing',
  '₹1,200',
  1, 4, 2024
),
(
  'SCH-2019-014',
  'Arthur Pendelton, MD',
  'Clinical Medicine & Botany',
  'Christ Church',
  'Cautionary Fine',
  '₹4,000',
  3, 6, 2019
),
(
  'SCH-2025-501',
  'Clara Oswald',
  'Comparative Philology',
  'Merton College',
  'In Good Standing',
  '₹800',
  1, 4, 2025
),
(
  'SCH-2022-771',
  'Thomas Ravenswood',
  'Jurisprudence & Civil Writs',
  'All Souls College',
  'Under Audit',
  '₹3,000',
  2, 5, 2022
)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Loans
INSERT INTO loans (
  ref, book_call_no, book_title, book_author, accession,
  scholar_id, scholar_name, issue_date, due_date, return_date,
  status, days_late, deposit, base_fine, wing
) VALUES
(
  'LN-8492',
  'MS-AR-940.1',
  'Chronicles of Antiquity & Northern Realms',
  'H. G. Ravenscroft (London, 1874)',
  '#A-4481',
  'SCH-2023-412',
  'Eleanor Finch',
  '08 Oct 1888',
  '16 Oct 1888',
  NULL,
  'OVERDUE',
  8,
  '₹2,500',
  400,
  'North Gallery'
),
(
  'LN-8477',
  'BOT-FOL-581',
  'Flora & Sylva of the Levant',
  'Lady Marian Hastings (Oxford, 1858)',
  '#A-7821',
  'SCH-2019-014',
  'Arthur Pendelton, MD',
  '05 Oct 1888',
  '19 Oct 1888',
  NULL,
  'OVERDUE',
  5,
  '₹4,000',
  250,
  'West Wing'
),
(
  'LN-8501',
  'AST-520.4-A',
  'Treatise on Celestial Cartography',
  'G. Brahe-Vane (Utrecht, 1862)',
  '#A-1903',
  'SCH-2024-089',
  'Julian S. Thorne',
  '18 Oct 1888',
  '01 Nov 1888',
  NULL,
  'ISSUED',
  0,
  '₹1,200',
  0,
  'North Gallery'
),
(
  'LN-8512',
  'LNG-439.9',
  'Lexicon of Gothic Dialects & Runes',
  'Dr. K. W. Meyer (Leipzig, 1881)',
  '#A-3092',
  'SCH-2025-501',
  'Clara Oswald',
  '22 Oct 1888',
  '05 Nov 1888',
  NULL,
  'ISSUED',
  0,
  '₹800',
  0,
  'South Cloisters'
),
(
  'LN-8460',
  'KD-600-B5',
  'Commentaries on Common Law & Writs',
  'Sir William Blackstone (1765)',
  '#A-3190',
  'SCH-2022-771',
  'Thomas Ravenswood',
  '01 Oct 1888',
  '15 Oct 1888',
  '14 Oct 1888',
  'RETURNED',
  0,
  '₹3,000',
  0,
  'West Wing'
)
ON CONFLICT (ref) DO NOTHING;

-- Seed Initial Library Settings
INSERT INTO library_settings (
  id, term_name, daily_fine_rate, bindery_fee, max_loan_days, chaperone_required
) VALUES (
  1, 'Michaelmas Term 1888', 50, 150, 28, TRUE
)
ON CONFLICT (id) DO NOTHING;
