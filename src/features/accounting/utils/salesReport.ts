import { Ledger, Party, DayBook, VoucherEntry } from "../types/accountingTypes";
import type { Invoice } from "../../invoice/types/invoice.types";

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const formatCurrency = (value: number) =>
  `Rs ${Math.abs(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const getCurrentFinancialYearLabel = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const startYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};

export type MonthlySalesPoint = {
  monthIndex: number;
  label: string;
  amount: number;
};

export type CustomerSalesRow = {
  id: string;
  partyName: string;
  amount: number;
  type: Party["type"];
  ledgersCount: number;
};

const SALES_LEDGER_TYPES: Ledger["ledgerType"][] = ["sales", "directIncome", "indirectIncome"];

const SALES_INVOICE_TYPES: Invoice["type"][] = ["sales", "sales_return"];
const RECEIPT_VOUCHER_TYPES: VoucherEntry["voucherType"][] = ["receipt"];

export const buildMonthlySalesSeries = (ledgers: Ledger[], year: number): MonthlySalesPoint[] => {
  return MONTH_LABELS.map((label, monthIndex) => {
    const amount = ledgers
      .filter(
        (ledger) =>
          ledger.year === year &&
          ledger.month === monthIndex &&
          SALES_LEDGER_TYPES.includes(ledger.ledgerType)
      )
      .reduce((sum, ledger) => sum + Math.max(Number(ledger.balance || 0), 0), 0);

    return { monthIndex, label, amount };
  });
};

export const buildCustomerSalesRows = (parties: Party[], ledgers: Ledger[]): CustomerSalesRow[] => {
  return parties
    .map((party) => {
      const partyLedgers = ledgers.filter((ledger) => ledger.partyId === party.id);
      const amount = partyLedgers.reduce((sum, ledger) => sum + Math.max(Number(ledger.balance || 0), 0), 0);

      return {
        id: party.id,
        partyName: party.partyName,
        amount,
        type: party.type,
        ledgersCount: partyLedgers.length,
      };
    })
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

export const buildMonthlySalesSeriesFromInvoices = (
  invoices: Invoice[],
  year: number
): MonthlySalesPoint[] => {
  return MONTH_LABELS.map((label, monthIndex) => {
    const amount = invoices
      .filter((invoice) => {
        if (!invoice.invoiceDate) return false;
        const date = new Date(invoice.invoiceDate);
        return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === monthIndex;
      })
      .filter((invoice) => SALES_INVOICE_TYPES.includes(invoice.type))
      .reduce((sum, invoice) => sum + Math.max(Number(invoice.totalAmount || 0), 0), 0);

    return { monthIndex, label, amount };
  });
};

export const buildCustomerSalesRowsFromInvoices = (
  parties: Party[],
  invoices: Invoice[]
): CustomerSalesRow[] => {
  const salesInvoices = invoices.filter((invoice) => SALES_INVOICE_TYPES.includes(invoice.type));
  const partyMap = new Map(parties.map((party) => [party.id, party]));
  const groupedRows = new Map<
    string,
    {
      id: string;
      partyName: string;
      amount: number;
      type: Party["type"];
      ledgersCount: number;
    }
  >();

  salesInvoices.forEach((invoice) => {
    const fallbackName =
      invoice.party?.partyName?.trim() ||
      partyMap.get(invoice.partyId)?.partyName?.trim() ||
      "Unknown Customer";
    const rowId = String(invoice.partyId || invoice.party?.id || fallbackName);
    const currentRow = groupedRows.get(rowId) ?? {
      id: rowId,
      partyName: fallbackName,
      amount: 0,
      type: partyMap.get(invoice.partyId)?.type ?? "customer",
      ledgersCount: 0,
    };

    currentRow.amount += Math.max(Number(invoice.totalAmount || 0), 0);
    currentRow.ledgersCount += 1;
    currentRow.partyName = fallbackName;
    currentRow.type = partyMap.get(invoice.partyId)?.type ?? currentRow.type;

    groupedRows.set(rowId, currentRow);
  });

  return Array.from(groupedRows.values())
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

export const buildMonthlyReceiptSeriesFromDayBook = (
  dayBook: DayBook[],
  year: number
): MonthlySalesPoint[] => {
  return MONTH_LABELS.map((label, monthIndex) => {
    const amount = dayBook
      .filter((entry) => {
        const rawDate = entry.transactionDate || entry.entryDate;
        if (!rawDate) return false;
        const date = new Date(rawDate);
        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === year &&
          date.getMonth() === monthIndex &&
          entry.voucherType === "receipt" &&
          (entry.side === "debit" || entry.transactionType === "debit")
        );
      })
      .reduce((sum, entry) => sum + Math.max(Number(entry.amount || 0), 0), 0);

    return { monthIndex, label, amount };
  });
};

const extractReceiptCustomerName = (
  narration?: string | null,
  lines: VoucherEntry["lines"] = []
) => {
  const text = String(narration ?? "").trim();
  const creditLineName = lines.find((line) => line.side === "credit")?.ledgerName?.trim();
  const debitLineName = lines.find((line) => line.side === "debit")?.ledgerName?.trim();

  if (!text) {
    return creditLineName || debitLineName || "Unknown Customer";
  }

  const patterns = [
    /^Receipt\s+from\s+(.+?)(?:\s+against\s+.+)?$/i,
    /^Receipt\s+against\s+(.+?)(?:\s+against\s+.+)?$/i,
    /^Receipt\s+for\s+(.+?)(?:\s+against\s+.+)?$/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return (
    creditLineName ||
    debitLineName ||
    text.replace(/^Receipt\s*/i, "").trim() ||
    "Unknown Customer"
  );
};

const getReceiptAmount = (voucher: VoucherEntry) =>
  voucher.lines
    .filter((line) => line.side === "debit")
    .reduce((sum, line) => sum + Math.max(Number(line.amount || 0), 0), 0) ||
  voucher.lines
    .filter((line) => line.side === "credit")
    .reduce((sum, line) => sum + Math.max(Number(line.amount || 0), 0), 0) ||
  voucher.lines.reduce((sum, line) => sum + Math.max(Number(line.amount || 0), 0), 0);

export type ReceiptCustomerRow = {
  id: string;
  customerName: string;
  amount: number;
  entriesCount: number;
};

export type ReceiptEntryRow = {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  customerName: string;
  amount: number;
  status: "unpaid" | "paid";
};

export const buildMonthlyReceiptSeriesFromVouchers = (
  vouchers: VoucherEntry[],
  year: number
): MonthlySalesPoint[] => {
  const receiptVouchers = vouchers.filter((voucher) => RECEIPT_VOUCHER_TYPES.includes(voucher.voucherType));

  return MONTH_LABELS.map((label, monthIndex) => {
    const amount = receiptVouchers
      .filter((voucher) => {
        const date = new Date(voucher.entryDate);
        return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === monthIndex;
      })
      .reduce((sum, voucher) => sum + getReceiptAmount(voucher), 0);

    return { monthIndex, label, amount };
  });
};

export const buildReceiptCustomerRows = (vouchers: VoucherEntry[]): ReceiptCustomerRow[] => {
  const receiptVouchers = vouchers.filter((voucher) => RECEIPT_VOUCHER_TYPES.includes(voucher.voucherType));
  const grouped = new Map<string, ReceiptCustomerRow>();

  receiptVouchers.forEach((voucher) => {
    const resolvedCustomerName = extractReceiptCustomerName(voucher.narration, voucher.lines);
    const id = resolvedCustomerName.toLowerCase();
    const current = grouped.get(id) ?? {
      id,
      customerName: resolvedCustomerName,
      amount: 0,
      entriesCount: 0,
    };

    current.amount += getReceiptAmount(voucher);
    current.entriesCount += 1;
    current.customerName = resolvedCustomerName;
    grouped.set(id, current);
  });

  return Array.from(grouped.values())
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

export const buildReceiptEntriesForCustomer = (
  vouchers: VoucherEntry[],
  customerName: string
): ReceiptEntryRow[] => {
  const target = customerName.trim().toLowerCase();
  return vouchers
    .filter((voucher) => RECEIPT_VOUCHER_TYPES.includes(voucher.voucherType))
    .map((voucher) => ({
      id: voucher.id,
      receiptNumber: voucher.voucherNumber || `RCT-${voucher.id.slice(0, 6)}`,
      receiptDate: voucher.entryDate,
      customerName: extractReceiptCustomerName(voucher.narration, voucher.lines),
      amount: getReceiptAmount(voucher),
      status: "paid" as const,
    }))
    .filter((row) => row.customerName.toLowerCase() === target)
    .sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime());
};
