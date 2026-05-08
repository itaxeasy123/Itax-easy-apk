import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../../../api/client";
import { endpoints } from "../../../api/endpoints";
import { VoucherEntry, VoucherLine, VoucherType } from "../types/accountingTypes";

const VOUCHER_CACHE_KEY = "accounting_vouchers_cache";
type RawVoucher = Record<string, unknown> & { lines?: unknown[] };

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const normalizeVoucher = (voucher: unknown): VoucherEntry => {
  const source = (voucher ?? {}) as RawVoucher;
  return {
    id: String(source.id ?? makeId()),
    voucherNumber: String(source.voucherNumber ?? source.voucherNo ?? ""),
    voucherType: (source.voucherType ?? "journal") as VoucherType,
    entryDate: String(source.entryDate ?? new Date().toISOString()),
    narration: String(source.narration ?? ""),
    lines: Array.isArray(source.lines)
      ? source.lines.map((line) => {
          const lineSource = (line ?? {}) as Record<string, unknown>;
          return {
            id: String(lineSource.id ?? makeId()),
            ledgerId: String(lineSource.ledgerId ?? ""),
            ledgerName: String(lineSource.ledgerName ?? ""),
            side: (lineSource.side ?? lineSource.transactionType ?? "debit") as VoucherLine["side"],
            amount: Number(lineSource.amount ?? 0),
          };
        })
      : [],
    totalDebit: Number(source.totalDebit ?? 0),
    totalCredit: Number(source.totalCredit ?? 0),
    createdAt: String(source.createdAt ?? new Date().toISOString()),
    updatedAt: String(source.updatedAt ?? new Date().toISOString()),
  };
};

const readVouchers = async (): Promise<VoucherEntry[]> => {
  const stored = await AsyncStorage.getItem(VOUCHER_CACHE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeVoucher) : [];
  } catch {
    return [];
  }
};

const writeVouchers = async (vouchers: VoucherEntry[]) => {
  await AsyncStorage.setItem(VOUCHER_CACHE_KEY, JSON.stringify(vouchers));
};

export const voucherService = {
  getAll: async () => {
    const data = await readVouchers();
    return { success: true, data };
  },

  getById: async (id: string) => {
    const vouchers = await readVouchers();
    const voucher = vouchers.find((item) => item.id === id);
    return { success: true, data: voucher };
  },

  create: async (data: {
    voucherNumber: string;
    voucherType: VoucherType;
    entryDate: string;
    narration: string;
    lines: VoucherLine[];
  }) => {
    const vouchers = await readVouchers();
    const totalDebit = data.lines
      .filter((line) => line.side === "debit")
      .reduce((sum, line) => sum + Number(line.amount || 0), 0);
    const totalCredit = data.lines
      .filter((line) => line.side === "credit")
      .reduce((sum, line) => sum + Number(line.amount || 0), 0);

    const voucher: VoucherEntry = {
      id: makeId(),
      voucherNumber: data.voucherNumber,
      voucherType: data.voucherType,
      entryDate: data.entryDate,
      narration: data.narration,
      lines: data.lines.map((line) => ({
        ...line,
        id: line.id || makeId(),
      })),
      totalDebit,
      totalCredit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const next = [voucher, ...vouchers];
    await writeVouchers(next);

    try {
      await apiClient.post(endpoints.accounting.journalEntries, {
        entryDate: data.entryDate,
        description: data.narration,
        transactions: data.lines.map((line) => ({
          ledgerId: line.ledgerId,
          amount: Number(line.amount || 0),
          transactionType: line.side,
        })),
      });
    } catch {
      // Keep the local voucher cache working even if the backend sync is temporarily unavailable.
    }

    return { success: true, data: voucher };
  },

  delete: async (id: string) => {
    const vouchers = await readVouchers();
    const next = vouchers.filter((voucher) => voucher.id !== id);
    await writeVouchers(next);
    return { success: true };
  },
};
