import { DayBook, Ledger } from "../types/accountingTypes";

export type BankCashTab = "bank" | "cash";

export type BankCashLedgerRow = {
  id: string;
  ledgerName: string;
  ledgerType: Ledger["ledgerType"];
  balance: number;
  openingBalance: number;
  updatedAt: string;
};

export type BankCashTransactionRow = {
  id: string;
  title: string;
  date: string;
  amount: number;
  side: "debit" | "credit";
  voucherType: string;
  voucherNumber: string;
  description: string;
  ledgerName: string;
};

export const BANK_LEDGER_TYPES: Ledger["ledgerType"][] = ["bank"];
export const CASH_LEDGER_TYPES: Ledger["ledgerType"][] = ["cash"];

export const formatCurrency = (value: number) =>
  `Rs ${Math.abs(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

export const titleCase = (value: string) =>
  value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const buildBankCashLedgerRows = (ledgers: Ledger[], tab: BankCashTab) => {
  const filtered = ledgers.filter((ledger) =>
    tab === "bank" ? BANK_LEDGER_TYPES.includes(ledger.ledgerType) : CASH_LEDGER_TYPES.includes(ledger.ledgerType)
  );

  const rows: BankCashLedgerRow[] = filtered
    .map((ledger) => ({
      id: ledger.id,
      ledgerName: ledger.ledgerName,
      ledgerType: ledger.ledgerType,
      balance: Number(ledger.balance || 0),
      openingBalance: Number(ledger.openingBalance || 0),
      updatedAt: ledger.updatedAt,
    }))
    .sort((a, b) => b.balance - a.balance);

  const total = rows.reduce((sum, row) => sum + row.balance, 0);

  return {
    rows,
    total,
    count: rows.length,
  };
};

export const buildBankCashSummary = (ledgers: Ledger[]) => {
  const bankRows = buildBankCashLedgerRows(ledgers, "bank");
  const cashRows = buildBankCashLedgerRows(ledgers, "cash");

  return {
    bankRows: bankRows.rows,
    cashRows: cashRows.rows,
    bankTotal: bankRows.total,
    cashTotal: cashRows.total,
  };
};

export const buildBankCashTransactions = (
  dayBook: DayBook[],
  ledgerId: string
): BankCashTransactionRow[] => {
  return dayBook
    .filter((entry) => entry.ledgerId === ledgerId)
    .map((entry) => {
      const amount = Number(entry.amount || 0);
      const side = (entry.side ?? entry.transactionType ?? "debit") as "debit" | "credit";

      return {
        id: entry.id,
        title: entry.voucherNumber || entry.description || entry.narration || entry.ledgerName || "Voucher",
        date: entry.transactionDate || entry.entryDate || new Date().toISOString(),
        amount,
        side,
        voucherType: titleCase(String(entry.voucherType ?? "journal")),
        voucherNumber: entry.voucherNumber || "",
        description: entry.description || entry.narration || "",
        ledgerName: entry.ledgerName || "",
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((row) => ({
      ...row,
      date: formatDate(row.date),
    }));
};
