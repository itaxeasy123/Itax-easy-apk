import { Ledger } from "../types/accountingTypes";

export const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const todayInputValue = () => new Date().toISOString().slice(0, 10);

export const addDaysInputValue = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const formatMoney = (value: number) =>
  `Rs ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

export const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

export const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const findLedgerByType = (
  ledgers: Ledger[],
  types: Ledger["ledgerType"] | Ledger["ledgerType"][]
) => {
  const allowed = Array.isArray(types) ? types : [types];
  return ledgers.find((ledger) => allowed.includes(ledger.ledgerType));
};

export const safeString = (value: unknown) => String(value ?? "").trim();
