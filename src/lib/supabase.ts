import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Book, Scholar, LoanRecord } from '@/context/LibraryContext';

export interface LibrarySettings {
  termName: string;
  dailyFineRate: number;
  binderyFee: number;
  maxLoanDays: number;
  chaperoneRequired: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabasePublishableKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    supabasePublishableKey !== 'your-publishable-key-here' &&
    supabasePublishableKey !== 'your-anon-key-here'
  );
};

// Singleton client instance
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabasePublishableKey!)
  : null;

// ==============================================================================
// TYPE MAPPERS (Database snake_case <-> Application camelCase)
// ==============================================================================

export function mapBookFromDb(row: any): Book {
  return {
    callNo: row.call_no,
    title: row.title,
    edition: row.edition || 'First Edition, 1888',
    author: row.author,
    category: row.category,
    dewey: row.dewey || '',
    totalCopies: Number(row.total_copies) || 1,
    availableCopies: Number(row.available_copies) ?? 1,
    shelf: row.shelf || 'General Stacks',
    wing: row.wing || 'North Gallery',
    binding: row.binding || 'Calfskin',
    status: row.status as Book['status'],
    notes: row.notes || '',
    conservationRating: row.conservation_rating as Book['conservationRating'],
    accessionNo: row.accession_no,
    year: row.year ? Number(row.year) : undefined
  };
}

export function mapBookToDb(book: Partial<Book>): Record<string, any> {
  const data: Record<string, any> = {};
  if (book.callNo !== undefined) data.call_no = book.callNo;
  if (book.title !== undefined) data.title = book.title;
  if (book.edition !== undefined) data.edition = book.edition;
  if (book.author !== undefined) data.author = book.author;
  if (book.category !== undefined) data.category = book.category;
  if (book.dewey !== undefined) data.dewey = book.dewey;
  if (book.totalCopies !== undefined) data.total_copies = book.totalCopies;
  if (book.availableCopies !== undefined) data.available_copies = book.availableCopies;
  if (book.shelf !== undefined) data.shelf = book.shelf;
  if (book.wing !== undefined) data.wing = book.wing;
  if (book.binding !== undefined) data.binding = book.binding;
  if (book.status !== undefined) data.status = book.status;
  if (book.notes !== undefined) data.notes = book.notes;
  if (book.conservationRating !== undefined) data.conservation_rating = book.conservationRating;
  if (book.accessionNo !== undefined) data.accession_no = book.accessionNo;
  if (book.year !== undefined) data.year = book.year;
  return data;
}

export function mapScholarFromDb(row: any): Scholar {
  return {
    id: row.id,
    name: row.name,
    faculty: row.faculty,
    college: row.college,
    standing: row.standing as Scholar['standing'],
    deposit: row.deposit || '₹2,500',
    activeLoansCount: Number(row.active_loans_count) || 0,
    maxLoans: Number(row.max_loans) || 5,
    joinedYear: Number(row.joined_year) || 2024
  };
}

export function mapScholarToDb(scholar: Partial<Scholar>): Record<string, any> {
  const data: Record<string, any> = {};
  if (scholar.id !== undefined) data.id = scholar.id;
  if (scholar.name !== undefined) data.name = scholar.name;
  if (scholar.faculty !== undefined) data.faculty = scholar.faculty;
  if (scholar.college !== undefined) data.college = scholar.college;
  if (scholar.standing !== undefined) data.standing = scholar.standing;
  if (scholar.deposit !== undefined) data.deposit = scholar.deposit;
  if (scholar.activeLoansCount !== undefined) data.active_loans_count = scholar.activeLoansCount;
  if (scholar.maxLoans !== undefined) data.max_loans = scholar.maxLoans;
  if (scholar.joinedYear !== undefined) data.joined_year = scholar.joinedYear;
  return data;
}

export function mapLoanFromDb(row: any): LoanRecord {
  return {
    ref: row.ref,
    bookCallNo: row.book_call_no,
    bookTitle: row.book_title,
    bookAuthor: row.book_author,
    accession: row.accession,
    scholarId: row.scholar_id,
    scholarName: row.scholar_name,
    issueDate: row.issue_date,
    dueDate: row.due_date,
    returnDate: row.return_date || null,
    status: row.status as LoanRecord['status'],
    daysLate: Number(row.days_late) || 0,
    deposit: row.deposit || '₹2,500',
    baseFine: Number(row.base_fine) || 0,
    repairFee: row.repair_fee !== null ? Number(row.repair_fee) : 0,
    condition: row.condition || 'Good',
    wing: row.wing || 'North Gallery',
    notes: row.notes || ''
  };
}

export function mapLoanToDb(loan: Partial<LoanRecord>): Record<string, any> {
  const data: Record<string, any> = {};
  if (loan.ref !== undefined) data.ref = loan.ref;
  if (loan.bookCallNo !== undefined) data.book_call_no = loan.bookCallNo;
  if (loan.bookTitle !== undefined) data.book_title = loan.bookTitle;
  if (loan.bookAuthor !== undefined) data.book_author = loan.bookAuthor;
  if (loan.accession !== undefined) data.accession = loan.accession;
  if (loan.scholarId !== undefined) data.scholar_id = loan.scholarId;
  if (loan.scholarName !== undefined) data.scholar_name = loan.scholarName;
  if (loan.issueDate !== undefined) data.issue_date = loan.issueDate;
  if (loan.dueDate !== undefined) data.due_date = loan.dueDate;
  if (loan.returnDate !== undefined) data.return_date = loan.returnDate;
  if (loan.status !== undefined) data.status = loan.status;
  if (loan.daysLate !== undefined) data.days_late = loan.daysLate;
  if (loan.deposit !== undefined) data.deposit = loan.deposit;
  if (loan.baseFine !== undefined) data.base_fine = loan.baseFine;
  if (loan.repairFee !== undefined) data.repair_fee = loan.repairFee;
  if (loan.condition !== undefined) data.condition = loan.condition;
  if (loan.wing !== undefined) data.wing = loan.wing;
  if (loan.notes !== undefined) data.notes = loan.notes;
  return data;
}

export function mapSettingsFromDb(row: any): LibrarySettings {
  return {
    termName: row.term_name || 'Michaelmas Term 1888',
    dailyFineRate: Number(row.daily_fine_rate) || 50,
    binderyFee: Number(row.bindery_fee) || 150,
    maxLoanDays: Number(row.max_loan_days) || 28,
    chaperoneRequired: row.chaperone_required ?? true
  };
}
