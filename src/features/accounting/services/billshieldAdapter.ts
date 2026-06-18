/**
 * Adapter between the app's legacy accounting shapes (Ledger with
 * ledgerName/ledgerType/balance) and the BillShield double-entry API
 * (company-scoped ledgers under an account-group tree). Screens keep
 * consuming the old shapes; only the service layer knows BillShield.
 */
import { apiClient } from '../../../api/client';
import { endpoints } from '../../../api/endpoints';
import { Ledger, LedgerType } from '../types/accountingTypes';

/** Old flat ledgerType → seeded BillShield group name. */
export const LEDGER_TYPE_TO_GROUP: Record<LedgerType, string> = {
  cash: 'Cash-in-Hand',
  bank: 'Bank Accounts',
  purchase: 'Purchase Accounts',
  sales: 'Sales Accounts',
  directExpense: 'Direct Expenses',
  indirectExpense: 'Indirect Expenses',
  directIncome: 'Direct Income',
  indirectIncome: 'Indirect Income',
  fixedAssets: 'Fixed Assets',
  currentAssets: 'Current Assets',
  loansAndLiabilitieslw: 'Loans (Liability)',
  accountsReceivable: 'Sundry Debtors',
  accountsPayable: 'Sundry Creditors',
};

/** BillShield group path → old flat ledgerType (most specific first). */
const PATH_TO_LEDGER_TYPE: [string, LedgerType][] = [
  ['current-assets/cash-in-hand', 'cash'],
  ['current-assets/bank-accounts', 'bank'],
  ['current-assets/sundry-debtors', 'accountsReceivable'],
  ['current-liabilities/sundry-creditors', 'accountsPayable'],
  ['loans-liability/bank-od-occ-accounts', 'bank'],
  ['sales-accounts', 'sales'],
  ['purchase-accounts', 'purchase'],
  ['direct-expenses', 'directExpense'],
  ['indirect-expenses', 'indirectExpense'],
  ['direct-income', 'directIncome'],
  ['indirect-income', 'indirectIncome'],
  ['fixed-assets', 'fixedAssets'],
  ['loans-liability', 'loansAndLiabilitieslw'],
  ['current-liabilities', 'loansAndLiabilitieslw'],
  ['current-assets', 'currentAssets'],
];

export const pathToLedgerType = (path: string | undefined): LedgerType => {
  if (path) {
    for (const [prefix, type] of PATH_TO_LEDGER_TYPE) {
      if (path === prefix || path.startsWith(`${prefix}/`)) return type;
    }
  }
  return 'currentAssets';
};

// ---- account groups (cached per company; the seeded tree rarely changes) ----
const groupCache = new Map<string, any[]>();

export const getGroups = async (companyId: string, force = false): Promise<any[]> => {
  if (!force && groupCache.has(companyId)) return groupCache.get(companyId)!;
  const response = await apiClient.get(endpoints.billshield.groups(companyId));
  const groups: any[] = Array.isArray(response.data?.data) ? response.data.data : [];
  groupCache.set(companyId, groups);
  return groups;
};

export const groupIdForLedgerType = async (
  companyId: string,
  ledgerType: LedgerType
): Promise<string> => {
  const groups = await getGroups(companyId);
  const wanted = LEDGER_TYPE_TO_GROUP[ledgerType];
  const group = groups.find((g) => g.name === wanted);
  if (!group) throw new Error(`Account group "${wanted}" not found`);
  return group.id;
};

/** Per-ledger closing balances from the trial balance (Dr positive). */
export const getBalancesByLedger = async (companyId: string): Promise<Map<string, number>> => {
  const response = await apiClient.get(endpoints.billshield.trialBalance(companyId));
  const rows: any[] = Array.isArray(response.data?.data?.ledgers) ? response.data.data.ledgers : [];
  return new Map(rows.map((r) => [String(r.ledgerId), Number(r.net ?? 0)]));
};

/** BillShield LedgerAccount → legacy Ledger shape the screens expect. */
export const toLegacyLedger = (
  raw: any,
  balances?: Map<string, number>
): Ledger => {
  const created = raw?.createdAt ? new Date(raw.createdAt) : new Date();
  const opening =
    Number(raw?.openingBalance ?? 0) * (raw?.openingBalanceType === 'CR' ? -1 : 1);
  return {
    id: String(raw?.id ?? ''),
    ledgerName: String(raw?.name ?? ''),
    openingBalance: opening,
    balance: balances?.get(String(raw?.id)) ?? opening,
    userId: '0',
    partyId: raw?.partyId ?? undefined,
    year: created.getFullYear(),
    month: created.getMonth(),
    ledgerType: pathToLedgerType(raw?.group?.path),
    createdAt: String(raw?.createdAt ?? new Date().toISOString()),
    updatedAt: String(raw?.updatedAt ?? new Date().toISOString()),
  };
};
