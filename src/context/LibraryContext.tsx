'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Book {
  callNo: string;
  title: string;
  edition: string;
  author: string;
  category: string;
  dewey: string;
  totalCopies: number;
  availableCopies: number;
  shelf: string;
  wing: string;
  binding: string;
  status: 'AVAILABLE' | 'CIRCULATING' | 'RESERVED' | 'RESTOCKING';
  notes: string;
  conservationRating: 'Pristine' | 'Good' | 'Moderate Wear' | 'Fragile Codex';
  accessionNo: string;
  year?: number;
}

export interface Scholar {
  id: string;
  name: string;
  faculty: string;
  college: string;
  standing: 'In Good Standing' | 'Cautionary Fine' | 'Under Audit';
  deposit: string;
  activeLoansCount: number;
  maxLoans: number;
  joinedYear: number;
}

export interface LoanRecord {
  ref: string;
  bookCallNo: string;
  bookTitle: string;
  bookAuthor: string;
  accession: string;
  scholarId: string;
  scholarName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'ISSUED' | 'OVERDUE' | 'RETURNED';
  daysLate: number;
  deposit: string;
  baseFine: number;
  repairFee?: number;
  condition?: string;
  wing?: string;
  notes?: string;
}

export interface SessionDispatch {
  timestamp: string;
  loanRef: string;
  bookTitle: string;
  bookCallNo: string;
  scholarName: string;
  scholarId: string;
  loanPeriodDays: number;
  dueDateStr: string;
}

interface ToastInfo {
  message: string;
  icon?: string;
  type?: 'success' | 'warning' | 'info';
  visible: boolean;
}

interface LibraryContextType {
  books: Book[];
  scholars: Scholar[];
  loans: LoanRecord[];
  sessionDispatches: SessionDispatch[];
  toast: ToastInfo;
  showToast: (message: string, icon?: string, type?: 'success' | 'warning' | 'info') => void;
  hideToast: () => void;
  lendBook: (scholarId: string, bookCallNo: string, loanDays: number, notes?: string) => { success: boolean; loanRef?: string; message: string };
  returnBook: (loanRef: string, condition?: string, hasDamage?: boolean) => { success: boolean; message: string };
  addBook: (book: Omit<Book, 'availableCopies'>) => void;
  reserveBook: (callNo: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const INITIAL_BOOKS: Book[] = [
  {
    callNo: 'PR-4581-V1',
    title: 'The Anatomy of Melancholy',
    edition: 'Oxford Folio, 1621',
    author: 'Robert Burton',
    category: 'Alchemy & Medicine',
    dewey: '157.3 BUR',
    totalCopies: 4,
    availableCopies: 3,
    shelf: 'Bay IV, Shelf C',
    wing: 'North Gallery',
    binding: 'Parchment',
    status: 'AVAILABLE',
    notes: 'A medical treatise exploring psychological affliction, sorrow, and philosophical balms with woodcut emblems.',
    conservationRating: 'Good',
    accessionNo: '#A-1082',
    year: 1621
  },
  {
    callNo: 'QA-803-N4',
    title: 'Philosophiae Naturalis Principia Mathematica (3rd Ed.)',
    edition: 'London Royal Press, 1726',
    author: 'Sir Isaac Newton',
    category: 'Mathematics & Natural Philosophy',
    dewey: '531 NEW',
    totalCopies: 2,
    availableCopies: 1,
    shelf: 'Vault II, Cage B',
    wing: 'Special Collections Vault',
    binding: 'Calfskin',
    status: 'AVAILABLE',
    notes: 'Exemplar with hand-annotated astronomical marginalia by Astronomer Royal John Flamsteed.',
    conservationRating: 'Fragile Codex',
    accessionNo: '#A-0042',
    year: 1726
  },
  {
    callNo: 'MS-AR-940.1',
    title: 'Chronicles of Antiquity & Northern Realms',
    edition: 'Edinburgh Folio, 1874',
    author: 'H. G. Ravenscroft',
    category: 'History & Cartography',
    dewey: '940.1 RAV',
    totalCopies: 3,
    availableCopies: 0,
    shelf: 'Bay IX, Shelf A',
    wing: 'North Gallery',
    binding: 'Morocco Leather',
    status: 'CIRCULATING',
    notes: 'Contains illuminated heraldic crests of Northumbrian and Mercian baronies; currently in circulation.',
    conservationRating: 'Moderate Wear',
    accessionNo: '#A-4481',
    year: 1874
  },
  {
    callNo: 'BOT-FOL-581',
    title: 'Flora & Sylva of the Levant',
    edition: 'Oxford Botanical Press, 1858',
    author: 'Lady Marian Hastings',
    category: 'Botany & Herbal',
    dewey: '581.95 HAS',
    totalCopies: 2,
    availableCopies: 0,
    shelf: 'Bay I, Shelf E',
    wing: 'West Wing',
    binding: 'Velvet Cloth',
    status: 'CIRCULATING',
    notes: 'Hand-coloured lithograph botanical plates of Syrian cyclamens and Mediterranean flora.',
    conservationRating: 'Fragile Codex',
    accessionNo: '#A-7821',
    year: 1858
  },
  {
    callNo: 'KD-600-B5',
    title: 'Commentaries on Common Law & Writs',
    edition: 'Clarendon Press, 1765',
    author: 'Sir William Blackstone',
    category: 'Jurisprudence',
    dewey: '349.42 BLA',
    totalCopies: 6,
    availableCopies: 5,
    shelf: 'Bay VI, Shelf D',
    wing: 'West Wing',
    binding: 'Vellum',
    status: 'AVAILABLE',
    notes: 'Standard jurisprudential treatise in full vellum over boards; heavily consulted by law scholars.',
    conservationRating: 'Good',
    accessionNo: '#A-3190',
    year: 1765
  },
  {
    callNo: 'QD-25-A8',
    title: 'Theatrum Chemicum Britannicum',
    edition: 'London Folio, 1652',
    author: 'Elias Ashmole',
    category: 'Alchemy & Medicine',
    dewey: '540.1 ASH',
    totalCopies: 1,
    availableCopies: 0,
    shelf: 'Vault I, Enclosed Shelf',
    wing: 'Special Collections Vault',
    binding: 'Calfskin',
    status: 'RESERVED',
    notes: 'Rare poetic collection of English alchemical treatises with copper engravings by Robert Vaughan.',
    conservationRating: 'Fragile Codex',
    accessionNo: '#A-0019',
    year: 1652
  },
  {
    callNo: 'AST-520.4-A',
    title: 'Treatise on Celestial Cartography',
    edition: 'Utrecht Press, 1862',
    author: 'G. Brahe-Vane',
    category: 'Mathematics & Natural Philosophy',
    dewey: '520.4 BRA',
    totalCopies: 3,
    availableCopies: 0,
    shelf: 'Bay VII, Shelf B',
    wing: 'North Gallery',
    binding: 'Parchment',
    status: 'CIRCULATING',
    notes: 'Detailed lunar mapping and double-star catalogues with copper star charts.',
    conservationRating: 'Pristine',
    accessionNo: '#A-1903',
    year: 1862
  },
  {
    callNo: 'LNG-439.9',
    title: 'Lexicon of Gothic Dialects & Runes',
    edition: 'Leipzig Academic Press, 1881',
    author: 'Dr. K. W. Meyer',
    category: 'History & Cartography',
    dewey: '439.9 MEY',
    totalCopies: 5,
    availableCopies: 0,
    shelf: 'Bay III, Shelf A',
    wing: 'South Cloisters',
    binding: 'Morocco Leather',
    status: 'CIRCULATING',
    notes: 'Comprehensive cross-etymological index of Ulfilas translation fragments with phonetic reconstructions.',
    conservationRating: 'Good',
    accessionNo: '#A-3092',
    year: 1881
  }
];

const INITIAL_SCHOLARS: Scholar[] = [
  {
    id: 'SCH-2023-412',
    name: 'Eleanor Finch',
    faculty: 'Medieval & Modern History',
    college: 'Balliol College',
    standing: 'In Good Standing',
    deposit: '₹2,500',
    activeLoansCount: 2,
    maxLoans: 5,
    joinedYear: 2023
  },
  {
    id: 'SCH-2024-089',
    name: 'Julian S. Thorne',
    faculty: 'Natural Philosophy & Astronomy',
    college: 'Magdalen College',
    standing: 'In Good Standing',
    deposit: '₹1,200',
    activeLoansCount: 1,
    maxLoans: 4,
    joinedYear: 2024
  },
  {
    id: 'SCH-2019-014',
    name: 'Arthur Pendelton, MD',
    faculty: 'Clinical Medicine & Botany',
    college: 'Christ Church',
    standing: 'Cautionary Fine',
    deposit: '₹4,000',
    activeLoansCount: 3,
    maxLoans: 6,
    joinedYear: 2019
  },
  {
    id: 'SCH-2025-501',
    name: 'Clara Oswald',
    faculty: 'Comparative Philology',
    college: 'Merton College',
    standing: 'In Good Standing',
    deposit: '₹800',
    activeLoansCount: 1,
    maxLoans: 4,
    joinedYear: 2025
  },
  {
    id: 'SCH-2022-771',
    name: 'Thomas Ravenswood',
    faculty: 'Jurisprudence & Civil Writs',
    college: 'All Souls College',
    standing: 'Under Audit',
    deposit: '₹3,000',
    activeLoansCount: 2,
    maxLoans: 5,
    joinedYear: 2022
  }
];

const INITIAL_LOANS: LoanRecord[] = [
  {
    ref: 'LN-8492',
    bookCallNo: 'MS-AR-940.1',
    bookTitle: 'Chronicles of Antiquity & Northern Realms',
    bookAuthor: 'H. G. Ravenscroft (London, 1874)',
    accession: '#A-4481',
    scholarId: 'SCH-2023-412',
    scholarName: 'Eleanor Finch',
    issueDate: '08 Oct 1888',
    dueDate: '16 Oct 1888',
    returnDate: null,
    status: 'OVERDUE',
    daysLate: 8,
    deposit: '₹2,500',
    baseFine: 400,
    wing: 'North Gallery'
  },
  {
    ref: 'LN-8477',
    bookCallNo: 'BOT-FOL-581',
    bookTitle: 'Flora & Sylva of the Levant',
    bookAuthor: 'Lady Marian Hastings (Oxford, 1858)',
    accession: '#A-7821',
    scholarId: 'SCH-2019-014',
    scholarName: 'Arthur Pendelton, MD',
    issueDate: '05 Oct 1888',
    dueDate: '19 Oct 1888',
    returnDate: null,
    status: 'OVERDUE',
    daysLate: 5,
    deposit: '₹4,000',
    baseFine: 250,
    wing: 'West Wing'
  },
  {
    ref: 'LN-8501',
    bookCallNo: 'AST-520.4-A',
    bookTitle: 'Treatise on Celestial Cartography',
    bookAuthor: 'G. Brahe-Vane (Utrecht, 1862)',
    accession: '#A-1903',
    scholarId: 'SCH-2024-089',
    scholarName: 'Julian S. Thorne',
    issueDate: '18 Oct 1888',
    dueDate: '01 Nov 1888',
    returnDate: null,
    status: 'ISSUED',
    daysLate: 0,
    deposit: '₹1,200',
    baseFine: 0,
    wing: 'North Gallery'
  },
  {
    ref: 'LN-8512',
    bookCallNo: 'LNG-439.9',
    bookTitle: 'Lexicon of Gothic Dialects & Runes',
    bookAuthor: 'Dr. K. W. Meyer (Leipzig, 1881)',
    accession: '#A-3092',
    scholarId: 'SCH-2025-501',
    scholarName: 'Clara Oswald',
    issueDate: '22 Oct 1888',
    dueDate: '05 Nov 1888',
    returnDate: null,
    status: 'ISSUED',
    daysLate: 0,
    deposit: '₹800',
    baseFine: 0,
    wing: 'South Cloisters'
  },
  {
    ref: 'LN-8460',
    bookCallNo: 'KD-600-B5',
    bookTitle: 'Commentaries on Common Law & Writs',
    bookAuthor: 'Sir William Blackstone (1765)',
    accession: '#A-3190',
    scholarId: 'SCH-2022-771',
    scholarName: 'Thomas Ravenswood',
    issueDate: '01 Oct 1888',
    dueDate: '15 Oct 1888',
    returnDate: '14 Oct 1888',
    status: 'RETURNED',
    daysLate: 0,
    deposit: '₹3,000',
    baseFine: 0,
    wing: 'West Wing'
  }
];

const INITIAL_DISPATCHES: SessionDispatch[] = [
  {
    timestamp: '17:14:02',
    loanRef: 'LN-8512',
    bookTitle: 'Lexicon of Gothic Dialects & Runes',
    bookCallNo: 'LNG-439.9',
    scholarName: 'Clara Oswald',
    scholarId: 'SCH-2025-501',
    loanPeriodDays: 14,
    dueDateStr: '05 NOV 1888'
  },
  {
    timestamp: '16:42:19',
    loanRef: 'LN-8501',
    bookTitle: 'Treatise on Celestial Cartography',
    bookCallNo: 'AST-520.4-A',
    scholarName: 'Julian S. Thorne',
    scholarId: 'SCH-2024-089',
    loanPeriodDays: 14,
    dueDateStr: '01 NOV 1888'
  }
];

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [scholars, setScholars] = useState<Scholar[]>(INITIAL_SCHOLARS);
  const [loans, setLoans] = useState<LoanRecord[]>(INITIAL_LOANS);
  const [sessionDispatches, setSessionDispatches] = useState<SessionDispatch[]>(INITIAL_DISPATCHES);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<ToastInfo>({
    message: '',
    visible: false
  });

  const showToast = (message: string, icon = 'check_circle', type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, icon, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3800);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const lendBook = (
    scholarId: string,
    bookCallNo: string,
    loanDays: number,
    notes = ''
  ) => {
    const book = books.find(b => b.callNo === bookCallNo);
    const scholar = scholars.find(s => s.id === scholarId);

    if (!book) {
      return { success: false, message: `Volume with call number ${bookCallNo} not found.` };
    }
    if (!scholar) {
      return { success: false, message: `Scholar with ID ${scholarId} not found.` };
    }
    if (book.availableCopies <= 0) {
      return { success: false, message: `All copies of "${book.title}" are currently in circulation.` };
    }

    const newLoanRef = `LN-${Math.floor(8513 + Math.random() * 500)}`;
    const now = new Date(1888, 9, 24); // 24 Oct 1888
    const due = new Date(1888, 9, 24 + loanDays);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const issueDateStr = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const dueDateStr = `${String(due.getDate()).padStart(2, '0')} ${months[due.getMonth()]} ${due.getFullYear()}`;
    const dueDateUpper = `${String(due.getDate()).padStart(2, '0')} ${months[due.getMonth()].toUpperCase()} ${due.getFullYear()}`;

    // Update book copies
    setBooks(prev =>
      prev.map(b => {
        if (b.callNo === bookCallNo) {
          const newAvail = b.availableCopies - 1;
          return {
            ...b,
            availableCopies: newAvail,
            status: newAvail === 0 ? 'CIRCULATING' : b.status
          };
        }
        return b;
      })
    );

    // Update scholar loan count
    setScholars(prev =>
      prev.map(s => {
        if (s.id === scholarId) {
          return { ...s, activeLoansCount: s.activeLoansCount + 1 };
        }
        return s;
      })
    );

    // Add to loans ledger
    const newLoan: LoanRecord = {
      ref: newLoanRef,
      bookCallNo: book.callNo,
      bookTitle: book.title,
      bookAuthor: book.author,
      accession: book.accessionNo,
      scholarId: scholar.id,
      scholarName: scholar.name,
      issueDate: issueDateStr,
      dueDate: dueDateStr,
      returnDate: null,
      status: 'ISSUED',
      daysLate: 0,
      deposit: scholar.deposit,
      baseFine: 0,
      wing: book.wing,
      notes
    };
    setLoans(prev => [newLoan, ...prev]);

    // Add to current session dispatch
    const nowTime = new Date();
    const timeStr = `${String(nowTime.getHours()).padStart(2, '0')}:${String(nowTime.getMinutes()).padStart(2, '0')}:${String(nowTime.getSeconds()).padStart(2, '0')}`;
    
    setSessionDispatches(prev => [
      {
        timestamp: timeStr,
        loanRef: newLoanRef,
        bookTitle: book.title,
        bookCallNo: book.callNo,
        scholarName: scholar.name,
        scholarId: scholar.id,
        loanPeriodDays: loanDays,
        dueDateStr: dueDateUpper
      },
      ...prev
    ]);

    showToast(`Volume ${book.callNo} successfully dispatched to ${scholar.name}! [Folio: ${newLoanRef}]`, 'verified');

    return {
      success: true,
      loanRef: newLoanRef,
      message: `Folio ${newLoanRef} issued. Due on ${dueDateUpper}.`
    };
  };

  const returnBook = (loanRef: string, condition = 'Good', hasDamage = false) => {
    const loan = loans.find(l => l.ref === loanRef);
    if (!loan) {
      return { success: false, message: `Loan record ${loanRef} not found.` };
    }

    const returnDateStr = '24 Oct 1888';

    setLoans(prev =>
      prev.map(l => {
        if (l.ref === loanRef) {
          return {
            ...l,
            returnDate: returnDateStr,
            status: 'RETURNED',
            condition: condition,
            repairFee: hasDamage ? 150 : 0
          };
        }
        return l;
      })
    );

    // Restore book availability
    setBooks(prev =>
      prev.map(b => {
        if (b.callNo === loan.bookCallNo) {
          const newAvail = b.availableCopies + 1;
          return {
            ...b,
            availableCopies: newAvail,
            status: newAvail > 0 ? 'AVAILABLE' : b.status
          };
        }
        return b;
      })
    );

    // Update scholar loan count
    setScholars(prev =>
      prev.map(s => {
        if (s.id === loan.scholarId && s.activeLoansCount > 0) {
          return { ...s, activeLoansCount: s.activeLoansCount - 1 };
        }
        return s;
      })
    );

    showToast(`Volume ${loan.bookCallNo} returned and restocked in stacks. Quittance recorded!`, 'inventory_2');

    return { success: true, message: `Return recorded for ${loanRef}.` };
  };

  const addBook = (bookData: Omit<Book, 'availableCopies'>) => {
    const newBook: Book = {
      ...bookData,
      availableCopies: bookData.totalCopies
    };
    setBooks(prev => [newBook, ...prev]);
    showToast(`New acquisition "${bookData.title}" recorded in the Scriptorium!`, 'bookmark_add');
  };

  const reserveBook = (callNo: string) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.callNo === callNo) {
          return { ...b, status: 'RESERVED' };
        }
        return b;
      })
    );
    showToast(`Hold slip attached to catalog folio ${callNo}.`, 'bookmark');
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        scholars,
        loans,
        sessionDispatches,
        toast,
        showToast,
        hideToast,
        lendBook,
        returnBook,
        addBook,
        reserveBook,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
