#!/usr/bin/env node
/**
 * BillShield LOCAL self-test — runs entirely from the terminal.
 *
 *   node scripts/billshield-selftest.mjs
 *
 * BillShield stores everything on-device in a SQLite file (no server API).
 * This script builds that exact same SQLite schema in Node (via the built-in
 * node:sqlite, Node >= 22), exercises EVERY piece of functionality with
 * sample data, prints a full verification report, and writes the resulting
 * database to ./billshield-selftest.db.
 *
 * It tests, end-to-end:
 *   • Company + auto-seed (27 groups, 8 voucher types, 8 system ledgers, FY)
 *   • Chart of Accounts: parent → sub-group → sub-sub-group
 *   • Ledgers (every nature) + update
 *   • Vouchers: Receipt, Sales(+GST), Purchase(+GST), Payment, Contra, Journal
 *   • Draft → Post, and Reverse
 *   • Bank reconciliation
 *   • Reports: Trial Balance, P&L, Balance Sheet, Cash/Bank book, Day Book,
 *     Ledger Statement  (all computed with the same SQL the app uses)
 *
 * To SEE this data on the frontend, load the produced .db into the app
 * (see the printed instructions at the end — Android import / web OPFS).
 */
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { runServer } from './billshield-server.mjs';

const OUT = resolve(process.cwd(), 'billshield-selftest.db');
const USER_ID = 1;

// fresh file every run
for (const f of [OUT, `${OUT}-wal`, `${OUT}-shm`]) if (existsSync(f)) unlinkSync(f);

const db = new DatabaseSync(OUT);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

const uuid = () => randomUUID();
const nowIso = () => new Date().toISOString();
const run = (sql, ...args) => db.prepare(sql).run(...args);
const get = (sql, ...args) => db.prepare(sql).get(...args);
const all = (sql, ...args) => db.prepare(sql).all(...args);

// pretty logging -----------------------------------------------------------
const c = { blue: '\x1b[34m', green: '\x1b[32m', dim: '\x1b[2m', bold: '\x1b[1m', red: '\x1b[31m', reset: '\x1b[0m' };
const section = (t) => console.log(`\n${c.blue}${c.bold}━━ ${t} ━━${c.reset}`);
const ok = (m) => console.log(`  ${c.green}✓${c.reset} ${m}`);
const info = (k, v) => console.log(`  ${c.dim}•${c.reset} ${k}: ${c.bold}${v}${c.reset}`);
let failures = 0;
const check = (cond, m) => { if (cond) ok(m); else { failures++; console.log(`  ${c.red}✗ ${m}${c.reset}`); } };

// ---------------------------------------------------------------- SCHEMA
// (identical to src/features/accounting/local/db.ts)
db.exec(`
  CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT);
  CREATE TABLE company (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, gstin TEXT, pan TEXT, stateCode TEXT,
    fyStartMonth INTEGER NOT NULL DEFAULT 4, booksBeginDate TEXT NOT NULL,
    createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
  CREATE TABLE fiscal_year (
    id TEXT PRIMARY KEY, companyId TEXT NOT NULL, label TEXT NOT NULL,
    startDate TEXT NOT NULL, endDate TEXT NOT NULL, isClosed INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL);
  CREATE INDEX idx_fy_company ON fiscal_year(companyId);
  CREATE TABLE account_group (
    id TEXT PRIMARY KEY, companyId TEXT NOT NULL, name TEXT NOT NULL, parentGroupId TEXT,
    nature TEXT NOT NULL, reportSection TEXT NOT NULL, isSystem INTEGER NOT NULL DEFAULT 0,
    path TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
  CREATE INDEX idx_group_company ON account_group(companyId);
  CREATE INDEX idx_group_parent ON account_group(parentGroupId);
  CREATE UNIQUE INDEX uq_group_name ON account_group(companyId, name);
  CREATE TABLE ledger_account (
    id TEXT PRIMARY KEY, companyId TEXT NOT NULL, name TEXT NOT NULL, groupId TEXT NOT NULL,
    openingBalance REAL NOT NULL DEFAULT 0, openingBalanceType TEXT NOT NULL DEFAULT 'DR',
    isSystem INTEGER NOT NULL DEFAULT 0, partyId TEXT, bankName TEXT, bankAccountNo TEXT,
    bankIfsc TEXT, description TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
  CREATE INDEX idx_ledger_company ON ledger_account(companyId);
  CREATE INDEX idx_ledger_group ON ledger_account(groupId);
  CREATE UNIQUE INDEX uq_ledger_name ON ledger_account(companyId, name);
  CREATE TABLE voucher_type (
    id TEXT PRIMARY KEY, companyId TEXT NOT NULL, name TEXT NOT NULL, code TEXT NOT NULL,
    baseType TEXT NOT NULL, isSystem INTEGER NOT NULL DEFAULT 0);
  CREATE UNIQUE INDEX uq_vtype_code ON voucher_type(companyId, code);
  CREATE TABLE voucher_sequence (
    id TEXT PRIMARY KEY, voucherTypeId TEXT NOT NULL, fiscalYearId TEXT NOT NULL,
    nextNumber INTEGER NOT NULL DEFAULT 1);
  CREATE UNIQUE INDEX uq_seq ON voucher_sequence(voucherTypeId, fiscalYearId);
  CREATE TABLE voucher (
    id TEXT PRIMARY KEY, companyId TEXT NOT NULL, fiscalYearId TEXT NOT NULL,
    voucherTypeId TEXT NOT NULL, voucherNo TEXT, voucherDate TEXT NOT NULL, narration TEXT,
    partyId TEXT, status TEXT NOT NULL DEFAULT 'DRAFT', reversalOfId TEXT, postedAt TEXT,
    createdById INTEGER NOT NULL DEFAULT 0, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
  CREATE INDEX idx_voucher_company ON voucher(companyId);
  CREATE INDEX idx_voucher_date ON voucher(companyId, voucherDate);
  CREATE INDEX idx_voucher_status ON voucher(companyId, status);
  CREATE TABLE voucher_line (
    id TEXT PRIMARY KEY, voucherId TEXT NOT NULL, lineNo INTEGER NOT NULL, ledgerId TEXT NOT NULL,
    debit REAL NOT NULL DEFAULT 0, credit REAL NOT NULL DEFAULT 0, narration TEXT);
  CREATE INDEX idx_line_voucher ON voucher_line(voucherId);
  CREATE INDEX idx_line_ledger ON voucher_line(ledgerId, voucherId);
  CREATE TABLE voucher_gst_line (
    id TEXT PRIMARY KEY, voucherId TEXT NOT NULL, description TEXT, hsnSac TEXT,
    taxableValue REAL NOT NULL DEFAULT 0, cgst REAL NOT NULL DEFAULT 0, sgst REAL NOT NULL DEFAULT 0,
    igst REAL NOT NULL DEFAULT 0, cess REAL NOT NULL DEFAULT 0);
  CREATE INDEX idx_gstline_voucher ON voucher_gst_line(voucherId);
  CREATE TABLE bank_reconciliation (
    id TEXT PRIMARY KEY, voucherLineId TEXT NOT NULL UNIQUE, instrumentNo TEXT,
    instrumentDate TEXT, clearedOn TEXT, statementRef TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
`);
run(`INSERT INTO meta (key, value) VALUES ('schemaVersion', '1')`);

// ---------------------------------------------------------------- seed defs
// (identical to src/features/accounting/local/seed.ts)
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
function fiscalYearBounds(date) {
  const y = date.getUTCMonth() + 1 >= 4 ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
  return {
    startDate: new Date(Date.UTC(y, 3, 1)).toISOString(),
    endDate: new Date(Date.UTC(y + 1, 2, 31, 23, 59, 59, 999)).toISOString(),
    label: `${y}-${String((y + 1) % 100).padStart(2, '0')}`,
  };
}
const GROUP_SEEDS = [
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
  { name: 'CGST Input A/c', group: 'Duties & Taxes' },
  { name: 'CGST Output A/c', group: 'Duties & Taxes' },
  { name: 'SGST Input A/c', group: 'Duties & Taxes' },
  { name: 'SGST Output A/c', group: 'Duties & Taxes' },
  { name: 'IGST Input A/c', group: 'Duties & Taxes' },
  { name: 'IGST Output A/c', group: 'Duties & Taxes' },
];

const IN_BOOKS = `v.status IN ('POSTED','REVERSED')`;
const PRIMARY_PATH = `(CASE WHEN instr(g.path,'/')>0 THEN substr(g.path,1,instr(g.path,'/')-1) ELSE g.path END)`;

// ============================================================ 1. COMPANY
section('1. Company (auto-seed: groups, voucher types, system ledgers, FY)');
const companyId = uuid();
const ts = nowIso();
const booksBegin = (() => {
  const now = new Date();
  const y = now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(Date.UTC(y, 3, 1));
})();
run(`INSERT INTO company (id, name, gstin, pan, stateCode, fyStartMonth, booksBeginDate, createdAt, updatedAt)
     VALUES (?, 'My Company', '27ABCDE1234F1Z5', 'ABCDE1234F', '27', 4, ?, ?, ?)`,
  companyId, booksBegin.toISOString(), ts, ts);

const idByName = new Map(), pathByName = new Map();
for (const g of GROUP_SEEDS) {
  const id = uuid();
  const parentId = g.parent ? idByName.get(g.parent) : null;
  const parentPath = g.parent ? pathByName.get(g.parent) : '';
  const path = parentPath ? `${parentPath}/${slug(g.name)}` : slug(g.name);
  run(`INSERT INTO account_group (id, companyId, name, parentGroupId, nature, reportSection, isSystem, path, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    id, companyId, g.name, parentId, g.nature, g.reportSection, path, ts, ts);
  idByName.set(g.name, id); pathByName.set(g.name, path);
}
for (const vt of VOUCHER_TYPE_SEEDS)
  run(`INSERT INTO voucher_type (id, companyId, name, code, baseType, isSystem) VALUES (?, ?, ?, ?, ?, 1)`,
    uuid(), companyId, vt.name, vt.code, vt.baseType);
for (const l of SYSTEM_LEDGER_SEEDS)
  run(`INSERT INTO ledger_account (id, companyId, name, groupId, openingBalance, openingBalanceType, isSystem, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 0, 'DR', 1, ?, ?)`,
    uuid(), companyId, l.name, idByName.get(l.group), ts, ts);
const fy = fiscalYearBounds(booksBegin);
const fyId = uuid();
run(`INSERT INTO fiscal_year (id, companyId, label, startDate, endDate, isClosed, createdAt)
     VALUES (?, ?, ?, ?, ?, 0, ?)`, fyId, companyId, fy.label, fy.startDate, fy.endDate, ts);

const fyStartYear = new Date(fy.startDate).getUTCFullYear();
check(all(`SELECT 1 FROM account_group WHERE companyId=?`, companyId).length === GROUP_SEEDS.length, `${GROUP_SEEDS.length} account groups seeded`);
check(all(`SELECT 1 FROM voucher_type WHERE companyId=?`, companyId).length === 8, '8 voucher types seeded');
check(all(`SELECT 1 FROM ledger_account WHERE companyId=?`, companyId).length === 8, '8 system ledgers seeded');
info('open fiscal year', `${fy.label} (${fy.startDate.slice(0, 10)} → ${fy.endDate.slice(0, 10)})`);

// helpers using the company ------------------------------------------------
const groupId = (path) => get(`SELECT id FROM account_group WHERE companyId=? AND path=?`, companyId, path)?.id;
const ledgerId = (name) => get(`SELECT id FROM ledger_account WHERE companyId=? AND name=?`, companyId, name)?.id;
function createLedger(name, path, opts = {}) {
  const id = uuid();
  run(`INSERT INTO ledger_account (id, companyId, name, groupId, openingBalance, openingBalanceType, isSystem, bankName, bankIfsc, description, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
    id, companyId, name, groupId(path), opts.openingBalance ?? 0, opts.openingBalanceType ?? 'DR',
    opts.bankName ?? null, opts.bankIfsc ?? null, opts.description ?? null, ts, ts);
  return id;
}
function createSubGroup(name, parentPath) {
  const parent = get(`SELECT id, path, nature, reportSection FROM account_group WHERE companyId=? AND path=?`, companyId, parentPath);
  const id = uuid();
  run(`INSERT INTO account_group (id, companyId, name, parentGroupId, nature, reportSection, isSystem, path, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    id, companyId, name, parent.id, parent.nature, parent.reportSection, `${parent.path}/${slug(name)}`, ts, ts);
  return id;
}
const dateInFy = (m, d) => new Date(Date.UTC(fyStartYear, m - 1, d)).toISOString();

// voucher posting (mirrors engine.createVoucher with post:true) ------------
function allocateVoucherNo(voucherTypeId, code) {
  const row = get(
    `INSERT INTO voucher_sequence (id, voucherTypeId, fiscalYearId, nextNumber)
     VALUES (?, ?, ?, 2)
     ON CONFLICT(voucherTypeId, fiscalYearId) DO UPDATE SET nextNumber = nextNumber + 1
     RETURNING nextNumber`,
    uuid(), voucherTypeId, fyId);
  const n = row.nextNumber - 1;
  return `${code}/${fy.label}/${String(n).padStart(4, '0')}`;
}
function postVoucher({ code, date, narration, lines, gstLines, status = 'POSTED', reversalOfId = null }) {
  const vt = get(`SELECT id, code, baseType FROM voucher_type WHERE companyId=? AND code=?`, companyId, code);
  const dr = lines.reduce((s, l) => s + (l.debit || 0), 0);
  const cr = lines.reduce((s, l) => s + (l.credit || 0), 0);
  if (Math.round(dr * 100) !== Math.round(cr * 100)) throw new Error(`Unbalanced ${code}: Dr ${dr} ≠ Cr ${cr}`);
  const id = uuid();
  const no = status === 'POSTED' ? allocateVoucherNo(vt.id, vt.code) : null;
  run(`INSERT INTO voucher (id, companyId, fiscalYearId, voucherTypeId, voucherNo, voucherDate, narration, status, reversalOfId, postedAt, createdById, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, companyId, fyId, vt.id, no, date, narration ?? null, status, reversalOfId, status === 'POSTED' ? ts : null, USER_ID, ts, ts);
  let lineNo = 1;
  for (const l of lines)
    run(`INSERT INTO voucher_line (id, voucherId, lineNo, ledgerId, debit, credit, narration) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      uuid(), id, lineNo++, l.ledgerId, l.debit || 0, l.credit || 0, l.narration ?? null);
  for (const g of gstLines ?? [])
    run(`INSERT INTO voucher_gst_line (id, voucherId, description, hsnSac, taxableValue, cgst, sgst, igst, cess) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      uuid(), id, g.description ?? null, g.hsnSac ?? null, g.taxableValue, g.cgst ?? 0, g.sgst ?? 0, g.igst ?? 0, g.cess ?? 0);
  return { id, no, vtId: vt.id };
}

// ============================================================ 2. CHART OF ACCOUNTS
section('2. Chart of Accounts — parent / sub / sub-sub groups');
createSubGroup('Administrative Expenses', 'indirect-expenses');
createSubGroup('Utility Bills', 'indirect-expenses/administrative-expenses');
check(!!groupId('indirect-expenses/administrative-expenses'), 'sub-group "Administrative Expenses" under Indirect Expenses');
check(!!groupId('indirect-expenses/administrative-expenses/utility-bills'), 'sub-sub-group "Utility Bills" (parent → subparent)');

// ============================================================ 3. LEDGERS
section('3. Ledgers (every nature)');
const bankId = createLedger('HDFC Bank A/c', 'current-assets/bank-accounts', { bankName: 'HDFC Bank', bankIfsc: 'HDFC0000123' });
const cashId = ledgerId('Cash A/c');
const capitalId = createLedger("Owner's Capital", 'capital-account', { openingBalanceType: 'CR' });
const salesId = createLedger('Sales - Goods', 'sales-accounts');
const purchaseId = createLedger('Purchase - Goods', 'purchase-accounts');
const debtorId = createLedger('Acme Retailers', 'current-assets/sundry-debtors');
const creditorId = createLedger('Global Suppliers', 'current-liabilities/sundry-creditors');
const rentId = createLedger('Office Rent', 'indirect-expenses');
const electricityId = createLedger('Electricity Charges', 'indirect-expenses/administrative-expenses/utility-bills');
const interestId = createLedger('Interest Income', 'indirect-income');
const equipmentId = createLedger('Office Equipment', 'fixed-assets');
const cgstOut = ledgerId('CGST Output A/c'), sgstOut = ledgerId('SGST Output A/c');
const cgstIn = ledgerId('CGST Input A/c'), sgstIn = ledgerId('SGST Input A/c');
// updateLedger
run(`UPDATE ledger_account SET description=?, updatedAt=? WHERE id=?`, 'Primary current account', nowIso(), bankId);
check(get(`SELECT description FROM ledger_account WHERE id=?`, bankId).description === 'Primary current account', 'updateLedger() on bank');
info('total ledgers', all(`SELECT 1 FROM ledger_account WHERE companyId=?`, companyId).length);

// ============================================================ 4. VOUCHERS
section('4. Vouchers — every type, double-entry, posted');
const vCapital = postVoucher({ code: 'RCT', date: dateInFy(4, 2), narration: 'Owner capital introduced',
  lines: [{ ledgerId: bankId, debit: 500000 }, { ledgerId: capitalId, credit: 500000 }] });
ok(`RECEIPT  (capital)   → ${vCapital.no}`);
const vSales = postVoucher({ code: 'SAL', date: dateInFy(4, 10), narration: 'Sale to Acme Retailers',
  lines: [{ ledgerId: debtorId, debit: 118000 }, { ledgerId: salesId, credit: 100000 },
          { ledgerId: cgstOut, credit: 9000 }, { ledgerId: sgstOut, credit: 9000 }],
  gstLines: [{ description: 'Goods', hsnSac: '1001', taxableValue: 100000, cgst: 9000, sgst: 9000 }] });
ok(`SALES    (with GST)  → ${vSales.no}`);
const vPurchase = postVoucher({ code: 'PUR', date: dateInFy(4, 12), narration: 'Purchase from Global Suppliers',
  lines: [{ ledgerId: purchaseId, debit: 50000 }, { ledgerId: cgstIn, debit: 4500 },
          { ledgerId: sgstIn, debit: 4500 }, { ledgerId: creditorId, credit: 59000 }],
  gstLines: [{ description: 'Raw goods', hsnSac: '1001', taxableValue: 50000, cgst: 4500, sgst: 4500 }] });
ok(`PURCHASE (with GST)  → ${vPurchase.no}`);
const vCollect = postVoucher({ code: 'RCT', date: dateInFy(4, 20), narration: 'Received from Acme Retailers',
  lines: [{ ledgerId: bankId, debit: 118000 }, { ledgerId: debtorId, credit: 118000 }] });
ok(`RECEIPT  (collect)   → ${vCollect.no}`);
const vPayCred = postVoucher({ code: 'PMT', date: dateInFy(4, 22), narration: 'Paid Global Suppliers',
  lines: [{ ledgerId: creditorId, debit: 59000 }, { ledgerId: bankId, credit: 59000 }] });
ok(`PAYMENT  (creditor)  → ${vPayCred.no}`);
const vRent = postVoucher({ code: 'PMT', date: dateInFy(5, 1), narration: 'Office rent for April',
  lines: [{ ledgerId: rentId, debit: 20000 }, { ledgerId: bankId, credit: 20000 }] });
ok(`PAYMENT  (rent)      → ${vRent.no}`);
const vInterest = postVoucher({ code: 'RCT', date: dateInFy(5, 5), narration: 'Bank interest',
  lines: [{ ledgerId: bankId, debit: 1500 }, { ledgerId: interestId, credit: 1500 }] });
ok(`RECEIPT  (interest)  → ${vInterest.no}`);
const vContra = postVoucher({ code: 'CNT', date: dateInFy(5, 6), narration: 'Cash withdrawn from bank',
  lines: [{ ledgerId: cashId, debit: 10000 }, { ledgerId: bankId, credit: 10000 }] });
ok(`CONTRA   (cash draw) → ${vContra.no}`);
const vJournal = postVoucher({ code: 'JRN', date: dateInFy(5, 7), narration: 'Office equipment on credit',
  lines: [{ ledgerId: equipmentId, debit: 15000 }, { ledgerId: creditorId, credit: 15000 }] });
ok(`JOURNAL  (equipment) → ${vJournal.no}`);
const vElec = postVoucher({ code: 'PMT', date: dateInFy(5, 8), narration: 'Electricity bill (cash)',
  lines: [{ ledgerId: electricityId, debit: 3200 }, { ledgerId: cashId, credit: 3200 }] });
ok(`PAYMENT  (electric)  → ${vElec.no}`);

// ============================================================ 5. DRAFT → POST
section('5. Draft voucher → post');
const vDraft = postVoucher({ code: 'JRN', date: dateInFy(5, 9), status: 'DRAFT', narration: 'DRAFT provision',
  lines: [{ ledgerId: rentId, debit: 5000 }, { ledgerId: creditorId, credit: 5000 }] });
check(get(`SELECT status FROM voucher WHERE id=?`, vDraft.id).status === 'DRAFT', 'draft created (no number)');
const draftNo = allocateVoucherNo(vDraft.vtId, 'JRN');
run(`UPDATE voucher SET status='POSTED', voucherNo=?, postedAt=?, updatedAt=? WHERE id=?`, draftNo, nowIso(), nowIso(), vDraft.id);
ok(`postVoucher() → ${draftNo}`);

// ============================================================ 6. REVERSAL
section('6. Reverse a posted voucher');
const revLines = all(`SELECT lineNo, ledgerId, debit, credit, narration FROM voucher_line WHERE voucherId=?`, vRent.id);
const orig = get(`SELECT * FROM voucher WHERE id=?`, vRent.id);
const revNo = allocateVoucherNo(orig.voucherTypeId, 'PMT');
const revId = uuid();
run(`INSERT INTO voucher (id, companyId, fiscalYearId, voucherTypeId, voucherNo, voucherDate, narration, status, reversalOfId, postedAt, createdById, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'POSTED', ?, ?, ?, ?, ?)`,
  revId, companyId, fyId, orig.voucherTypeId, revNo, orig.voucherDate, `Reversal of ${orig.voucherNo}`, orig.id, nowIso(), USER_ID, ts, ts);
for (const l of revLines) // mirror Dr/Cr
  run(`INSERT INTO voucher_line (id, voucherId, lineNo, ledgerId, debit, credit, narration) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    uuid(), revId, l.lineNo, l.ledgerId, l.credit, l.debit, l.narration);
run(`UPDATE voucher SET status='REVERSED', updatedAt=? WHERE id=?`, nowIso(), orig.id);
ok(`reverseVoucher(rent) → mirror ${revNo}; original now REVERSED`);

// ============================================================ 7. BANK RECONCILIATION
section('7. Bank reconciliation');
const firstBankLine = get(
  `SELECT vl.id FROM voucher_line vl JOIN voucher v ON v.id=vl.voucherId
   WHERE vl.ledgerId=? AND ${IN_BOOKS} ORDER BY v.voucherDate LIMIT 1`, bankId);
run(`INSERT INTO bank_reconciliation (id, voucherLineId, instrumentNo, instrumentDate, clearedOn, statementRef, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  uuid(), firstBankLine.id, 'CHQ-100023', dateInFy(4, 3), dateInFy(4, 5), 'STMT-APR', ts, ts);
ok('reconcileLine() on first bank line');

// ============================================================ 8. REPORTS
section('8. Reports (same SQL as the app engine)');

// Trial Balance
const tbRows = all(
  `SELECT la.name AS ledgerName,
     ((CASE WHEN la.openingBalanceType='DR' THEN la.openingBalance ELSE -la.openingBalance END)
      + COALESCE((SELECT SUM(vl.debit - vl.credit) FROM voucher_line vl JOIN voucher v ON v.id=vl.voucherId
                  WHERE vl.ledgerId=la.id AND ${IN_BOOKS}),0)) AS net
   FROM ledger_account la WHERE la.companyId=?`, companyId)
  .filter((r) => Math.round(r.net * 100) !== 0);
const tbDr = tbRows.reduce((s, r) => s + (r.net > 0 ? r.net : 0), 0);
const tbCr = tbRows.reduce((s, r) => s + (r.net < 0 ? -r.net : 0), 0);
check(Math.round(tbDr * 100) === Math.round(tbCr * 100), `Trial Balance balanced (Dr ${tbDr} = Cr ${tbCr})`);

// P&L
const plRows = all(
  `SELECT pg.nature, pg.reportSection, COALESCE(SUM(vl.credit - vl.debit),0) AS creditNet
   FROM voucher_line vl JOIN voucher v ON v.id=vl.voucherId
   JOIN ledger_account la ON la.id=vl.ledgerId JOIN account_group g ON g.id=la.groupId
   JOIN account_group pg ON pg.companyId=g.companyId AND pg.path=${PRIMARY_PATH}
   WHERE la.companyId=? AND ${IN_BOOKS} AND g.nature IN ('INCOME','EXPENSE')
   GROUP BY pg.name, pg.nature, pg.reportSection`, companyId);
const grossProfit = plRows.filter((r) => r.reportSection === 'TRADING').reduce((s, r) => s + r.creditNet, 0);
const netProfit = grossProfit + plRows.filter((r) => r.reportSection === 'PROFIT_AND_LOSS').reduce((s, r) => s + r.creditNet, 0);
info('Gross Profit', grossProfit);
info('Net Profit', netProfit);

// Balance Sheet
const bsRows = all(
  `SELECT pg.nature, SUM((CASE WHEN la.openingBalanceType='DR' THEN la.openingBalance ELSE -la.openingBalance END)
      + COALESCE((SELECT SUM(vl.debit - vl.credit) FROM voucher_line vl JOIN voucher v ON v.id=vl.voucherId
                  WHERE vl.ledgerId=la.id AND ${IN_BOOKS}),0)) AS debitNet
   FROM ledger_account la JOIN account_group g ON g.id=la.groupId
   JOIN account_group pg ON pg.companyId=g.companyId AND pg.path=${PRIMARY_PATH}
   WHERE la.companyId=? AND g.nature IN ('ASSET','LIABILITY')
   GROUP BY pg.name, pg.nature`, companyId).filter((r) => Math.round(r.debitNet * 100) !== 0);
const totalAssets = bsRows.filter((r) => r.nature === 'ASSET').reduce((s, r) => s + r.debitNet, 0);
const totalLiab = bsRows.filter((r) => r.nature === 'LIABILITY').reduce((s, r) => s + -r.debitNet, 0) + netProfit;
const bsDiff = Math.round((totalAssets - totalLiab) * 100) / 100;
check(bsDiff === 0, `Balance Sheet balances (Assets ${totalAssets} = Liab+P&L ${totalLiab})`);

// Cash / Bank book + Day Book + Ledger statement (row counts)
const cashRows = all(`SELECT vl.id FROM voucher_line vl JOIN voucher v ON v.id=vl.voucherId
  JOIN ledger_account la ON la.id=vl.ledgerId JOIN account_group g ON g.id=la.groupId
  WHERE la.companyId=? AND ${IN_BOOKS} AND (g.path='current-assets/cash-in-hand' OR g.path LIKE 'current-assets/cash-in-hand/%')`, companyId);
const bankRows = all(`SELECT vl.id FROM voucher_line vl JOIN voucher v ON v.id=vl.voucherId
  JOIN ledger_account la ON la.id=vl.ledgerId JOIN account_group g ON g.id=la.groupId
  WHERE la.companyId=? AND ${IN_BOOKS} AND (g.path='current-assets/bank-accounts' OR g.path LIKE 'current-assets/bank-accounts/%')`, companyId);
const dayBook = all(`SELECT id FROM voucher WHERE companyId=? AND status IN ('POSTED','REVERSED')`, companyId);
const bankStmt = all(
  `SELECT SUM(vl.debit - vl.credit) OVER (ORDER BY v.voucherDate, v.createdAt, vl.lineNo) AS bal
   FROM voucher_line vl JOIN voucher v ON v.id=vl.voucherId WHERE vl.ledgerId=? AND ${IN_BOOKS}
   ORDER BY v.voucherDate, v.createdAt, vl.lineNo`, bankId);
info('Cash Book rows', cashRows.length);
info('Bank Book rows', bankRows.length);
info('Day Book vouchers', dayBook.length);
info('Bank ledger closing', bankStmt.length ? bankStmt[bankStmt.length - 1].bal : 0);
info('Total vouchers', all(`SELECT id FROM voucher WHERE companyId=?`, companyId).length);

db.close();

// ============================================================ 9. SERVER DATA
// Parties / Items / Bills live on the backend (shared with GST/e-invoice), so
// seed them via the API too — this is what populates the dashboard's
// Parties / Items counts (the local DB above populates Ledgers/Vouchers).
await runServer('seed');

// ============================================================ DONE
section(failures === 0 ? `✔ ALL LOCAL CHECKS PASSED` : `✖ ${failures} LOCAL CHECK(S) FAILED`);
console.log(`\n  Local accounting DB written to:\n    ${c.bold}${OUT}${c.reset}\n`);
console.log(`  Where each part shows in the app:`);
console.log(`    ${c.dim}• Parties / Items / Bills  → seeded on the SERVER above → appear in the app now.${c.reset}`);
console.log(`    ${c.dim}• Ledgers / Vouchers       → local DB. To see them in the running app, open its${c.reset}`);
console.log(`      ${c.dim}console and run  await billshieldSelfTest()  (terminal can't write the app's${c.reset}`);
console.log(`      ${c.dim}on-device store). On Android, import ${OUT.split('/').pop()} via Restore-from-file.${c.reset}\n`);
process.exit(failures === 0 ? 0 : 1);
