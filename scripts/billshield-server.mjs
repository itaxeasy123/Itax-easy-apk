/**
 * Server-side BillShield seed/cleanup (Parties, Items, Bills).
 *
 * These entities are SHARED with the GST / invoice / e-invoice modules, so
 * they live on the backend (Postgres), not on the device. This module logs
 * into the backend and creates/deletes sample data via the same REST API the
 * app uses — so it shows up on the dashboard (Parties / Items counts).
 *
 * Everything created here is name-tagged with  [BS-TEST]  so cleanup can find
 * and remove exactly what the seeder made (nothing else is touched).
 *
 * CONFIG (env vars):
 *   BILLSHIELD_TEST_EMAIL     login email of the user whose books to seed
 *   BILLSHIELD_TEST_PASSWORD  that user's password
 *   API_BASE_URL              optional override; else read from .env EXPO_PUBLIC_API_BASE_URL
 *
 * If credentials are missing or the backend is unreachable, the server step is
 * skipped with a clear message (the local part of the scripts still runs).
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const TAG = '[BS-TEST]';

const c = { green: '\x1b[32m', dim: '\x1b[2m', bold: '\x1b[1m', red: '\x1b[31m', yellow: '\x1b[33m', blue: '\x1b[34m', reset: '\x1b[0m' };
const warn = (m) => console.log(`  ${c.yellow}!${c.reset} ${m}`);
const ok = (m) => console.log(`  ${c.green}✓${c.reset} ${m}`);
const info = (k, v) => console.log(`  ${c.dim}•${c.reset} ${k}: ${c.bold}${v}${c.reset}`);

function apiBaseUrl() {
  if (process.env.API_BASE_URL) return process.env.API_BASE_URL.replace(/\/+$/, '');
  const envFile = resolve(process.cwd(), '.env');
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, 'utf8').match(/^\s*EXPO_PUBLIC_API_BASE_URL\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/\/+$/, '');
  }
  return 'http://localhost:8000/api';
}

function getConfig() {
  return {
    baseUrl: apiBaseUrl(),
    email: process.env.BILLSHIELD_TEST_EMAIL,
    password: process.env.BILLSHIELD_TEST_PASSWORD,
  };
}

async function api(baseUrl, path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { status: res.status, ok: res.ok, data };
}

async function login(cfg) {
  const r = await api(cfg.baseUrl, '/user/login', { method: 'POST', body: { email: cfg.email, password: cfg.password } });
  if (r.status === 403 && r.data?.needsVerification) {
    throw new Error(`account "${cfg.email}" is not verified — verify it (OTP) once in the app, then re-run`);
  }
  if (!r.ok || !r.data?.data?.token) {
    throw new Error(`login failed (${r.status}): ${r.data?.message ?? 'no token returned'}`);
  }
  return r.data.data.token;
}

const arrFrom = (data) =>
  data?.parties ?? data?.items ?? data?.data ?? (Array.isArray(data) ? data : []);

// ------------------------------------------------------------------- seed
const PARTIES = [
  { partyName: `${TAG} Acme Retailers`, type: 'customer', gstin: '27AAACR1234A1Z5', pan: 'AAACR1234A', phone: '9000000001', email: 'acme@example.com', address: 'Mumbai, Maharashtra' },
  { partyName: `${TAG} Sunrise Traders`, type: 'customer', gstin: '29AABCS5678B1Z2', pan: 'AABCS5678B', phone: '9000000002', email: 'sunrise@example.com', address: 'Bengaluru, Karnataka' },
  { partyName: `${TAG} Global Suppliers`, type: 'supplier', gstin: '27AAACG9012C1Z8', pan: 'AAACG9012C', phone: '9000000003', email: 'global@example.com', address: 'Pune, Maharashtra' },
  { partyName: `${TAG} Metro Wholesale`, type: 'supplier', gstin: '07AAACM3456D1Z1', pan: 'AAACM3456D', phone: '9000000004', email: 'metro@example.com', address: 'Delhi' },
];
const ITEMS = [
  { itemName: `${TAG} Steel Rod`, unit: 'pieces', price: 500, hsnCode: '7214', cgst: 9, sgst: 9, openingStock: 100, description: 'TMT steel rod' },
  { itemName: `${TAG} Cement Bag`, unit: 'pieces', price: 350, hsnCode: '2523', cgst: 14, sgst: 14, openingStock: 200, description: '50kg cement bag' },
  { itemName: `${TAG} Consulting Service`, unit: 'pieces', price: 5000, hsnCode: '9983', cgst: 9, sgst: 9, taxExempted: false, description: 'Advisory service' },
];
const PAYABLES = [
  { supplierName: `${TAG} Global Suppliers`, supplierAddress: 'Pune, Maharashtra', contact: '9000000003', billDate: '2026-04-12', dueDate: '2026-05-12', billAmount: 59000, billNumber: 'BS-TEST-BILL-001', billDiscription: 'Raw goods', paymentMethod: 'bank', paymentAmount: 59000, tax: 9000, comment: 'test payable', invoiceNumber: 'BS-TEST-INV-001' },
];
const RECEIVABLES = [
  { customerName: `${TAG} Acme Retailers`, customerAddress: 'Mumbai, Maharashtra', contact: '9000000001', amount: 118000, tax: 18000, billNumber: 'BS-TEST-REC-001', itemQuantity: 1, itemPrice: 100000, itemDescription: 'Goods', paymentStatus: 'pending', paymentMethod: 'bank', dueDate: '2026-05-20', comment: 'test receivable' },
];

async function seed(cfg, token) {
  let parties = 0, items = 0, bills = 0;

  for (const p of PARTIES) {
    const r = await api(cfg.baseUrl, '/invoice/parties', { method: 'POST', token, body: p });
    if (r.ok) { parties++; ok(`party (${p.type}) → ${p.partyName}`); }
    else warn(`party "${p.partyName}" failed (${r.status}): ${r.data?.message ?? ''}`);
  }

  for (const it of ITEMS) {
    const r = await api(cfg.baseUrl, '/invoice/items', { method: 'POST', token, body: it });
    if (r.ok) { items++; ok(`item → ${it.itemName}`); }
    else if (r.status === 403) { warn(`items skipped — "inventory" is not enabled for this user (enable it to seed items)`); break; }
    else warn(`item "${it.itemName}" failed (${r.status}): ${r.data?.message ?? ''}`);
  }

  for (const b of PAYABLES) {
    const r = await api(cfg.baseUrl, '/billpayable/create', { method: 'POST', token, body: b });
    if (r.ok) { bills++; ok(`bill payable → ${b.billNumber}`); }
    else warn(`bill payable failed (${r.status}): ${r.data?.message ?? ''}`);
  }
  for (const b of RECEIVABLES) {
    const r = await api(cfg.baseUrl, '/billrecieve/create', { method: 'POST', token, body: b });
    if (r.ok) { bills++; ok(`bill receivable → ${b.billNumber}`); }
    else warn(`bill receivable failed (${r.status}): ${r.data?.message ?? ''}`);
  }

  info('parties created', parties);
  info('items created', items);
  info('bills created', bills);
  return { parties, items, bills };
}

// ------------------------------------------------------------------ clean
async function clean(cfg, token) {
  let parties = 0, items = 0, bills = 0;

  const pr = await api(cfg.baseUrl, '/invoice/parties', { token });
  for (const p of arrFrom(pr.data).filter((x) => (x.partyName ?? '').startsWith(TAG))) {
    const r = await api(cfg.baseUrl, `/invoice/parties/${p.id}`, { method: 'DELETE', token });
    if (r.ok) { parties++; ok(`deleted party → ${p.partyName}`); }
  }

  const ir = await api(cfg.baseUrl, '/invoice/items', { token });
  for (const it of arrFrom(ir.data).filter((x) => (x.itemName ?? '').startsWith(TAG))) {
    const r = await api(cfg.baseUrl, `/invoice/items/${it.id}`, { method: 'DELETE', token });
    if (r.ok) { items++; ok(`deleted item → ${it.itemName}`); }
  }

  const pa = await api(cfg.baseUrl, '/billpayable/getAll', { token });
  for (const b of arrFrom(pa.data).filter((x) => (x.supplierName ?? '').startsWith(TAG) || (x.billNumber ?? '').startsWith('BS-TEST'))) {
    const r = await api(cfg.baseUrl, `/billpayable/delete/${b.id}`, { method: 'DELETE', token });
    if (r.ok) { bills++; ok(`deleted bill payable → ${b.billNumber}`); }
  }
  const re = await api(cfg.baseUrl, '/billrecieve/getAll', { token });
  for (const b of arrFrom(re.data).filter((x) => (x.customerName ?? '').startsWith(TAG) || (x.billNumber ?? '').startsWith('BS-TEST'))) {
    const r = await api(cfg.baseUrl, `/billrecieve/delete/${b.id}`, { method: 'DELETE', token });
    if (r.ok) { bills++; ok(`deleted bill receivable → ${b.billNumber}`); }
  }

  info('parties removed', parties);
  info('items removed', items);
  info('bills removed', bills);
  return { parties, items, bills };
}

/** Orchestrates the server step. mode = 'seed' | 'clean'. Never throws on a
 *  missing backend / missing creds — it warns and returns { skipped: true }. */
export async function runServer(mode) {
  console.log(`\n${c.blue}${c.bold}━━ Server data (${mode}) — Parties / Items / Bills ━━${c.reset}`);
  const cfg = getConfig();

  if (!cfg.email || !cfg.password) {
    warn('skipped — set BILLSHIELD_TEST_EMAIL and BILLSHIELD_TEST_PASSWORD to seed server data:');
    console.log(`    ${c.dim}BILLSHIELD_TEST_EMAIL=you@example.com BILLSHIELD_TEST_PASSWORD=secret npm run billshield:${mode === 'seed' ? 'test' : 'clean'}${c.reset}`);
    return { skipped: true };
  }

  info('backend', cfg.baseUrl);
  info('user', cfg.email);

  let token;
  try {
    token = await login(cfg);
    ok('logged in');
  } catch (e) {
    warn(`skipped — ${e.message}`);
    warn(`is the backend running at ${cfg.baseUrl.replace(/\/api$/, '')} ?`);
    return { skipped: true };
  }

  try {
    return mode === 'seed' ? await seed(cfg, token) : await clean(cfg, token);
  } catch (e) {
    warn(`server ${mode} error: ${e.message}`);
    return { skipped: true, error: e.message };
  }
}
