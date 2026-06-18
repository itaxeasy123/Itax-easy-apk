/**
 * BillShield local self-test / sample-data seeder.
 *
 * BillShield is now 100% on-device (expo-sqlite) — there is no server API to
 * hit. This module exercises EVERY engine function the screens use, with
 * realistic sample data, so you can verify the whole module end-to-end and
 * then see the data populated on the frontend (Chart of Accounts, Vouchers,
 * Trial Balance, P&L, Balance Sheet, Day Book, Cash/Bank book, etc.).
 *
 * HOW TO RUN
 *   Web  : open the browser DevTools console and run  await billshieldSelfTest()
 *   (the function is registered on window/globalThis from app/_layout.tsx in dev)
 *
 * It is re-runnable: ledgers/sub-groups are reused by name/path instead of
 * duplicated, but every run posts a fresh batch of vouchers (so amounts grow).
 * To start clean, call  await billshieldReset()  first (drops & re-seeds the DB).
 */
import * as engine from './engine';
import { closeDb, getDb } from './db';

const USER_ID = 1;

// ----------------------------------------------------------------- helpers

function section(title: string) {
  // eslint-disable-next-line no-console
  console.log(`\n%c━━ ${title} ━━`, 'color:#2563eb;font-weight:bold');
}
function ok(msg: string) {
  // eslint-disable-next-line no-console
  console.log(`  ✅ ${msg}`);
}
function info(label: string, value: unknown) {
  // eslint-disable-next-line no-console
  console.log(`  • ${label}:`, value);
}

/** Find a seeded group's id by its path (paths are deterministic slugs). */
async function groupIdByPath(companyId: string, path: string): Promise<string> {
  const groups = await engine.listGroups(companyId);
  const g = groups.find((x: any) => x.path === path);
  if (!g) throw new Error(`Group with path "${path}" not found`);
  return g.id;
}

/** Find an existing ledger by exact name, else create it (idempotent). */
async function ensureLedger(
  companyId: string,
  name: string,
  groupPath: string,
  opts: { openingBalance?: number; openingBalanceType?: 'DR' | 'CR'; bankName?: string; bankIfsc?: string } = {}
): Promise<string> {
  const ledgers = await engine.listLedgers(companyId);
  const existing = ledgers.find((l: any) => l.name === name);
  if (existing) return existing.id;
  const groupId = await groupIdByPath(companyId, groupPath);
  const created = await engine.createLedger(companyId, { name, groupId, ...opts });
  return created.id;
}

/** Find an existing system/auto ledger by exact name (must already exist). */
async function ledgerIdByName(companyId: string, name: string): Promise<string> {
  const ledgers = await engine.listLedgers(companyId);
  const l = ledgers.find((x: any) => x.name === name);
  if (!l) throw new Error(`Ledger "${name}" not found`);
  return l.id;
}

/** Create a sub-group under a parent path, reusing it if the path already exists. */
async function ensureSubGroup(companyId: string, name: string, parentPath: string): Promise<string> {
  const parentId = await groupIdByPath(companyId, parentPath);
  const slugged = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const wantPath = `${parentPath}/${slugged}`;
  const groups = await engine.listGroups(companyId);
  const existing = groups.find((x: any) => x.path === wantPath);
  if (existing) return existing.id;
  const created = await engine.createSubGroup(companyId, name, parentId);
  return created.id;
}

/** A date inside the open fiscal year (so vouchers are accepted). */
function dateInFy(openFyStartYear: number, month: number, day: number): string {
  return new Date(Date.UTC(openFyStartYear, month - 1, day)).toISOString();
}

// ------------------------------------------------------------------- main

export async function runBillShieldSelfTest() {
  const summary: Record<string, unknown> = {};

  // 1) COMPANY ---------------------------------------------------------------
  section('1. Company (auto-seeds Chart of Accounts, voucher types, FY)');
  const companyId = await engine.ensureCompany();
  ok(`company ready: ${companyId}`);
  const companies = await engine.listCompanies();
  info('companies on device', companies.length);

  const fys = await engine.listFiscalYears(companyId);
  const openFy = fys.find((f: any) => !f.isClosed) ?? fys[0];
  const fyStartYear = new Date(openFy.startDate).getUTCFullYear();
  info('open fiscal year', `${openFy.label} (start ${openFy.startDate.slice(0, 10)})`);

  // 2) CHART OF ACCOUNTS: parent + sub-group + sub-sub-group -----------------
  section('2. Chart of Accounts — parent / sub / sub-sub groups');
  const adminGroupId = await ensureSubGroup(companyId, 'Administrative Expenses', 'indirect-expenses');
  ok('sub-group created under Indirect Expenses: "Administrative Expenses"');
  await ensureSubGroup(companyId, 'Utility Bills', 'indirect-expenses/administrative-expenses');
  ok('sub-sub-group created: "Utility Bills" (parent → subparent demonstrated)');

  const tree = await engine.getGroupTree(companyId);
  info('top-level groups in tree', tree.length);

  // 3) LEDGERS (every nature) ------------------------------------------------
  section('3. Ledgers');
  const bankId = await ensureLedger(companyId, 'HDFC Bank A/c', 'current-assets/bank-accounts', {
    bankName: 'HDFC Bank', bankIfsc: 'HDFC0000123',
  });
  const cashId = await ledgerIdByName(companyId, 'Cash A/c'); // system ledger
  const capitalId = await ensureLedger(companyId, "Owner's Capital", 'capital-account', {
    openingBalance: 0, openingBalanceType: 'CR',
  });
  const salesId = await ensureLedger(companyId, 'Sales - Goods', 'sales-accounts');
  const purchaseId = await ensureLedger(companyId, 'Purchase - Goods', 'purchase-accounts');
  const debtorId = await ensureLedger(companyId, 'Acme Retailers', 'current-assets/sundry-debtors');
  const creditorId = await ensureLedger(companyId, 'Global Suppliers', 'current-liabilities/sundry-creditors');
  const rentId = await ensureLedger(companyId, 'Office Rent', 'indirect-expenses');
  // ledger under the newly created sub-group:
  const electricityGroupId = await groupIdByPath(companyId, 'indirect-expenses/administrative-expenses/utility-bills');
  const electricityLedgers = await engine.listLedgers(companyId);
  let electricityId = electricityLedgers.find((l: any) => l.name === 'Electricity Charges')?.id;
  if (!electricityId) {
    electricityId = (await engine.createLedger(companyId, { name: 'Electricity Charges', groupId: electricityGroupId })).id;
  }
  const interestId = await ensureLedger(companyId, 'Interest Income', 'indirect-income');
  const equipmentId = await ensureLedger(companyId, 'Office Equipment', 'fixed-assets');
  const cgstOut = await ledgerIdByName(companyId, 'CGST Output A/c');
  const sgstOut = await ledgerIdByName(companyId, 'SGST Output A/c');
  const cgstIn = await ledgerIdByName(companyId, 'CGST Input A/c');
  const sgstIn = await ledgerIdByName(companyId, 'SGST Input A/c');
  ok(`ledgers ready (bank, cash, capital, sales, purchase, debtor, creditor, rent, electricity, interest, equipment, GST)`);
  info('total ledgers', (await engine.listLedgers(companyId)).length);

  // Demonstrate updateLedger (rename description) ----------------------------
  await engine.updateLedger(companyId, bankId, { description: 'Primary current account' });
  ok('updateLedger() — bank description set');

  // 4) VOUCHERS — one of every base type, all POSTED -------------------------
  section('4. Vouchers — every type, double-entry, posted');
  const posted: Record<string, any> = {};

  // RECEIPT: capital introduced into bank (must DEBIT cash/bank)
  posted.capital = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'RCT', voucherDate: dateInFy(fyStartYear, 4, 2), post: true,
    narration: 'Owner capital introduced',
    lines: [
      { ledgerId: bankId, debit: 500000, credit: 0 },
      { ledgerId: capitalId, debit: 0, credit: 500000 },
    ],
  });
  ok(`RECEIPT (capital)  → ${posted.capital.voucherNo}`);

  // SALES: invoice with GST (must CREDIT a sales-accounts ledger)
  posted.sales = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'SAL', voucherDate: dateInFy(fyStartYear, 4, 10), post: true,
    narration: 'Sale to Acme Retailers', partyId: null,
    lines: [
      { ledgerId: debtorId, debit: 118000, credit: 0 },
      { ledgerId: salesId, debit: 0, credit: 100000 },
      { ledgerId: cgstOut, debit: 0, credit: 9000 },
      { ledgerId: sgstOut, debit: 0, credit: 9000 },
    ],
    gstLines: [{ description: 'Goods', hsnSac: '1001', taxableValue: 100000, cgst: 9000, sgst: 9000 }],
  });
  ok(`SALES (with GST)   → ${posted.sales.voucherNo}`);

  // PURCHASE: bill with GST (must DEBIT a purchase-accounts ledger)
  posted.purchase = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'PUR', voucherDate: dateInFy(fyStartYear, 4, 12), post: true,
    narration: 'Purchase from Global Suppliers',
    lines: [
      { ledgerId: purchaseId, debit: 50000, credit: 0 },
      { ledgerId: cgstIn, debit: 4500, credit: 0 },
      { ledgerId: sgstIn, debit: 4500, credit: 0 },
      { ledgerId: creditorId, debit: 0, credit: 59000 },
    ],
    gstLines: [{ description: 'Raw goods', hsnSac: '1001', taxableValue: 50000, cgst: 4500, sgst: 4500 }],
  });
  ok(`PURCHASE (with GST)→ ${posted.purchase.voucherNo}`);

  // RECEIPT from debtor (collect the invoice) — must DEBIT bank
  posted.collect = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'RCT', voucherDate: dateInFy(fyStartYear, 4, 20), post: true,
    narration: 'Received from Acme Retailers',
    lines: [
      { ledgerId: bankId, debit: 118000, credit: 0 },
      { ledgerId: debtorId, debit: 0, credit: 118000 },
    ],
  });
  ok(`RECEIPT (collect)  → ${posted.collect.voucherNo}`);

  // PAYMENT to creditor — must CREDIT bank/cash
  posted.payCreditor = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'PMT', voucherDate: dateInFy(fyStartYear, 4, 22), post: true,
    narration: 'Paid Global Suppliers',
    lines: [
      { ledgerId: creditorId, debit: 59000, credit: 0 },
      { ledgerId: bankId, debit: 0, credit: 59000 },
    ],
  });
  ok(`PAYMENT (creditor) → ${posted.payCreditor.voucherNo}`);

  // PAYMENT: rent (expense) — must CREDIT bank/cash
  posted.rent = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'PMT', voucherDate: dateInFy(fyStartYear, 5, 1), post: true,
    narration: 'Office rent for April',
    lines: [
      { ledgerId: rentId, debit: 20000, credit: 0 },
      { ledgerId: bankId, debit: 0, credit: 20000 },
    ],
  });
  ok(`PAYMENT (rent)     → ${posted.rent.voucherNo}`);

  // RECEIPT: interest income — must DEBIT bank/cash
  posted.interest = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'RCT', voucherDate: dateInFy(fyStartYear, 5, 5), post: true,
    narration: 'Bank interest',
    lines: [
      { ledgerId: bankId, debit: 1500, credit: 0 },
      { ledgerId: interestId, debit: 0, credit: 1500 },
    ],
  });
  ok(`RECEIPT (interest) → ${posted.interest.voucherNo}`);

  // CONTRA: cash withdrawn from bank — both sides cash/bank
  posted.contra = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'CNT', voucherDate: dateInFy(fyStartYear, 5, 6), post: true,
    narration: 'Cash withdrawn from bank',
    lines: [
      { ledgerId: cashId, debit: 10000, credit: 0 },
      { ledgerId: bankId, debit: 0, credit: 10000 },
    ],
  });
  ok(`CONTRA (cash draw) → ${posted.contra.voucherNo}`);

  // JOURNAL: capitalise equipment bought on credit — no cash/bank rule
  posted.journal = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'JRN', voucherDate: dateInFy(fyStartYear, 5, 7), post: true,
    narration: 'Office equipment purchased on credit',
    lines: [
      { ledgerId: equipmentId, debit: 15000, credit: 0 },
      { ledgerId: creditorId, debit: 0, credit: 15000 },
    ],
  });
  ok(`JOURNAL (equipment)→ ${posted.journal.voucherNo}`);

  // PAYMENT: electricity (ledger under the new sub-sub-group) — pay by cash
  posted.electricity = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'PMT', voucherDate: dateInFy(fyStartYear, 5, 8), post: true,
    narration: 'Electricity bill (cash)',
    lines: [
      { ledgerId: electricityId, debit: 3200, credit: 0 },
      { ledgerId: cashId, debit: 0, credit: 3200 },
    ],
  });
  ok(`PAYMENT (electric) → ${posted.electricity.voucherNo}`);

  // 5) DRAFT voucher (not posted) -------------------------------------------
  section('5. Draft voucher (created, not posted)');
  const draft = await engine.createVoucher(companyId, USER_ID, {
    voucherTypeCode: 'JRN', voucherDate: dateInFy(fyStartYear, 5, 9), post: false,
    narration: 'DRAFT — provision (review before posting)',
    lines: [
      { ledgerId: rentId, debit: 5000, credit: 0 },
      { ledgerId: creditorId, debit: 0, credit: 5000 },
    ],
  });
  ok(`DRAFT created (status=${draft.status}, no number yet)`);
  // post it via the explicit postVoucher() path to test that too
  const postedDraft = await engine.postVoucher(companyId, draft.id);
  ok(`postVoucher() → now ${postedDraft.status} ${postedDraft.voucherNo}`);

  // 6) REVERSAL --------------------------------------------------------------
  section('6. Reverse a posted voucher');
  const reversal = await engine.reverseVoucher(companyId, USER_ID, posted.rent.id);
  ok(`reverseVoucher(rent) → mirror voucher ${reversal.voucherNo}`);

  // 7) BANK RECONCILIATION ---------------------------------------------------
  section('7. Bank reconciliation');
  const bankRows = await engine.bankbook(companyId);
  if (bankRows.length) {
    await engine.reconcileLine(bankRows[0].lineId, {
      instrumentNo: 'CHQ-100023', instrumentDate: dateInFy(fyStartYear, 4, 3),
      clearedOn: dateInFy(fyStartYear, 4, 5), statementRef: 'STMT-APR',
    });
    ok(`reconcileLine() on first bank line (${bankRows[0].voucherNo ?? 'n/a'})`);
  }

  // 8) REPORTS ---------------------------------------------------------------
  section('8. Reports (computed on-device)');
  const tb = await engine.trialBalance(companyId);
  info('Trial Balance', `Dr ${tb.totals.debit} / Cr ${tb.totals.credit} (balanced: ${
    Math.round(tb.totals.debit * 100) === Math.round(tb.totals.credit * 100)})`);

  const pnl = await engine.profitAndLoss(companyId);
  info('Gross Profit', pnl.trading.grossProfit);
  info('Net Profit', pnl.profitAndLoss.netProfit);

  const bs = await engine.balanceSheet(companyId);
  info('Balance Sheet', `Assets ${bs.totals.assets} / Liab ${bs.totals.liabilities} (diff ${bs.totals.difference})`);

  const cash = await engine.cashbook(companyId);
  info('Cash Book rows', cash.length);
  info('Bank Book rows', bankRows.length);

  const day = await engine.dayBook(companyId);
  info('Day Book vouchers', day.length);

  const stmt = await engine.ledgerStatement(companyId, bankId);
  info('Bank ledger statement', `${stmt.entries.length} entries, closing ${stmt.closing.amount} ${stmt.closing.type}`);

  const allVouchers = await engine.listVouchers(companyId);
  info('Total vouchers on device', allVouchers.length);

  summary.companyId = companyId;
  summary.fiscalYear = openFy.label;
  summary.ledgers = (await engine.listLedgers(companyId)).length;
  summary.vouchers = allVouchers.length;
  summary.trialBalanceBalanced = Math.round(tb.totals.debit * 100) === Math.round(tb.totals.credit * 100);
  summary.grossProfit = pnl.trading.grossProfit;
  summary.netProfit = pnl.profitAndLoss.netProfit;
  summary.balanceSheetDifference = bs.totals.difference;

  section('✔ DONE — open the app screens to see this data');
  // eslint-disable-next-line no-console
  console.log('Summary:', summary);
  // eslint-disable-next-line no-console
  console.log('Now visit: /accounting (dashboard) → More → Chart of Accounts / Vouchers, and Reports.');
  return summary;
}

/** Drops every BillShield row and re-seeds an empty company. Use for a clean run. */
export async function resetBillShield() {
  const db = await getDb();
  const tables = [
    'bank_reconciliation', 'voucher_gst_line', 'voucher_line', 'voucher',
    'voucher_sequence', 'ledger_account', 'account_group', 'voucher_type',
    'fiscal_year', 'company',
  ];
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const t of tables) await tx.runAsync(`DELETE FROM ${t}`);
  });
  await closeDb();
  // eslint-disable-next-line no-console
  console.log('🧹 BillShield local DB cleared. Run billshieldSelfTest() to re-seed.');
}
