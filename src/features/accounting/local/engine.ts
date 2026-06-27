/**
 * Local BillShield accounting engine — the on-device port of the backend
 * controllers/services (group, ledger, voucher, report, fiscalYear).
 * Every read/write hits the local SQLite DB; nothing touches our server.
 *
 * Return shapes mirror the old API responses exactly so the existing
 * service wrappers (companyService / billshieldUiService / voucherService)
 * and all the screens keep working unchanged.
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDb, nowIso, setMeta, uuid } from './db';
import { fiscalYearBounds, seedCompanyDefaults, slug } from './seed';
import { notifyChange } from './sync';

type Nature = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';
type BaseType =
  | 'PAYMENT' | 'RECEIPT' | 'CONTRA' | 'SALES'
  | 'PURCHASE' | 'DEBIT_NOTE' | 'CREDIT_NOTE' | 'JOURNAL';

export interface VoucherLineInput {
  ledgerId: string;
  debit: number;
  credit: number;
  narration?: string | null;
}
export interface CreateVoucherInput {
  voucherTypeCode: string;
  voucherDate: string; // ISO
  narration?: string | null;
  partyId?: string | null;
  post?: boolean;
  lines: VoucherLineInput[];
  gstLines?: {
    description?: string; hsnSac?: string; taxableValue: number;
    cgst?: number; sgst?: number; igst?: number; cess?: number;
  }[];
}

export class BillShieldError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const IN_BOOKS = `v.status IN ('POSTED','REVERSED')`;
const PRIMARY_PATH = `(CASE WHEN instr(g.path,'/')>0 THEN substr(g.path,1,instr(g.path,'/')-1) ELSE g.path END)`;

// ---------------------------------------------------------------- company

const currentFyStartDate = () => {
  const now = new Date();
  const year = now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(Date.UTC(year, 3, 1));
};

/** Resolves the single local company, creating + seeding it on first use. */
export async function ensureCompany(): Promise<string> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM company ORDER BY createdAt LIMIT 1');
  if (existing) return existing.id;

  const id = uuid();
  const ts = nowIso();
  const booksBegin = currentFyStartDate();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `INSERT INTO company (id, name, fyStartMonth, booksBeginDate, createdAt, updatedAt)
       VALUES (?, 'My Company', 4, ?, ?, ?)`,
      [id, booksBegin.toISOString(), ts, ts]
    );
    await seedCompanyDefaults(tx, id, booksBegin);
    await setMeta(tx, 'dirty', '1');
  });
  notifyChange();
  return id;
}

export async function listCompanies() {
  const db = await getDb();
  return db.getAllAsync<any>(`SELECT * FROM company ORDER BY createdAt`);
}

export async function createCompany(data: {
  name: string; gstin?: string; pan?: string; stateCode?: string; booksBeginDate?: string;
}): Promise<any> {
  const db = await getDb();
  const id = uuid();
  const ts = nowIso();
  const booksBegin = data.booksBeginDate ? new Date(data.booksBeginDate) : currentFyStartDate();
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      `INSERT INTO company (id, name, gstin, pan, stateCode, fyStartMonth, booksBeginDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 4, ?, ?, ?)`,
      [id, data.name, data.gstin ?? null, data.pan ?? null, data.stateCode ?? null, booksBegin.toISOString(), ts, ts]
    );
    await seedCompanyDefaults(tx, id, booksBegin);
    await setMeta(tx, 'dirty', '1');
  });
  notifyChange();
  return db.getFirstAsync<any>(`SELECT * FROM company WHERE id = ?`, [id]);
}

// ------------------------------------------------------------- chart of a/c

export interface AccountGroupNode {
  id: string; name: string; nature: Nature; reportSection: string;
  isSystem: boolean; path: string; parentGroupId: string | null;
  subGroups: AccountGroupNode[];
  ledgers: { id: string; name: string; isSystem: boolean }[];
}

export async function getGroupTree(companyId: string): Promise<AccountGroupNode[]> {
  const db = await getDb();
  const groups = await db.getAllAsync<any>(
    `SELECT id, name, nature, reportSection, isSystem, path, parentGroupId
       FROM account_group WHERE companyId = ? ORDER BY path`,
    [companyId]
  );
  const ledgers = await db.getAllAsync<any>(
    `SELECT id, name, groupId, isSystem FROM ledger_account WHERE companyId = ? ORDER BY name`,
    [companyId]
  );

  const nodes = new Map<string, AccountGroupNode>();
  for (const g of groups) {
    nodes.set(g.id, {
      id: g.id, name: g.name, nature: g.nature, reportSection: g.reportSection,
      isSystem: !!g.isSystem, path: g.path, parentGroupId: g.parentGroupId,
      subGroups: [], ledgers: [],
    });
  }
  for (const l of ledgers) {
    nodes.get(l.groupId)?.ledgers.push({ id: l.id, name: l.name, isSystem: !!l.isSystem });
  }
  const roots: AccountGroupNode[] = [];
  for (const node of nodes.values()) {
    if (node.parentGroupId && nodes.has(node.parentGroupId)) {
      nodes.get(node.parentGroupId)!.subGroups.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function createSubGroup(companyId: string, name: string, parentGroupId: string) {
  const db = await getDb();
  const parent = await db.getFirstAsync<any>(
    `SELECT id, path, nature, reportSection FROM account_group WHERE id = ? AND companyId = ?`,
    [parentGroupId, companyId]
  );
  if (!parent) throw new BillShieldError('Parent group not found', 404);

  const id = uuid();
  const ts = nowIso();
  const path = `${parent.path}/${slug(name)}`;
  await db.runAsync(
    `INSERT INTO account_group
       (id, companyId, name, parentGroupId, nature, reportSection, isSystem, path, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    [id, companyId, name, parentGroupId, parent.nature, parent.reportSection, path, ts, ts]
  );
  await markDirty();
  return { id, name, path };
}

export async function deleteGroup(companyId: string, groupId: string) {
  const db = await getDb();
  const group = await db.getFirstAsync<any>(
    `SELECT id, isSystem FROM account_group WHERE id = ? AND companyId = ?`,
    [groupId, companyId]
  );
  if (!group) throw new BillShieldError('Group not found', 404);
  if (group.isSystem) throw new BillShieldError('System groups cannot be deleted');

  const child = await db.getFirstAsync<any>(`SELECT 1 FROM account_group WHERE parentGroupId = ?`, [groupId]);
  if (child) throw new BillShieldError('Delete or move the sub-groups first');
  const ledger = await db.getFirstAsync<any>(`SELECT 1 FROM ledger_account WHERE groupId = ?`, [groupId]);
  if (ledger) throw new BillShieldError('Move or delete the ledgers in this group first');

  await db.runAsync(`DELETE FROM account_group WHERE id = ?`, [groupId]);
  await markDirty();
  return { success: true };
}

// ------------------------------------------------------------------ ledgers

export async function listGroups(companyId: string) {
  const db = await getDb();
  return db.getAllAsync<any>(
    `SELECT id, name, nature, reportSection, path, parentGroupId, isSystem
       FROM account_group WHERE companyId = ? ORDER BY path`,
    [companyId]
  );
}

export async function listLedgers(companyId: string) {
  const db = await getDb();
  return db.getAllAsync<any>(
    `SELECT la.id, la.name, la.groupId, la.isSystem, la.openingBalance, la.openingBalanceType,
            la.partyId, la.createdAt, la.updatedAt, g.name AS groupName, g.path AS groupPath
       FROM ledger_account la JOIN account_group g ON g.id = la.groupId
      WHERE la.companyId = ? ORDER BY la.name`,
    [companyId]
  );
}

export async function getLedgerById(companyId: string, ledgerId: string) {
  const db = await getDb();
  return db.getFirstAsync<any>(
    `SELECT la.id, la.name, la.groupId, la.isSystem, la.openingBalance, la.openingBalanceType,
            la.partyId, la.createdAt, la.updatedAt, g.name AS groupName, g.path AS groupPath
       FROM ledger_account la JOIN account_group g ON g.id = la.groupId
      WHERE la.id = ? AND la.companyId = ?`,
    [ledgerId, companyId]
  );
}

export async function updateLedger(companyId: string, ledgerId: string, data: {
  name?: string; groupId?: string; openingBalance?: number; openingBalanceType?: 'DR' | 'CR';
  bankName?: string; bankAccountNo?: string; bankIfsc?: string; description?: string;
  partyId?: string | null;
}) {
  const db = await getDb();
  const sets: string[] = [];
  const params: any[] = [];
  const put = (col: string, val: any) => { sets.push(`${col} = ?`); params.push(val); };
  if (data.name !== undefined) put('name', data.name);
  if (data.groupId !== undefined) put('groupId', data.groupId);
  if (data.openingBalance !== undefined) put('openingBalance', data.openingBalance);
  if (data.openingBalanceType !== undefined) put('openingBalanceType', data.openingBalanceType);
  if (data.bankName !== undefined) put('bankName', data.bankName);
  if (data.bankAccountNo !== undefined) put('bankAccountNo', data.bankAccountNo);
  if (data.bankIfsc !== undefined) put('bankIfsc', data.bankIfsc);
  if (data.description !== undefined) put('description', data.description);
  if (data.partyId !== undefined) put('partyId', data.partyId);
  put('updatedAt', nowIso());
  params.push(ledgerId, companyId);
  await db.runAsync(`UPDATE ledger_account SET ${sets.join(', ')} WHERE id = ? AND companyId = ?`, params);
  await markDirty();
  return getLedgerById(companyId, ledgerId);
}

export async function deleteLedger(companyId: string, ledgerId: string) {
  const db = await getDb();
  const ledger = await db.getFirstAsync<any>(`SELECT isSystem FROM ledger_account WHERE id = ? AND companyId = ?`, [ledgerId, companyId]);
  if (!ledger) throw new BillShieldError('Ledger not found', 404);
  if (ledger.isSystem) throw new BillShieldError('System ledgers cannot be deleted');
  const used = await db.getFirstAsync<any>(`SELECT 1 FROM voucher_line WHERE ledgerId = ? LIMIT 1`, [ledgerId]);
  if (used) throw new BillShieldError('This ledger has transactions and cannot be deleted');
  await db.runAsync(`DELETE FROM ledger_account WHERE id = ?`, [ledgerId]);
  await markDirty();
  return { success: true };
}

export async function createLedger(companyId: string, data: {
  name: string; groupId: string; openingBalance?: number; openingBalanceType?: 'DR' | 'CR';
  partyId?: string; bankName?: string; bankAccountNo?: string; bankIfsc?: string; description?: string;
}) {
  const db = await getDb();
  const group = await db.getFirstAsync<any>(`SELECT id FROM account_group WHERE id = ? AND companyId = ?`, [data.groupId, companyId]);
  if (!group) throw new BillShieldError('Group not found for this ledger', 404);

  const id = uuid();
  const ts = nowIso();
  await db.runAsync(
    `INSERT INTO ledger_account
       (id, companyId, name, groupId, openingBalance, openingBalanceType, isSystem,
        partyId, bankName, bankAccountNo, bankIfsc, description, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
    [id, companyId, data.name, data.groupId, data.openingBalance ?? 0, data.openingBalanceType ?? 'DR',
     data.partyId ?? null, data.bankName ?? null, data.bankAccountNo ?? null, data.bankIfsc ?? null,
     data.description ?? null, ts, ts]
  );
  await markDirty();
  return { id, name: data.name, groupId: data.groupId };
}

// ------------------------------------------------------------- fiscal years

export async function listFiscalYears(companyId: string) {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT id, label, startDate, endDate, isClosed FROM fiscal_year WHERE companyId = ? ORDER BY startDate DESC`,
    [companyId]
  );
  return rows.map((r) => ({ ...r, isClosed: !!r.isClosed }));
}

export async function closeFiscalYear(companyId: string, fiscalYearId: string) {
  const db = await getDb();
  let result: { id: string; isClosed: boolean } | null = null;
  
  await db.withExclusiveTransactionAsync(async (tx) => {
    // 1. Fetch current fiscal year details
    const currentFy = await tx.getFirstAsync<any>(
      `SELECT label, startDate, endDate FROM fiscal_year WHERE id = ? AND companyId = ?`,
      [fiscalYearId, companyId]
    );
    if (!currentFy) {
      throw new BillShieldError(`Fiscal year not found`, 404);
    }

    // 2. Mark current fiscal year as closed
    await tx.runAsync(
      `UPDATE fiscal_year SET isClosed = 1 WHERE id = ? AND companyId = ?`,
      [fiscalYearId, companyId]
    );

    // 3. Calculate next fiscal year dates
    const start = new Date(currentFy.startDate);
    const end = new Date(currentFy.endDate);
    
    // Increment years by 1
    const nextStartYear = start.getUTCFullYear() + 1;
    const nextEndYear = end.getUTCFullYear() + 1;
    
    const nextStartDate = new Date(Date.UTC(nextStartYear, 3, 1)).toISOString();
    const nextEndDate = new Date(Date.UTC(nextEndYear, 2, 31, 23, 59, 59, 999)).toISOString();
    const nextLabel = `${nextStartYear}-${String((nextStartYear + 1) % 100).padStart(2, '0')}`;

    // 4. Check if the next fiscal year already exists to avoid duplicate entries
    const existingNextFy = await tx.getFirstAsync<any>(
      `SELECT id FROM fiscal_year WHERE companyId = ? AND startDate = ?`,
      [companyId, nextStartDate]
    );

    if (!existingNextFy) {
      const nextFyId = uuid();
      const ts = nowIso();
      await tx.runAsync(
        `INSERT INTO fiscal_year (id, companyId, label, startDate, endDate, isClosed, createdAt)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [nextFyId, companyId, nextLabel, nextStartDate, nextEndDate, ts]
      );
    }

    result = { id: fiscalYearId, isClosed: true };
  });

  await markDirty();
  return result!;
}

// ------------------------------------------------------- voucher posting

function assertBalanced(lines: VoucherLineInput[]) {
  if (lines.length < 2) throw new BillShieldError('A voucher needs at least 2 lines');
  const dr = lines.reduce((s, l) => s + l.debit, 0);
  const cr = lines.reduce((s, l) => s + l.credit, 0);
  if (Math.round(dr * 100) !== Math.round(cr * 100))
    throw new BillShieldError(`Voucher is unbalanced: Dr ${dr.toFixed(2)} ≠ Cr ${cr.toFixed(2)}`);
}

const CASH_BANK_PREFIXES = [
  'current-assets/cash-in-hand',
  'current-assets/bank-accounts',
  'loans-liability/bank-od-occ-accounts',
];
const isCashOrBank = (path: string) =>
  CASH_BANK_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
const underGroup = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + '/');

function validateTypeRules(baseType: BaseType, lines: { debit: number; credit: number; path: string; ledgerName: string }[]) {
  switch (baseType) {
    case 'CONTRA': {
      const bad = lines.find((l) => !isCashOrBank(l.path));
      if (bad) throw new BillShieldError(`Contra vouchers may only touch cash/bank ledgers — "${bad.ledgerName}" is not one`);
      break;
    }
    case 'PAYMENT':
      if (!lines.some((l) => l.credit > 0 && isCashOrBank(l.path)))
        throw new BillShieldError('Payment vouchers must credit a cash or bank ledger');
      break;
    case 'RECEIPT':
      if (!lines.some((l) => l.debit > 0 && isCashOrBank(l.path)))
        throw new BillShieldError('Receipt vouchers must debit a cash or bank ledger');
      break;
    case 'SALES':
      if (!lines.some((l) => l.credit > 0 && underGroup(l.path, 'sales-accounts')))
        throw new BillShieldError('Sales vouchers must credit a ledger under Sales Accounts');
      break;
    case 'PURCHASE':
      if (!lines.some((l) => l.debit > 0 && underGroup(l.path, 'purchase-accounts')))
        throw new BillShieldError('Purchase vouchers must debit a ledger under Purchase Accounts');
      break;
    case 'CREDIT_NOTE':
      if (!lines.some((l) => l.debit > 0 && underGroup(l.path, 'sales-accounts')))
        throw new BillShieldError('Credit notes must debit a ledger under Sales Accounts (sales return)');
      break;
    case 'DEBIT_NOTE':
      if (!lines.some((l) => l.credit > 0 && underGroup(l.path, 'purchase-accounts')))
        throw new BillShieldError('Debit notes must credit a ledger under Purchase Accounts (purchase return)');
      break;
    case 'JOURNAL':
      break;
  }
}

async function loadLineLedgers(db: SQLiteDatabase, companyId: string, lines: VoucherLineInput[]) {
  const enriched = [];
  for (const l of lines) {
    const ledger = await db.getFirstAsync<any>(
      `SELECT la.name, g.path FROM ledger_account la JOIN account_group g ON g.id = la.groupId
        WHERE la.id = ? AND la.companyId = ?`,
      [l.ledgerId, companyId]
    );
    if (!ledger) throw new BillShieldError(`Ledger ${l.ledgerId} not found in this company`, 404);
    enriched.push({ ...l, path: ledger.path, ledgerName: ledger.name });
  }
  return enriched;
}

async function findOpenFiscalYear(db: SQLiteDatabase, companyId: string, dateIso: string) {
  const fy = await db.getFirstAsync<any>(
    `SELECT id, label, isClosed FROM fiscal_year
      WHERE companyId = ? AND startDate <= ? AND endDate >= ? LIMIT 1`,
    [companyId, dateIso, dateIso]
  );
  if (!fy) throw new BillShieldError(`No fiscal year covers ${dateIso.slice(0, 10)} — create it first`);
  if (fy.isClosed) throw new BillShieldError(`Fiscal year ${fy.label} is closed`);
  return fy;
}

async function allocateVoucherNo(db: SQLiteDatabase, voucherTypeId: string, fiscalYearId: string, code: string, fyLabel: string) {
  const row = await db.getFirstAsync<{ nextNumber: number }>(
    `INSERT INTO voucher_sequence (id, voucherTypeId, fiscalYearId, nextNumber)
     VALUES (?, ?, ?, 2)
     ON CONFLICT(voucherTypeId, fiscalYearId) DO UPDATE SET nextNumber = nextNumber + 1
     RETURNING nextNumber`,
    [uuid(), voucherTypeId, fiscalYearId, voucherTypeId]
  );
  const allocated = (row!.nextNumber as number) - 1;
  return `${code}/${fyLabel}/${String(allocated).padStart(4, '0')}`;
}

/** Creates (and optionally posts) a voucher — the double-entry core. */
export async function createVoucher(companyId: string, userId: number, input: CreateVoucherInput) {
  const db = await getDb();
  let resultId = '';
  await db.withExclusiveTransactionAsync(async (tx) => {
    const voucherType = await tx.getFirstAsync<any>(
      `SELECT id, code, baseType FROM voucher_type WHERE companyId = ? AND code = ?`,
      [companyId, input.voucherTypeCode]
    );
    if (!voucherType) throw new BillShieldError(`Unknown voucher type ${input.voucherTypeCode}`, 404);

    assertBalanced(input.lines);
    const enriched = await loadLineLedgers(tx, companyId, input.lines);
    validateTypeRules(voucherType.baseType, enriched);
    const fy = await findOpenFiscalYear(tx, companyId, input.voucherDate);

    const id = uuid();
    const ts = nowIso();
    const posted = !!input.post;
    let voucherNo: string | null = null;
    if (posted) voucherNo = await allocateVoucherNo(tx, voucherType.id, fy.id, voucherType.code, fy.label);

    await tx.runAsync(
      `INSERT INTO voucher
         (id, companyId, fiscalYearId, voucherTypeId, voucherNo, voucherDate, narration, partyId,
          status, postedAt, createdById, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, companyId, fy.id, voucherType.id, voucherNo, input.voucherDate, input.narration ?? null,
       input.partyId ?? null, posted ? 'POSTED' : 'DRAFT', posted ? ts : null, userId, ts, ts]
    );
    let lineNo = 1;
    for (const l of input.lines) {
      await tx.runAsync(
        `INSERT INTO voucher_line (id, voucherId, lineNo, ledgerId, debit, credit, narration)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuid(), id, lineNo++, l.ledgerId, l.debit, l.credit, l.narration ?? null]
      );
    }
    for (const g of input.gstLines ?? []) {
      await tx.runAsync(
        `INSERT INTO voucher_gst_line (id, voucherId, description, hsnSac, taxableValue, cgst, sgst, igst, cess)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuid(), id, g.description ?? null, g.hsnSac ?? null, g.taxableValue, g.cgst ?? 0, g.sgst ?? 0, g.igst ?? 0, g.cess ?? 0]
      );
    }
    await setMeta(tx, 'dirty', '1');
    resultId = id;
  });
  notifyChange();
  return getVoucher(companyId, resultId);
}

/** Posts a DRAFT voucher (allocates its number). */
export async function postVoucher(companyId: string, voucherId: string) {
  const db = await getDb();
  await db.withExclusiveTransactionAsync(async (tx) => {
    const voucher = await tx.getFirstAsync<any>(
      `SELECT v.*, vt.code, vt.baseType FROM voucher v JOIN voucher_type vt ON vt.id = v.voucherTypeId
        WHERE v.id = ? AND v.companyId = ?`,
      [voucherId, companyId]
    );
    if (!voucher) throw new BillShieldError('Voucher not found', 404);
    if (voucher.status !== 'DRAFT') throw new BillShieldError(`Voucher is already ${voucher.status}`);

    const rawLines = await tx.getAllAsync<any>(`SELECT ledgerId, debit, credit FROM voucher_line WHERE voucherId = ?`, [voucherId]);
    assertBalanced(rawLines);
    const enriched = await loadLineLedgers(tx, companyId, rawLines);
    validateTypeRules(voucher.baseType, enriched);

    const fy = await findOpenFiscalYear(tx, companyId, voucher.voucherDate);
    const voucherNo = await allocateVoucherNo(tx, voucher.voucherTypeId, fy.id, voucher.code, fy.label);
    await tx.runAsync(
      `UPDATE voucher SET status = 'POSTED', voucherNo = ?, fiscalYearId = ?, postedAt = ?, updatedAt = ? WHERE id = ?`,
      [voucherNo, fy.id, nowIso(), nowIso(), voucherId]
    );
    await setMeta(tx, 'dirty', '1');
  });
  notifyChange();
  return getVoucher(companyId, voucherId);
}

/** Reverses a POSTED voucher with a mirror voucher. */
export async function reverseVoucher(companyId: string, userId: number, voucherId: string) {
  const db = await getDb();
  let reversalId = '';
  await db.withExclusiveTransactionAsync(async (tx) => {
    const original = await tx.getFirstAsync<any>(
      `SELECT v.*, vt.code FROM voucher v JOIN voucher_type vt ON vt.id = v.voucherTypeId
        WHERE v.id = ? AND v.companyId = ?`,
      [voucherId, companyId]
    );
    if (!original) throw new BillShieldError('Voucher not found', 404);
    if (original.status !== 'POSTED')
      throw new BillShieldError(`Only POSTED vouchers can be reversed (this one is ${original.status})`);

    const lines = await tx.getAllAsync<any>(`SELECT lineNo, ledgerId, debit, credit, narration FROM voucher_line WHERE voucherId = ?`, [voucherId]);
    const fy = await findOpenFiscalYear(tx, companyId, original.voucherDate);
    const voucherNo = await allocateVoucherNo(tx, original.voucherTypeId, fy.id, original.code, fy.label);

    const id = uuid();
    const ts = nowIso();
    await tx.runAsync(
      `INSERT INTO voucher
         (id, companyId, fiscalYearId, voucherTypeId, voucherNo, voucherDate, narration, partyId,
          status, reversalOfId, postedAt, createdById, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'POSTED', ?, ?, ?, ?, ?)`,
      [id, companyId, fy.id, original.voucherTypeId, voucherNo, original.voucherDate,
       `Reversal of ${original.voucherNo}`, original.partyId, original.id, ts, userId, ts, ts]
    );
    for (const l of lines) {
      await tx.runAsync(
        `INSERT INTO voucher_line (id, voucherId, lineNo, ledgerId, debit, credit, narration)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuid(), id, l.lineNo, l.ledgerId, l.credit, l.debit, l.narration] // mirror Dr/Cr
      );
    }
    await tx.runAsync(`UPDATE voucher SET status = 'REVERSED', updatedAt = ? WHERE id = ?`, [ts, original.id]);
    await setMeta(tx, 'dirty', '1');
    reversalId = id;
  });
  notifyChange();
  return getVoucher(companyId, reversalId);
}

export async function deleteDraftVoucher(companyId: string, voucherId: string) {
  const db = await getDb();
  const voucher = await db.getFirstAsync<any>(`SELECT status FROM voucher WHERE id = ? AND companyId = ?`, [voucherId, companyId]);
  if (!voucher) throw new BillShieldError('Voucher not found', 404);
  if (voucher.status !== 'DRAFT')
    throw new BillShieldError('Only DRAFT vouchers can be deleted — reverse posted ones instead');
  await db.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(`DELETE FROM voucher_line WHERE voucherId = ?`, [voucherId]);
    await tx.runAsync(`DELETE FROM voucher_gst_line WHERE voucherId = ?`, [voucherId]);
    await tx.runAsync(`DELETE FROM voucher WHERE id = ?`, [voucherId]);
    await setMeta(tx, 'dirty', '1');
  });
  notifyChange();
  return { success: true };
}

export async function getVoucher(companyId: string, voucherId: string) {
  const db = await getDb();
  const voucher = await db.getFirstAsync<any>(
    `SELECT v.*, vt.name AS voucherTypeName, vt.code AS voucherTypeCode
       FROM voucher v JOIN voucher_type vt ON vt.id = v.voucherTypeId
      WHERE v.id = ? AND v.companyId = ?`,
    [voucherId, companyId]
  );
  if (!voucher) return null;
  const lines = await db.getAllAsync<any>(
    `SELECT vl.*, la.name AS ledgerName FROM voucher_line vl JOIN ledger_account la ON la.id = vl.ledgerId
      WHERE vl.voucherId = ? ORDER BY vl.lineNo`,
    [voucherId]
  );
  const gstLines = await db.getAllAsync<any>(`SELECT * FROM voucher_gst_line WHERE voucherId = ?`, [voucherId]);
  return { ...voucher, voucherType: { name: voucher.voucherTypeName, code: voucher.voucherTypeCode }, lines, gstLines };
}

export async function listVouchers(companyId: string, limit = 200) {
  const db = await getDb();
  const vouchers = await db.getAllAsync<any>(
    `SELECT v.*, vt.name AS voucherTypeName, vt.code AS voucherTypeCode
       FROM voucher v JOIN voucher_type vt ON vt.id = v.voucherTypeId
      WHERE v.companyId = ? ORDER BY v.voucherDate DESC, v.createdAt DESC LIMIT ?`,
    [companyId, limit]
  );
  const out = [];
  for (const v of vouchers) {
    const lines = await db.getAllAsync<any>(
      `SELECT vl.*, la.name AS ledgerName FROM voucher_line vl JOIN ledger_account la ON la.id = vl.ledgerId
        WHERE vl.voucherId = ? ORDER BY vl.lineNo`,
      [v.id]
    );
    out.push({ ...v, voucherType: { name: v.voucherTypeName, code: v.voucherTypeCode }, lines });
  }
  return out;
}

// ------------------------------------------------------------------ reports

const signedOpening = (bal: number, type: 'DR' | 'CR') => (type === 'DR' ? Number(bal) : -Number(bal));

export async function trialBalance(companyId: string, asOf?: string) {
  const db = await getDb();
  const dateFilter = asOf ? `AND v.voucherDate <= ?` : '';
  const params: any[] = [];
  if (asOf) params.push(asOf);
  params.push(companyId);
  const rows = await db.getAllAsync<any>(
    `SELECT la.id AS ledgerId, la.name AS ledgerName, g.name AS groupName, g.path AS groupPath, g.nature,
            ((CASE WHEN la.openingBalanceType='DR' THEN la.openingBalance ELSE -la.openingBalance END)
              + COALESCE((SELECT SUM(vl.debit - vl.credit) FROM voucher_line vl
                            JOIN voucher v ON v.id = vl.voucherId
                           WHERE vl.ledgerId = la.id AND ${IN_BOOKS} ${dateFilter}), 0)) AS net
       FROM ledger_account la JOIN account_group g ON g.id = la.groupId
      WHERE la.companyId = ? ORDER BY g.path, la.name`,
    params
  );
  const ledgers = rows
    .filter((r) => Math.round(Number(r.net) * 100) !== 0)
    .map((r) => ({
      ledgerId: r.ledgerId, ledgerName: r.ledgerName, groupName: r.groupName, groupPath: r.groupPath,
      nature: r.nature as Nature, debit: r.net > 0 ? r.net : 0, credit: r.net < 0 ? -r.net : 0,
    }));
  return {
    ledgers,
    totals: {
      debit: ledgers.reduce((s, l) => s + l.debit, 0),
      credit: ledgers.reduce((s, l) => s + l.credit, 0),
    },
  };
}

export async function profitAndLoss(companyId: string, from?: string, to?: string) {
  const db = await getDb();
  const range = `${from ? 'AND v.voucherDate >= ?' : ''} ${to ? 'AND v.voucherDate <= ?' : ''}`;
  const params: any[] = [companyId];
  if (from) params.push(from);
  if (to) params.push(to);
  const rows = await db.getAllAsync<any>(
    `SELECT pg.name AS groupName, pg.nature, pg.reportSection,
            COALESCE(SUM(vl.credit - vl.debit), 0) AS creditNet
       FROM voucher_line vl
       JOIN voucher v ON v.id = vl.voucherId
       JOIN ledger_account la ON la.id = vl.ledgerId
       JOIN account_group g ON g.id = la.groupId
       JOIN account_group pg ON pg.companyId = g.companyId AND pg.path = ${PRIMARY_PATH}
      WHERE la.companyId = ? AND ${IN_BOOKS} AND g.nature IN ('INCOME','EXPENSE') ${range}
      GROUP BY pg.name, pg.nature, pg.reportSection
      ORDER BY pg.reportSection, pg.nature`,
    params
  );
  const trading = rows.filter((r) => r.reportSection === 'TRADING');
  const pl = rows.filter((r) => r.reportSection === 'PROFIT_AND_LOSS');
  const grossProfit = trading.reduce((s, r) => s + Number(r.creditNet), 0);
  const netProfit = grossProfit + pl.reduce((s, r) => s + Number(r.creditNet), 0);
  const fmt = (r: any) => ({ group: r.groupName, nature: r.nature, amount: Math.abs(Number(r.creditNet)) });
  return {
    trading: {
      income: trading.filter((r) => r.nature === 'INCOME').map(fmt),
      expenses: trading.filter((r) => r.nature === 'EXPENSE').map(fmt),
      grossProfit,
    },
    profitAndLoss: {
      income: pl.filter((r) => r.nature === 'INCOME').map(fmt),
      expenses: pl.filter((r) => r.nature === 'EXPENSE').map(fmt),
      netProfit,
    },
  };
}

export async function balanceSheet(companyId: string, asOf?: string) {
  const db = await getDb();
  const dateFilter = asOf ? `AND v.voucherDate <= ?` : '';
  const params: any[] = [];
  if (asOf) params.push(asOf);
  params.push(companyId);
  const rows = await db.getAllAsync<any>(
    `SELECT pg.name AS groupName, pg.nature,
            SUM((CASE WHEN la.openingBalanceType='DR' THEN la.openingBalance ELSE -la.openingBalance END)
                + COALESCE((SELECT SUM(vl.debit - vl.credit) FROM voucher_line vl
                              JOIN voucher v ON v.id = vl.voucherId
                             WHERE vl.ledgerId = la.id AND ${IN_BOOKS} ${dateFilter}), 0)) AS debitNet
       FROM ledger_account la
       JOIN account_group g ON g.id = la.groupId
       JOIN account_group pg ON pg.companyId = g.companyId AND pg.path = ${PRIMARY_PATH}
      WHERE la.companyId = ? AND g.nature IN ('ASSET','LIABILITY')
      GROUP BY pg.name, pg.nature
      ORDER BY pg.nature, pg.name`,
    params
  );
  const live = rows.filter((r) => Math.round(Number(r.debitNet) * 100) !== 0);
  const pnl = await profitAndLoss(companyId, undefined, asOf);
  const assets = live.filter((r) => r.nature === 'ASSET').map((r) => ({ group: r.groupName, amount: Number(r.debitNet) }));
  const liabilities = live.filter((r) => r.nature === 'LIABILITY').map((r) => ({ group: r.groupName, amount: -Number(r.debitNet) }));
  const totalAssets = assets.reduce((s, r) => s + r.amount, 0);
  const totalLiabilities = liabilities.reduce((s, r) => s + r.amount, 0) + pnl.profitAndLoss.netProfit;
  return {
    assets,
    liabilities: [...liabilities, { group: 'Profit & Loss (current period)', amount: pnl.profitAndLoss.netProfit }],
    totals: {
      assets: totalAssets,
      liabilities: totalLiabilities,
      difference: Math.round((totalAssets - totalLiabilities) * 100) / 100,
    },
  };
}

export async function ledgerStatement(companyId: string, ledgerId: string, from?: string, to?: string) {
  const db = await getDb();
  const ledger = await db.getFirstAsync<any>(
    `SELECT la.id, la.name, la.openingBalance, la.openingBalanceType, g.name AS groupName
       FROM ledger_account la JOIN account_group g ON g.id = la.groupId
      WHERE la.id = ? AND la.companyId = ?`,
    [ledgerId, companyId]
  );
  if (!ledger) throw new BillShieldError('Ledger not found', 404);

  let opening = signedOpening(ledger.openingBalance, ledger.openingBalanceType);
  if (from) {
    const prior = await db.getFirstAsync<{ net: number }>(
      `SELECT COALESCE(SUM(vl.debit - vl.credit), 0) AS net FROM voucher_line vl
         JOIN voucher v ON v.id = vl.voucherId
        WHERE vl.ledgerId = ? AND ${IN_BOOKS} AND v.voucherDate < ?`,
      [ledgerId, from]
    );
    opening += Number(prior?.net ?? 0);
  }

  const range = `${from ? 'AND v.voucherDate >= ?' : ''} ${to ? 'AND v.voucherDate <= ?' : ''}`;
  const params: any[] = [ledgerId];
  if (from) params.push(from);
  if (to) params.push(to);
  const rows = await db.getAllAsync<any>(
    `SELECT v.voucherNo, v.voucherDate, vt.name AS voucherType,
            COALESCE(vl.narration, v.narration) AS narration,
            vl.debit AS debit, vl.credit AS credit,
            SUM(vl.debit - vl.credit) OVER (ORDER BY v.voucherDate, v.createdAt, vl.lineNo) AS movement
       FROM voucher_line vl
       JOIN voucher v ON v.id = vl.voucherId
       JOIN voucher_type vt ON vt.id = v.voucherTypeId
      WHERE vl.ledgerId = ? AND ${IN_BOOKS} ${range}
      ORDER BY v.voucherDate, v.createdAt, vl.lineNo`,
    params
  );
  const entries = rows.map((r) => ({
    voucherNo: r.voucherNo ?? '', voucherDate: r.voucherDate, voucherType: r.voucherType,
    narration: r.narration ?? null, debit: Number(r.debit), credit: Number(r.credit),
    runningBalance: opening + Number(r.movement),
  }));
  const closing = entries.length ? entries[entries.length - 1].runningBalance : opening;
  return {
    ledger: { id: ledger.id, name: ledger.name, group: ledger.groupName },
    opening: { amount: Math.abs(opening), type: (opening >= 0 ? 'DR' : 'CR') as 'DR' | 'CR' },
    entries,
    closing: { amount: Math.abs(closing), type: (closing >= 0 ? 'DR' : 'CR') as 'DR' | 'CR' },
  };
}

async function book(companyId: string, pathPrefix: string, withReco: boolean) {
  const db = await getDb();
  const recoSelect = withReco ? ', br.instrumentNo, br.instrumentDate, br.clearedOn, br.statementRef' : '';
  const recoJoin = withReco ? 'LEFT JOIN bank_reconciliation br ON br.voucherLineId = vl.id' : '';
  const rows = await db.getAllAsync<any>(
    `SELECT la.id AS ledgerId, la.name AS ledgerName, v.voucherNo, v.voucherDate, vt.name AS voucherType,
            COALESCE(vl.narration, v.narration) AS narration, vl.id AS lineId, vl.debit AS debit, vl.credit AS credit,
            (CASE WHEN la.openingBalanceType='DR' THEN la.openingBalance ELSE -la.openingBalance END)
              + SUM(vl.debit - vl.credit) OVER (PARTITION BY la.id ORDER BY v.voucherDate, v.createdAt, vl.lineNo) AS runningBalance
            ${recoSelect}
       FROM voucher_line vl
       JOIN voucher v ON v.id = vl.voucherId
       JOIN voucher_type vt ON vt.id = v.voucherTypeId
       JOIN ledger_account la ON la.id = vl.ledgerId
       JOIN account_group g ON g.id = la.groupId
       ${recoJoin}
      WHERE la.companyId = ? AND ${IN_BOOKS} AND (g.path = ? OR g.path LIKE ?)
      ORDER BY la.name, v.voucherDate, v.createdAt, vl.lineNo`,
    [companyId, pathPrefix, pathPrefix + '/%']
  );
  return rows;
}

export const cashbook = (companyId: string) => book(companyId, 'current-assets/cash-in-hand', false);
export const bankbook = (companyId: string) => book(companyId, 'current-assets/bank-accounts', true);

export async function dayBook(companyId: string, from?: string, to?: string) {
  const db = await getDb();
  const range = `${from ? 'AND voucherDate >= ?' : ''} ${to ? 'AND voucherDate <= ?' : ''}`;
  const params: any[] = [companyId];
  if (from) params.push(from);
  if (to) params.push(to);
  const vouchers = await db.getAllAsync<any>(
    `SELECT * FROM voucher WHERE companyId = ? AND status IN ('POSTED','REVERSED') ${range}
      ORDER BY voucherDate ASC, createdAt ASC`,
    params
  );
  const out = [];
  for (const v of vouchers) {
    const lines = await db.getAllAsync<any>(
      `SELECT vl.*, la.name AS ledgerName FROM voucher_line vl JOIN ledger_account la ON la.id = vl.ledgerId
        WHERE vl.voucherId = ? ORDER BY vl.lineNo`,
      [v.id]
    );
    out.push({ ...v, lines });
  }
  return out;
}

export async function reconcileLine(lineId: string, data: {
  instrumentNo?: string; instrumentDate?: string; clearedOn?: string | null; statementRef?: string;
}) {
  const db = await getDb();
  const ts = nowIso();
  await db.runAsync(
    `INSERT INTO bank_reconciliation (id, voucherLineId, instrumentNo, instrumentDate, clearedOn, statementRef, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(voucherLineId) DO UPDATE SET
       instrumentNo = excluded.instrumentNo, instrumentDate = excluded.instrumentDate,
       clearedOn = excluded.clearedOn, statementRef = excluded.statementRef, updatedAt = excluded.updatedAt`,
    [uuid(), lineId, data.instrumentNo ?? null, data.instrumentDate ?? null, data.clearedOn ?? null, data.statementRef ?? null, ts, ts]
  );
  await markDirty();
  return { success: true, data: { lineId, ...data } };
}

// ------------------------------------------------------------------ dirty

/** Flags the DB as having unsynced changes and pokes the sync scheduler. */
export async function markDirty() {
  const db = await getDb();
  await setMeta(db, 'dirty', '1');
  notifyChange();
}
