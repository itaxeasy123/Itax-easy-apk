/**
 * Vouchers — now read/written through the on-device SQLite engine
 * (../local/engine). The app's VoucherEntry shape is preserved so the
 * screens are unchanged.
 */
import { VoucherEntry, VoucherLine, VoucherType } from "../types/accountingTypes";
import { companyService } from "./companyService";
import * as engine from "../local/engine";

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

/** BillShield voucher type names → app VoucherType keys. */
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

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/** Maps an engine voucher row to the app's VoucherEntry shape. */
const fromEngineVoucher = (raw: any): VoucherEntry => {
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
      ledgerName: String(l?.ledgerName ?? l?.ledger?.name ?? ""),
      side: Number(l?.debit ?? 0) > 0 ? "debit" : "credit",
      amount: Number(l?.debit ?? 0) > 0 ? Number(l?.debit) : Number(l?.credit ?? 0),
    })),
    totalDebit,
    totalCredit,
    status: raw?.status,
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw?.updatedAt ?? new Date().toISOString()),
  };
};

export const voucherService = {
  getAll: async () => {
    const companyId = await companyService.ensureCompanyId();
    const data = (await engine.listVouchers(companyId)).map(fromEngineVoucher);
    return { success: true, data };
  },

  /** Kept for call-site compatibility — vouchers come from the local DB. */
  getAllFromServer: async (): Promise<{ success: boolean; data: VoucherEntry[]; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const data = (await engine.listVouchers(companyId)).map(fromEngineVoucher);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, data: [], message: error?.message ?? "Unable to load vouchers" };
    }
  },

  reverse: async (voucherId: string): Promise<{ success: boolean; data?: VoucherEntry; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const reversed = await engine.reverseVoucher(companyId, 0, voucherId);
      return { success: true, data: reversed ? fromEngineVoucher(reversed) : undefined };
    } catch (error: any) {
      return { success: false, message: error?.message ?? "Unable to reverse voucher" };
    }
  },

  getById: async (id: string) => {
    const companyId = await companyService.ensureCompanyId();
    const voucher = await engine.getVoucher(companyId, id);
    return { success: true, data: voucher ? fromEngineVoucher(voucher) : undefined };
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
    try {
      const companyId = await companyService.ensureCompanyId();
      const created = await engine.createVoucher(companyId, 0, {
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
      return { success: true, data: created ? fromEngineVoucher(created) : undefined };
    } catch (error: any) {
      return { success: false, message: error?.message ?? "Unable to save voucher" };
    }
  },

  delete: async (id: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      await engine.deleteDraftVoucher(companyId, id);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message ?? "Unable to delete voucher" };
    }
  },

  deleteDraftOnServer: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      await engine.deleteDraftVoucher(companyId, id);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message ?? "Unable to delete draft" };
    }
  },
};
