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

export type Party = {
  id: string;
  partyName: string;
  type: string;
  gstin?: string | null;
  pan?: string | null;
  tan?: string | null;
  upi?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankBranch?: string | null;
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
