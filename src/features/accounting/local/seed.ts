/**
 * Seeds a freshly created local company with the standard chart of
 * accounts, voucher types, system ledgers and the first fiscal year.
 * Ported 1:1 from the backend seed.service.ts so the books are identical
 * to what the server used to create.
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { nowIso, uuid } from './db';

interface GroupSeed {
  name: string;
  parent?: string;
  nature: 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';
  reportSection: 'BALANCE_SHEET' | 'TRADING' | 'PROFIT_AND_LOSS';
}

// 15 primary + 12 sub-groups (Tally convention)
const GROUP_SEEDS: GroupSeed[] = [
  { name: 'Capital Account', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Loans (Liability)', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Current Liabilities', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Fixed Assets', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Investments', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Current Assets', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Misc. Expenses (Asset)', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Suspense Account', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Branch / Divisions', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Sales Accounts', nature: 'INCOME', reportSection: 'TRADING' },
  { name: 'Purchase Accounts', nature: 'EXPENSE', reportSection: 'TRADING' },
  { name: 'Direct Income', nature: 'INCOME', reportSection: 'TRADING' },
  { name: 'Direct Expenses', nature: 'EXPENSE', reportSection: 'TRADING' },
  { name: 'Indirect Income', nature: 'INCOME', reportSection: 'PROFIT_AND_LOSS' },
  { name: 'Indirect Expenses', nature: 'EXPENSE', reportSection: 'PROFIT_AND_LOSS' },
  { name: 'Reserves & Surplus', parent: 'Capital Account', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Secured Loans', parent: 'Loans (Liability)', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Unsecured Loans', parent: 'Loans (Liability)', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Bank OD/OCC Accounts', parent: 'Loans (Liability)', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Sundry Creditors', parent: 'Current Liabilities', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Duties & Taxes', parent: 'Current Liabilities', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Provisions', parent: 'Current Liabilities', nature: 'LIABILITY', reportSection: 'BALANCE_SHEET' },
  { name: 'Cash-in-Hand', parent: 'Current Assets', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Bank Accounts', parent: 'Current Assets', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Sundry Debtors', parent: 'Current Assets', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Stock-in-Hand', parent: 'Current Assets', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Deposits (Asset)', parent: 'Current Assets', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
  { name: 'Loans & Advances (Asset)', parent: 'Current Assets', nature: 'ASSET', reportSection: 'BALANCE_SHEET' },
];

const VOUCHER_TYPE_SEEDS = [
  { code: 'PMT', name: 'Payment', baseType: 'PAYMENT' },
  { code: 'RCT', name: 'Receipt', baseType: 'RECEIPT' },
  { code: 'CNT', name: 'Contra', baseType: 'CONTRA' },
  { code: 'SAL', name: 'Sales', baseType: 'SALES' },
  { code: 'PUR', name: 'Purchase', baseType: 'PURCHASE' },
  { code: 'DRN', name: 'Debit Note', baseType: 'DEBIT_NOTE' },
  { code: 'CRN', name: 'Credit Note', baseType: 'CREDIT_NOTE' },
  { code: 'JRN', name: 'Journal', baseType: 'JOURNAL' },
];

const SYSTEM_LEDGER_SEEDS = [
  { name: 'Cash A/c', group: 'Cash-in-Hand' },
  { name: 'Profit & Loss A/c', group: 'Reserves & Surplus' },
  { name: 'Sales A/c', group: 'Sales Accounts' },
  { name: 'Purchase A/c', group: 'Purchase Accounts' },
  { name: 'CGST Input A/c', group: 'Duties & Taxes' },
  { name: 'CGST Output A/c', group: 'Duties & Taxes' },
  { name: 'SGST Input A/c', group: 'Duties & Taxes' },
  { name: 'SGST Output A/c', group: 'Duties & Taxes' },
  { name: 'IGST Input A/c', group: 'Duties & Taxes' },
  { name: 'IGST Output A/c', group: 'Duties & Taxes' },
];

/** Slug used for group `path` — matches the backend's path trigger output
 *  (e.g. "Loans (Liability)" → "loans-liability"). */
export function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Indian fiscal year (Apr 1 – Mar 31) containing the given date. */
export function fiscalYearBounds(date: Date) {
  const y = date.getUTCMonth() + 1 >= 4 ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
  return {
    startDate: new Date(Date.UTC(y, 3, 1)).toISOString(),
    endDate: new Date(Date.UTC(y + 1, 2, 31, 23, 59, 59, 999)).toISOString(),
    label: `${y}-${String((y + 1) % 100).padStart(2, '0')}`,
  };
}

/** Seeds default groups, voucher types, system ledgers and the first
 *  fiscal year. Call inside a transaction with the new company id. */
export async function seedCompanyDefaults(
  db: SQLiteDatabase,
  companyId: string,
  booksBeginDate: Date
): Promise<void> {
  const ts = nowIso();
  const idByName = new Map<string, string>();
  const pathByName = new Map<string, string>();

  for (const g of GROUP_SEEDS) {
    const id = uuid();
    const parentId = g.parent ? idByName.get(g.parent)! : null;
    const parentPath = g.parent ? pathByName.get(g.parent)! : '';
    const path = parentPath ? `${parentPath}/${slug(g.name)}` : slug(g.name);
    await db.runAsync(
      `INSERT INTO account_group
         (id, companyId, name, parentGroupId, nature, reportSection, isSystem, path, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [id, companyId, g.name, parentId, g.nature, g.reportSection, path, ts, ts]
    );
    idByName.set(g.name, id);
    pathByName.set(g.name, path);
  }

  for (const vt of VOUCHER_TYPE_SEEDS) {
    await db.runAsync(
      `INSERT INTO voucher_type (id, companyId, name, code, baseType, isSystem) VALUES (?, ?, ?, ?, ?, 1)`,
      [uuid(), companyId, vt.name, vt.code, vt.baseType]
    );
  }

  for (const l of SYSTEM_LEDGER_SEEDS) {
    await db.runAsync(
      `INSERT INTO ledger_account
         (id, companyId, name, groupId, openingBalance, openingBalanceType, isSystem, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 0, 'DR', 1, ?, ?)`,
      [uuid(), companyId, l.name, idByName.get(l.group)!, ts, ts]
    );
  }

  const fy = fiscalYearBounds(booksBeginDate);
  await db.runAsync(
    `INSERT INTO fiscal_year (id, companyId, label, startDate, endDate, isClosed, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, ?)`,
    [uuid(), companyId, fy.label, fy.startDate, fy.endDate, ts]
  );
}
