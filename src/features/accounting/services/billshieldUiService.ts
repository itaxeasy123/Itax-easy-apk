/**
 * UI-facing BillShield helpers — chart-of-accounts tree, fiscal years,
 * reports, bankbook reconciliation.
 *
 * Now backed by the on-device SQLite engine (../local/engine) instead of
 * the server. Return shapes are unchanged so the screens keep working.
 */
import { companyService } from './companyService';
import * as engine from '../local/engine';

export type { AccountGroupNode } from '../local/engine';

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

const fail = (error: any, fallback: string) => error?.message ?? fallback;

export const billshieldUiService = {
  // ---- chart of accounts ----
  getGroupTree: async () => {
    try {
      const companyId = await companyService.ensureCompanyId();
      return { success: true, data: await engine.getGroupTree(companyId) };
    } catch (error: any) {
      return { success: false, data: [], message: fail(error, 'Unable to load chart of accounts') };
    }
  },

  listLedgers: async () => {
    try {
      const companyId = await companyService.ensureCompanyId();
      return { success: true, data: await engine.listLedgers(companyId) };
    } catch (error: any) {
      return { success: false, data: [], message: fail(error, 'Unable to list ledgers') };
    }
  },

  createSubGroup: async (name: string, parentGroupId: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const data = await engine.createSubGroup(companyId, name, parentGroupId);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, message: fail(error, 'Unable to create group') };
    }
  },

  deleteGroup: async (groupId: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      await engine.deleteGroup(companyId, groupId);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: fail(error, 'Unable to delete group') };
    }
  },

  // ---- fiscal years ----
  listFiscalYears: async (): Promise<{ success: boolean; data: FiscalYearInfo[]; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      return { success: true, data: (await engine.listFiscalYears(companyId)) as FiscalYearInfo[] };
    } catch (error: any) {
      return { success: false, data: [], message: fail(error, 'Unable to load fiscal years') };
    }
  },

  closeFiscalYear: async (fiscalYearId: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      return { success: true, data: await engine.closeFiscalYear(companyId, fiscalYearId) };
    } catch (error: any) {
      return { success: false, message: fail(error, 'Unable to close fiscal year') };
    }
  },

  // ---- reports ----
  getTrialBalance: async (asOf?: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const d = await engine.trialBalance(companyId, asOf);
      return { success: true, data: d };
    } catch (error: any) {
      return { success: false, data: { ledgers: [], totals: { debit: 0, credit: 0 } }, message: fail(error, 'Unable to load trial balance') };
    }
  },

  getBalanceSheet: async (asOf?: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const d = await engine.balanceSheet(companyId, asOf);
      return { success: true, data: d };
    } catch (error: any) {
      return {
        success: false,
        data: { assets: [], liabilities: [], totals: { assets: 0, liabilities: 0, difference: 0 } },
        message: fail(error, 'Unable to load balance sheet'),
      };
    }
  },

  /** "Add New Entry" on the Balance Sheet screen — books a real journal
   *  voucher (chosen category's adjustment ledger vs Suspense A/c). */
  addBalanceSheetEntry: async (input: {
    category: string;
    side: 'assets' | 'liabilities';
    date: string;
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

      const groups = await engine.listGroups(companyId);
      const ledgers = await engine.listLedgers(companyId);
      const findGroup = (name: string) => groups.find((g: any) => g.name === name);

      const ensureLedger = async (name: string, group: string) => {
        const found = ledgers.find((l: any) => l.name === name);
        if (found) return found;
        return engine.createLedger(companyId, { name, groupId: findGroup(group)?.id });
      };

      const entryLedger = await ensureLedger(`${input.category} Adjustment A/c`, groupName);
      const suspense = await ensureLedger('Suspense A/c', 'Suspense Account');

      const debitFirst = input.side === 'assets';
      const voucher = await engine.createVoucher(companyId, 0, {
        voucherTypeCode: 'JRN',
        voucherDate: input.date,
        narration: `Balance sheet entry — ${input.category} (via Suspense)`,
        post: true,
        lines: [
          { ledgerId: entryLedger.id, debit: debitFirst ? input.amount : 0, credit: debitFirst ? 0 : input.amount },
          { ledgerId: suspense.id, debit: debitFirst ? 0 : input.amount, credit: debitFirst ? input.amount : 0 },
        ],
      });
      return { success: true, data: voucher };
    } catch (error: any) {
      return { success: false, message: fail(error, 'Unable to save the entry') };
    }
  },

  getLedgerStatement: async (ledgerId: string, from?: string, to?: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const d = await engine.ledgerStatement(companyId, ledgerId, from, to);
      return { success: true, data: d };
    } catch (error: any) {
      return { success: false, data: null, message: fail(error, 'Unable to load ledger statement') };
    }
  },

  /** Cash flow from trial-balance movement between two dates. */
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

      const netCashFlow = delta(isCashBank);
      const investingCashFlow = -delta(isInvesting);
      const financingCashFlow = -delta(isFinancing);
      const operatingCashFlow = netCashFlow - investingCashFlow - financingCashFlow;

      return { success: true, data: { operatingCashFlow, investingCashFlow, financingCashFlow, netCashFlow } };
    } catch (error: any) {
      return { success: false, data: null, message: fail(error, 'Unable to compute cash flow') };
    }
  },

  getProfitAndLoss: async (from?: string, to?: string) => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const d = await engine.profitAndLoss(companyId, from, to);
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
      return { success: false, data: null, message: fail(error, 'Unable to load profit & loss') };
    }
  },

  // ---- bankbook + reconciliation ----
  getBankbook: async (): Promise<{ success: boolean; data: BankbookRow[]; message?: string }> => {
    try {
      const companyId = await companyService.ensureCompanyId();
      const rows = await engine.bankbook(companyId);
      return {
        success: true,
        data: rows.map((r: any) => ({
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
      return { success: false, data: [], message: fail(error, 'Unable to load bankbook') };
    }
  },

  reconcileLine: async (
    lineId: string,
    data: { instrumentNo?: string; instrumentDate?: string; clearedOn?: string | null; statementRef?: string }
  ) => {
    try {
      await engine.reconcileLine(lineId, data);
      return { success: true, data: { lineId, ...data } };
    } catch (error: any) {
      return { success: false, message: fail(error, 'Unable to save reconciliation') };
    }
  },
};
