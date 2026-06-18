/**
 * UI-facing helpers for BillShield features that have no legacy
 * equivalent: chart-of-accounts tree, fiscal years, bankbook
 * reconciliation. All methods resolve the active company themselves.
 */
import { apiClient } from '../../../api/client';
import { endpoints } from '../../../api/endpoints';
import { companyService } from './companyService';

export interface AccountGroupNode {
  id: string;
  name: string;
  nature: 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';
  reportSection: string;
  isSystem: boolean;
  path: string;
  parentGroupId: string | null;
  subGroups: AccountGroupNode[];
  ledgers: { id: string; name: string; isSystem: boolean }[];
}

export interface FiscalYearInfo {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

export interface BankbookRow {
  lineId: string;
  ledgerId: string;
  ledgerName: string;
  voucherNo: string;
  voucherDate: string;
  voucherType: string;
  narration: string | null;
  debit: number;
  credit: number;
  runningBalance: number;
  instrumentNo: string | null;
  instrumentDate: string | null;
  clearedOn: string | null;
  statementRef: string | null;
}

const errMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? error?.message ?? fallback;

export const billshieldUiService = {
  // ---- chart of accounts ----
  getGroupTree: async (): Promise<{ success: boolean; data: AccountGroupNode[]; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.get(endpoints.billshield.groupTree(companyId));
      return { success: true, data: Array.isArray(response.data?.data) ? response.data.data : [] };
    } catch (error: any) {
      return { success: false, data: [], message: errMessage(error, 'Unable to load chart of accounts') };
    }
  },

  createSubGroup: async (name: string, parentGroupId: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.post(endpoints.billshield.groups(companyId), {
        name,
        parentGroupId,
      });
      return { success: Boolean(response.data?.success), data: response.data?.data };
    } catch (error: any) {
      return { success: false, message: errMessage(error, 'Unable to create group') };
    }
  },

  deleteGroup: async (groupId: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.delete(`${endpoints.billshield.groups(companyId)}/${groupId}`);
      return { success: Boolean(response.data?.success), message: response.data?.message };
    } catch (error: any) {
      return { success: false, message: errMessage(error, 'Unable to delete group') };
    }
  },

  // ---- fiscal years ----
  listFiscalYears: async (): Promise<{ success: boolean; data: FiscalYearInfo[]; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.get(endpoints.billshield.fiscalYears(companyId));
      return { success: true, data: Array.isArray(response.data?.data) ? response.data.data : [] };
    } catch (error: any) {
      return { success: false, data: [], message: errMessage(error, 'Unable to load fiscal years') };
    }
  },

  closeFiscalYear: async (fiscalYearId: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.post(
        `${endpoints.billshield.fiscalYears(companyId)}/${fiscalYearId}/close`
      );
      return { success: Boolean(response.data?.success), data: response.data?.data };
    } catch (error: any) {
      return { success: false, message: errMessage(error, 'Unable to close fiscal year') };
    }
  },

  // ---- reports (live from the journal) ----
  getTrialBalance: async (asOf?: string): Promise<{
    success: boolean;
    data: {
      ledgers: {
        ledgerId: string;
        ledgerName: string;
        groupName: string;
        groupPath: string;
        nature: 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';
        debit: number;
        credit: number;
      }[];
      totals: { debit: number; credit: number };
    };
    message?: string;
  }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.get(endpoints.billshield.trialBalance(companyId), {
        params: asOf ? { asOf } : {},
      });
      const d = response.data?.data ?? { ledgers: [], totals: { debit: 0, credit: 0 } };
      return {
        success: true,
        data: {
          ledgers: (d.ledgers ?? []).map((r: any) => ({
            ledgerId: String(r.ledgerId),
            ledgerName: String(r.ledgerName),
            groupName: String(r.groupName ?? ""),
            groupPath: String(r.groupPath ?? ""),
            nature: r.nature ?? 'ASSET',
            debit: Number(r.debit ?? 0),
            credit: Number(r.credit ?? 0),
          })),
          totals: { debit: Number(d.totals?.debit ?? 0), credit: Number(d.totals?.credit ?? 0) },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: { ledgers: [], totals: { debit: 0, credit: 0 } },
        message: errMessage(error, 'Unable to load trial balance'),
      };
    }
  },

  getBalanceSheet: async (asOf?: string): Promise<{
    success: boolean;
    data: {
      assets: { group: string; amount: number }[];
      liabilities: { group: string; amount: number }[];
      totals: { assets: number; liabilities: number; difference: number };
    };
    message?: string;
  }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.get(endpoints.billshield.balanceSheet(companyId), {
        params: asOf ? { asOf } : {},
      });
      const d = response.data?.data ?? { assets: [], liabilities: [], totals: { assets: 0, liabilities: 0, difference: 0 } };
      return {
        success: true,
        data: {
          assets: (d.assets ?? []).map((r: any) => ({ group: String(r.group), amount: Number(r.amount ?? 0) })),
          liabilities: (d.liabilities ?? []).map((r: any) => ({ group: String(r.group), amount: Number(r.amount ?? 0) })),
          totals: {
            assets: Number(d.totals?.assets ?? 0),
            liabilities: Number(d.totals?.liabilities ?? 0),
            difference: Number(d.totals?.difference ?? 0),
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: { assets: [], liabilities: [], totals: { assets: 0, liabilities: 0, difference: 0 } },
        message: errMessage(error, 'Unable to load balance sheet'),
      };
    }
  },

  /**
   * "Add New Entry" on the Balance Sheet screen. Books a REAL journal
   * voucher so the entry shows up in the balance sheet and the books
   * stay balanced: the chosen category's adjustment ledger on one side,
   * Suspense A/c on the other (the standard treatment for a one-sided
   * entry until it is classified properly).
   */
  addBalanceSheetEntry: async (input: {
    category: string; // UI category label
    side: 'assets' | 'liabilities';
    date: string; // ISO YYYY-MM-DD
    amount: number;
  }) => {
    const CATEGORY_TO_GROUP: Record<string, string> = {
      'Current Assets': 'Current Assets',
      'Fixed Assets': 'Fixed Assets',
      Investments: 'Investments',
      'Loans Advance': 'Loans & Advances (Asset)',
      'Current Liabilities': 'Current Liabilities',
      Capital: 'Capital Account',
      Loan: 'Loans (Liability)',
    };
    try {
      const companyId = await companyService.ensureCompanyId();
      const groupName = CATEGORY_TO_GROUP[input.category];
      if (!groupName) return { success: false, message: `Unknown category "${input.category}"` };

      const [groupsRes, ledgersRes] = await Promise.all([
        apiClient.get(endpoints.billshield.groups(companyId)),
        apiClient.get(endpoints.billshield.ledgers(companyId)),
      ]);
      const groups: any[] = groupsRes.data?.data ?? [];
      const ledgers: any[] = ledgersRes.data?.data ?? [];
      const findGroup = (name: string) => groups.find((g) => g.name === name);

      const ensureLedger = async (name: string, group: string) => {
        const found = ledgers.find((l) => l.name === name);
        if (found) return found;
        const created = await apiClient.post(endpoints.billshield.ledgers(companyId), {
          name,
          groupId: findGroup(group)?.id,
        });
        return created.data?.data;
      };

      const entryLedger = await ensureLedger(`${input.category} Adjustment A/c`, groupName);
      const suspense = await ensureLedger('Suspense A/c', 'Suspense Account');

      const debitFirst = input.side === 'assets'; // assets increase on the debit side
      const response = await apiClient.post(endpoints.billshield.vouchers(companyId), {
        voucherTypeCode: 'JRN',
        voucherDate: input.date,
        narration: `Balance sheet entry — ${input.category} (via Suspense)`,
        post: true,
        lines: [
          { ledgerId: entryLedger.id, debit: debitFirst ? input.amount : 0, credit: debitFirst ? 0 : input.amount },
          { ledgerId: suspense.id, debit: debitFirst ? 0 : input.amount, credit: debitFirst ? input.amount : 0 },
        ],
      });
      return {
        success: Boolean(response.data?.success),
        data: response.data?.data,
        message: response.data?.message,
      };
    } catch (error: any) {
      return { success: false, message: errMessage(error, 'Unable to save the entry') };
    }
  },

  /** Account statement for one ledger: opening → entries with running balance → closing. */
  getLedgerStatement: async (
    ledgerId: string,
    from?: string,
    to?: string
  ): Promise<{
    success: boolean;
    data: {
      ledger: { id: string; name: string; group: string };
      opening: { amount: number; type: 'DR' | 'CR' };
      entries: {
        voucherNo: string;
        voucherDate: string;
        voucherType: string;
        narration: string | null;
        debit: number;
        credit: number;
        runningBalance: number;
      }[];
      closing: { amount: number; type: 'DR' | 'CR' };
    } | null;
    message?: string;
  }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.get(endpoints.billshield.ledgerStatement(companyId, ledgerId), {
        params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
      });
      const d = response.data?.data;
      if (!d) return { success: false, data: null, message: 'Statement unavailable' };
      return {
        success: true,
        data: {
          ledger: { id: String(d.ledger?.id), name: String(d.ledger?.name), group: String(d.ledger?.group ?? '') },
          opening: { amount: Number(d.opening?.amount ?? 0), type: d.opening?.type ?? 'DR' },
          entries: (d.entries ?? []).map((e: any) => ({
            voucherNo: String(e.voucherNo ?? ''),
            voucherDate: String(e.voucherDate ?? ''),
            voucherType: String(e.voucherType ?? ''),
            narration: e.narration ?? null,
            debit: Number(e.debit ?? 0),
            credit: Number(e.credit ?? 0),
            runningBalance: Number(e.runningBalance ?? 0),
          })),
          closing: { amount: Number(d.closing?.amount ?? 0), type: d.closing?.type ?? 'DR' },
        },
      };
    } catch (error: any) {
      return { success: false, data: null, message: errMessage(error, 'Unable to load ledger statement') };
    }
  },

  /**
   * Cash flow (indirect-style) computed from REAL trial-balance movement
   * between two dates: net cash = Δ(cash+bank ledgers); financing =
   * Δ(Capital + Loans) credit-side; investing = −Δ(Fixed Assets +
   * Investments); operating = net − investing − financing.
   */
  getCashFlow: async (from: string, to: string) => {
    try {
      const dayBefore = (iso: string) => {
        const d = new Date(iso);
        d.setDate(d.getDate() - 1);
        return d.toISOString();
      };
      const [start, end] = await Promise.all([
        billshieldUiService.getTrialBalance(dayBefore(from)),
        billshieldUiService.getTrialBalance(to),
      ]);
      if (!start.success || !end.success) {
        return { success: false, data: null, message: start.message ?? end.message };
      }
      const net = (rows: typeof end.data.ledgers, pred: (r: (typeof end.data.ledgers)[number]) => boolean) =>
        rows.filter(pred).reduce((s, r) => s + r.debit - r.credit, 0);
      const delta = (pred: (r: (typeof end.data.ledgers)[number]) => boolean) =>
        net(end.data.ledgers, pred) - net(start.data.ledgers, pred);

      const isCashBank = (r: any) =>
        r.groupPath.startsWith('current-assets/cash-in-hand') ||
        r.groupPath.startsWith('current-assets/bank-accounts') ||
        r.groupPath.startsWith('loans-liability/bank-od-occ-accounts');
      const isInvesting = (r: any) =>
        r.groupPath.startsWith('fixed-assets') || r.groupPath.startsWith('investments');
      const isFinancing = (r: any) =>
        (r.groupPath.startsWith('capital-account') || r.groupPath.startsWith('loans-liability')) &&
        !r.groupPath.startsWith('loans-liability/bank-od-occ-accounts');

      const netCashFlow = delta(isCashBank); // Dr-positive: cash gained
      const investingCashFlow = -delta(isInvesting); // buying assets consumes cash
      const financingCashFlow = -delta(isFinancing); // credit growth (capital/loans) brings cash in
      const operatingCashFlow = netCashFlow - investingCashFlow - financingCashFlow;

      return {
        success: true,
        data: { operatingCashFlow, investingCashFlow, financingCashFlow, netCashFlow },
      };
    } catch (error: any) {
      return { success: false, data: null, message: errMessage(error, 'Unable to compute cash flow') };
    }
  },

  /** Real Trading + P&L from the journal, flattened for the P&L screen. */
  getProfitAndLoss: async (from?: string, to?: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.get(endpoints.billshield.profitLoss(companyId), {
        params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
      });
      const d = response.data?.data;
      const sum = (rows: any[]) => (rows ?? []).reduce((s, r) => s + Number(r.amount ?? 0), 0);
      return {
        success: true,
        data: {
          salesAccounts: sum(d?.trading?.income),
          purchaseAccounts: sum(d?.trading?.expenses),
          grossProfit: Number(d?.trading?.grossProfit ?? 0),
          otherIncome: sum(d?.profitAndLoss?.income),
          otherExpenses: sum(d?.profitAndLoss?.expenses),
          netProfit: Number(d?.profitAndLoss?.netProfit ?? 0),
        },
      };
    } catch (error: any) {
      return { success: false, data: null, message: errMessage(error, 'Unable to load profit & loss') };
    }
  },

  // ---- bankbook + reconciliation ----
  getBankbook: async (): Promise<{ success: boolean; data: BankbookRow[]; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.get(endpoints.billshield.bankbook(companyId));
      const rows: any[] = Array.isArray(response.data?.data) ? response.data.data : [];
      return {
        success: true,
        data: rows.map((r) => ({
          lineId: String(r.lineId),
          ledgerId: String(r.ledgerId),
          ledgerName: String(r.ledgerName),
          voucherNo: String(r.voucherNo ?? ''),
          voucherDate: String(r.voucherDate ?? ''),
          voucherType: String(r.voucherType ?? ''),
          narration: r.narration ?? null,
          debit: Number(r.debit ?? 0),
          credit: Number(r.credit ?? 0),
          runningBalance: Number(r.runningBalance ?? 0),
          instrumentNo: r.instrumentNo ?? null,
          instrumentDate: r.instrumentDate ?? null,
          clearedOn: r.clearedOn ?? null,
          statementRef: r.statementRef ?? null,
        })),
      };
    } catch (error: any) {
      return { success: false, data: [], message: errMessage(error, 'Unable to load bankbook') };
    }
  },

  reconcileLine: async (
    lineId: string,
    data: { instrumentNo?: string; instrumentDate?: string; clearedOn?: string | null; statementRef?: string }
  ) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const response = await apiClient.put(
        `/billshield/companies/${companyId}/voucher-lines/${lineId}/reconcile`,
        data
      );
      return { success: Boolean(response.data?.success), data: response.data?.data };
    } catch (error: any) {
      return { success: false, message: errMessage(error, 'Unable to save reconciliation') };
    }
  },
};
