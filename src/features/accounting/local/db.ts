/**
 * Local BillShield database (on-device SQLite).
 *
 * This is the single source of truth for ALL BillShield accounting data —
 * companies, fiscal years, chart of accounts, ledgers, vouchers and their
 * lines. Nothing here is sent to our backend; the only off-device copy is
 * the user's own Google Drive backup (see ./drive.ts + ./sync.ts).
 *
 * Stored at: <app sandbox>/SQLite/billshield.db (Android internal storage).
 */
import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'billshield.db';
const SCHEMA_VERSION = 1;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Opens (once) and returns the shared SQLite handle, running migrations. */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
      await migrate(db);
      return db;
    })();
  }
  return dbPromise;
}

/** Closes the handle (used by restore, which replaces the DB file). */
export async function closeDb(): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.closeAsync();
  dbPromise = null;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS company (
      id             TEXT PRIMARY KEY,
      name           TEXT NOT NULL,
      gstin          TEXT,
      pan            TEXT,
      stateCode      TEXT,
      fyStartMonth   INTEGER NOT NULL DEFAULT 4,
      booksBeginDate TEXT NOT NULL,
      createdAt      TEXT NOT NULL,
      updatedAt      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fiscal_year (
      id        TEXT PRIMARY KEY,
      companyId TEXT NOT NULL,
      label     TEXT NOT NULL,
      startDate TEXT NOT NULL,
      endDate   TEXT NOT NULL,
      isClosed  INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_fy_company ON fiscal_year(companyId);

    CREATE TABLE IF NOT EXISTS account_group (
      id            TEXT PRIMARY KEY,
      companyId     TEXT NOT NULL,
      name          TEXT NOT NULL,
      parentGroupId TEXT,
      nature        TEXT NOT NULL,
      reportSection TEXT NOT NULL,
      isSystem      INTEGER NOT NULL DEFAULT 0,
      path          TEXT NOT NULL,
      createdAt     TEXT NOT NULL,
      updatedAt     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_group_company ON account_group(companyId);
    CREATE INDEX IF NOT EXISTS idx_group_parent ON account_group(parentGroupId);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_group_name ON account_group(companyId, name);

    CREATE TABLE IF NOT EXISTS ledger_account (
      id                 TEXT PRIMARY KEY,
      companyId          TEXT NOT NULL,
      name               TEXT NOT NULL,
      groupId            TEXT NOT NULL,
      openingBalance     REAL NOT NULL DEFAULT 0,
      openingBalanceType TEXT NOT NULL DEFAULT 'DR',
      isSystem           INTEGER NOT NULL DEFAULT 0,
      partyId            TEXT,
      bankName           TEXT,
      bankAccountNo      TEXT,
      bankIfsc           TEXT,
      description        TEXT,
      createdAt          TEXT NOT NULL,
      updatedAt          TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_ledger_company ON ledger_account(companyId);
    CREATE INDEX IF NOT EXISTS idx_ledger_group ON ledger_account(groupId);
    CREATE UNIQUE INDEX IF NOT EXISTS uq_ledger_name ON ledger_account(companyId, name);

    CREATE TABLE IF NOT EXISTS voucher_type (
      id        TEXT PRIMARY KEY,
      companyId TEXT NOT NULL,
      name      TEXT NOT NULL,
      code      TEXT NOT NULL,
      baseType  TEXT NOT NULL,
      isSystem  INTEGER NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IF NOT EXISTS uq_vtype_code ON voucher_type(companyId, code);

    CREATE TABLE IF NOT EXISTS voucher_sequence (
      id            TEXT PRIMARY KEY,
      voucherTypeId TEXT NOT NULL,
      fiscalYearId  TEXT NOT NULL,
      nextNumber    INTEGER NOT NULL DEFAULT 1
    );
    CREATE UNIQUE INDEX IF NOT EXISTS uq_seq ON voucher_sequence(voucherTypeId, fiscalYearId);

    CREATE TABLE IF NOT EXISTS voucher (
      id            TEXT PRIMARY KEY,
      companyId     TEXT NOT NULL,
      fiscalYearId  TEXT NOT NULL,
      voucherTypeId TEXT NOT NULL,
      voucherNo     TEXT,
      voucherDate   TEXT NOT NULL,
      narration     TEXT,
      partyId       TEXT,
      status        TEXT NOT NULL DEFAULT 'DRAFT',
      reversalOfId  TEXT,
      postedAt      TEXT,
      createdById   INTEGER NOT NULL DEFAULT 0,
      createdAt     TEXT NOT NULL,
      updatedAt     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_voucher_company ON voucher(companyId);
    CREATE INDEX IF NOT EXISTS idx_voucher_date ON voucher(companyId, voucherDate);
    CREATE INDEX IF NOT EXISTS idx_voucher_status ON voucher(companyId, status);

    CREATE TABLE IF NOT EXISTS voucher_line (
      id        TEXT PRIMARY KEY,
      voucherId TEXT NOT NULL,
      lineNo    INTEGER NOT NULL,
      ledgerId  TEXT NOT NULL,
      debit     REAL NOT NULL DEFAULT 0,
      credit    REAL NOT NULL DEFAULT 0,
      narration TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_line_voucher ON voucher_line(voucherId);
    CREATE INDEX IF NOT EXISTS idx_line_ledger ON voucher_line(ledgerId, voucherId);

    CREATE TABLE IF NOT EXISTS voucher_gst_line (
      id           TEXT PRIMARY KEY,
      voucherId    TEXT NOT NULL,
      description  TEXT,
      hsnSac       TEXT,
      taxableValue REAL NOT NULL DEFAULT 0,
      cgst         REAL NOT NULL DEFAULT 0,
      sgst         REAL NOT NULL DEFAULT 0,
      igst         REAL NOT NULL DEFAULT 0,
      cess         REAL NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_gstline_voucher ON voucher_gst_line(voucherId);

    CREATE TABLE IF NOT EXISTS bank_reconciliation (
      id             TEXT PRIMARY KEY,
      voucherLineId  TEXT NOT NULL UNIQUE,
      instrumentNo   TEXT,
      instrumentDate TEXT,
      clearedOn      TEXT,
      statementRef   TEXT,
      createdAt      TEXT NOT NULL,
      updatedAt      TEXT NOT NULL
    );
  `);

  const current = Number((await getMeta(db, 'schemaVersion')) ?? '0');
  if (current < SCHEMA_VERSION) {
    await setMeta(db, 'schemaVersion', String(SCHEMA_VERSION));
  }
}

// ---- meta helpers (schema version, dirty flag, last sync) ----

export async function getMeta(db: SQLite.SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM meta WHERE key = ?', [key]);
  return row?.value ?? null;
}

export async function setMeta(db: SQLite.SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}

/** RFC4122-ish v4 uuid (Math.random is fine on-device). */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}
