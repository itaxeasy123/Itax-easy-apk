// Ledger types
export interface Ledger {
  id: string;
  ledgerName: string;
  openingBalance: number;
  balance: number;
  userId: string;
  partyId?: string;
  year: number;
  month: number;
  ledgerType: LedgerType;
  createdAt: string;
  updatedAt: string;
}

export type LedgerType =
  | 'bank'
  | 'cash'
  | 'purchase'
  | 'sales'
  | 'directExpense'
  | 'indirectExpense'
  | 'directIncome'
  | 'indirectIncome'
  | 'fixedAssets'
  | 'currentAssets'
  | 'loansAndLiabilitieslw'
  | 'accountsReceivable'
  | 'accountsPayable';

// Party types
export interface Party {
  id: string;
  partyName: string;
  type: PartyType;
  gstin?: string;
  pan?: string;
  tan?: string;
  upi?: string;
  email?: string;
  phone?: string;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  ledgers?: Ledger[];
}

export type PartyType = 'customer' | 'supplier';

// Bill types
export interface BillPayable {
  id: number;
  supplierName: string;
  supplierAddress: string;
  contact: string;
  billDate: string;
  dueDate?: string;
  billAmount: number;
  billNumber: string;
  billDiscription?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentDate?: string;
  paymentAmount: number;
  tax?: number;
  comment?: string;
  invoiceNumber: string;
}

export interface BillReceivable {
  id: number;
  billNumber: string;
  amount: number;
  tax?: number;
  customerName: string;
  customerAddress: string;
  contact: string;
  itemQuantity?: number;
  itemPrice?: number;
  itemDescription?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  dueDate?: string;
  comment?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ListResponse<T> {
  success: boolean;
  data?: T[];
  message?: string;
}

// Bank & Transaction types
export interface BankDetails {
  id: string;
  accountHolderName: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  bankAccountType: BankAccountType;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export type BankAccountType = 'saving' | 'current' | 'business';

export interface Transaction {
  id: string;
  ledgerId: string;
  journalEntryId: string;
  amount: number;
  transactionType: TransactionType;
  userId: number;
  date: string;
  ledger?: Ledger;
  journalEntry?: JournalEntry;
}

export type TransactionType = 'debit' | 'credit';

export interface JournalEntry {
  id: string;
  entryDate: string;
  description: string;
  userId: number;
  transactions?: Transaction[];
  voucherNumber?: string;
  voucherType?: VoucherType;
  totalDebit?: number;
  totalCredit?: number;
  narration?: string;
  lines?: VoucherLine[];
}

export type VoucherType =
  | 'journal'
  | 'payment'
  | 'receipt'
  | 'contra'
  | 'sales'
  | 'purchase'
  | 'debitNote'
  | 'creditNote';
export type VoucherSide = 'debit' | 'credit';

export interface VoucherLine {
  id: string;
  ledgerId: string;
  ledgerName: string;
  side: VoucherSide;
  amount: number;
}

export interface VoucherEntry {
  id: string;
  voucherNumber: string;
  voucherType: VoucherType;
  entryDate: string;
  narration: string;
  lines: VoucherLine[];
  totalDebit: number;
  totalCredit: number;
  status?: 'DRAFT' | 'POSTED' | 'REVERSED';
  partyName?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  status: PaymentStatus;
  userId: number;
  createdAt?: string;
}

export type PaymentStatus = 'created' | 'captured' | 'failed' | 'refunded';

// Report types
export interface ProfitAndLossReport {
  period: string;
  totalIncome: number;
  totalExpense: number;
  profit: number;
  profitMargin: number;
}

export interface BalanceSheetReport {
  date: string;
  assets: {
    currentAssets: number;
    fixedAssets: number;
    total: number;
  };
  liabilities: {
    currentLiabilities: number;
    fixedLiabilities: number;
    total: number;
  };
  equity: number;
}

export interface CashFlowReport {
  period: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
}

export interface DayBook {
  id: string;
  ledgerId: string;
  transactionDate: string;
  amount: number;
  transactionType: TransactionType;
  description: string;
  entryDate?: string;
  voucherType?: VoucherType;
  voucherNumber?: string;
  ledgerName?: string;
  narration?: string;
  side?: TransactionType;
}

export type InvoiceType =
  | 'sales'
  | 'purchase'
  | 'sales_return'
  | 'purchase_return';

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue';

export type ModeOfPayment = 'cash' | 'bank' | 'upi' | 'credit';

export type Pagination = {
  currentPage: number;
  limit: number;
  pages: number;
  totalItems: number;
};

export type InvoiceSummary = {
  total_sales: number;
  total_purchases: number;
  number_of_parties: number;
  number_of_items: number;
};

export type Item = {
  id: string;
  itemName: string;
  unit: string;
  price: number;
  openingStock?: number | null;
  closingStock?: number | null;
  purchasePrice?: number | null;
  cgst?: number | null;
  sgst?: number | null;
  igst?: number | null;
  utgst?: number | null;
  taxExempted?: boolean;
  description?: string | null;
  hsnCode?: string | null;
  categoryId?: string | null;
  supplierId?: string | null;
};

export type InvoiceItem = {
  id?: string;
  itemId?: string | null;
  quantity: number;
  discount: number;
  taxPercent?: number;
  item?: Item | null;
};

export type Invoice = {
  id: string;
  invoiceNumber?: string | null;
  gstNumber?: string | null;
  type: InvoiceType;
  totalAmount: number;
  totalGst?: number | null;
  stateOfSupply: string;
  cgst?: number | null;
  sgst?: number | null;
  igst?: number | null;
  utgst?: number | null;
  details?: string | null;
  extraDetails?: string | null;
  invoiceDate?: string | null;
  dueDate?: string | null;
  isInventory?: boolean | null;
  modeOfPayment: ModeOfPayment;
  credit: boolean;
  status: InvoiceStatus;
  partyId: string;
  party?: Party;
  invoiceItems: InvoiceItem[];
};

export type GetInvoicesParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
};

export type CreateInvoicePayload = {
  invoiceNumber?: string;
  gstNumber: string;
  type: InvoiceType;
  partyId: string;
  totalAmount: number;
  totalGst?: number;
  stateOfSupply: string;
  invoiceDate?: string;
  dueDate?: string;
  isInventory?: boolean;
  cgst?: number;
  sgst?: number;
  igst?: number;
  utgst?: number;
  details?: string;
  extraDetails?: string;
  modeOfPayment: ModeOfPayment;
  credit?: boolean;
  status: InvoiceStatus;
  invoiceItems: {
    itemId: string;
    quantity: number;
    discount: number;
    taxPercent: number;
  }[];
};

export type CreatePartyPayload = {
  partyName: string;
  type: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  upi?: string;
  email?: string;
  phone?: string;
  address?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  openingBalance?: number;
  year?: number;
  month?: number;
};

export type CreateItemPayload = {
  itemName: string;
  unit: string;
  price?: number;
  openingStock?: number;
  closingStock?: number;
  purchasePrice?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  utgst?: number;
  taxExempted?: boolean;
  description?: string;
  hsnCode?: string;
  categoryId?: string;
  supplierId?: string;
};

export type EinvoiceAuthPayload = {
  username: string;
  password: string;
  gstin: string;
};

export type GenerateEinvoicePayload = Record<string, unknown>;

export type GenerateEinvoicePdfPayload = {
  irn: string;
  signed_qr_code: string;
  signed_invoice: string;
};

