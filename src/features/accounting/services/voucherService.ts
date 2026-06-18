import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../../../api/client";
import { endpoints } from "../../../api/endpoints";
import { VoucherEntry, VoucherLine, VoucherType } from "../types/accountingTypes";
import { companyService } from "./companyService";

/** App voucher types → BillShield voucher type codes. */
const VOUCHER_TYPE_CODE: Record<string, string> = {
  journal: "JRN",
  payment: "PMT",
  receipt: "RCT",
  contra: "CNT",
  sales: "SAL",
  purchase: "PUR",
  debitNote: "DRN",
  creditNote: "CRN",
};

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

/** BillShield server voucher type names → app VoucherType keys. */
const SERVER_NAME_TO_TYPE: Record<string, VoucherType> = {
  journal: "journal",
  payment: "payment",
  receipt: "receipt",
  contra: "contra",
  sales: "sales",
  purchase: "purchase",
  "debit note": "debitNote",
  "credit note": "creditNote",
};

/** Maps a BillShield server voucher to the app's VoucherEntry shape. */
const fromServerVoucher = (raw: any): VoucherEntry => {
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  const totalDebit = lines.reduce((s: number, l: any) => s + Number(l?.debit ?? 0), 0);
  const totalCredit = lines.reduce((s: number, l: any) => s + Number(l?.credit ?? 0), 0);
  return {
    id: String(raw?.id ?? makeId()),
    voucherNumber: String(raw?.voucherNo ?? "Draft"),
    voucherType:
      SERVER_NAME_TO_TYPE[String(raw?.voucherType?.name ?? "journal").toLowerCase()] ?? "journal",
    entryDate: String(raw?.voucherDate ?? new Date().toISOString()),
    narration: String(raw?.narration ?? ""),
    lines: lines.map((l: any) => ({
      id: String(l?.id ?? makeId()),
      ledgerId: String(l?.ledgerId ?? ""),
      ledgerName: String(l?.ledger?.name ?? ""),
      side: Number(l?.debit ?? 0) > 0 ? "debit" : "credit",
      amount: Number(l?.debit ?? 0) > 0 ? Number(l?.debit) : Number(l?.credit ?? 0),
    })),
    totalDebit,
    totalCredit,
    status: raw?.status,
    partyName: raw?.party?.partyName ?? undefined,
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw?.updatedAt ?? new Date().toISOString()),
  };
};

export const voucherService = {
  getAll: async () => {
    const data = await readVouchers();
    return { success: true, data };
  },

  /** Vouchers straight from BillShield (source of truth). Falls back to
   *  the local cache when offline. */
  getAllFromServer: async (): Promise<{ success: boolean; data: VoucherEntry[]; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.get(endpoints.billshield.vouchers(companyId), {
        params: { limit: 200 },
      });
      const vouchers = Array.isArray(response.data?.data)
        ? response.data.data.map(fromServerVoucher)
        : [];
      return { success: true, data: vouchers };
    } catch {
      const cached = await readVouchers();
      return { success: false, data: cached, message: "Showing offline copies — could not reach the server." };
    }
  },

  /** Reverses a POSTED voucher (the double-entry way to undo). */
  reverse: async (voucherId: string): Promise<{ success: boolean; data?: VoucherEntry; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.post(
        endpoints.billshield.reverseVoucher(companyId, voucherId),
        {}
      );
      return {
        success: Boolean(response.data?.success),
        data: response.data?.data ? fromServerVoucher(response.data.data) : undefined,
        message: response.data?.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.response?.data?.message ?? "Unable to reverse voucher",
      };
    }
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
    gstLines?: {
      hsnSac?: string;
      description?: string;
      taxableValue: number;
      cgst?: number;
      sgst?: number;
      igst?: number;
      cess?: number;
    }[];
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
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.post(endpoints.billshield.vouchers(companyId), {
        voucherTypeCode: VOUCHER_TYPE_CODE[data.voucherType] ?? "JRN",
        voucherDate: data.entryDate,
        narration: data.narration,
        post: true,
        lines: data.lines.map((line) => ({
          ledgerId: line.ledgerId,
          debit: line.side === "debit" ? Number(line.amount || 0) : 0,
          credit: line.side === "credit" ? Number(line.amount || 0) : 0,
        })),
        ...(data.gstLines?.length ? { gstLines: data.gstLines } : {}),
      });
      // Adopt the server-assigned voucher number (e.g. JRN/2025-26/0001)
      const serverVoucher = response.data?.data;
      if (serverVoucher?.voucherNo) {
        voucher.voucherNumber = serverVoucher.voucherNo;
        voucher.id = String(serverVoucher.id ?? voucher.id);
        await writeVouchers([voucher, ...vouchers]);
      }
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

  /** Deletes a server-side DRAFT voucher (posted ones must be reversed). */
  deleteDraftOnServer: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.delete(endpoints.billshield.voucherById(companyId, id));
      return { success: Boolean(response.data?.success), message: response.data?.message };
    } catch (error: any) {
      return { success: false, message: error?.response?.data?.message ?? "Unable to delete draft" };
    }
  },
};
