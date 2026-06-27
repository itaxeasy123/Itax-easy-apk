#!/usr/bin/env node
/**
 * Removes the database produced by billshield-selftest.mjs.
 *
 *   node scripts/billshield-clean.mjs
 *
 * Deletes billshield-selftest.db and its WAL/SHM sidecar files.
 * (This only touches the terminal test file — it does NOT affect the running
 *  app's on-device DB. To wipe the app's data, run  await billshieldReset()
 *  in the app console.)
 */
import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { runServer } from './billshield-server.mjs';

// 1) local test database file
const base = resolve(process.cwd(), 'billshield-selftest.db');
const targets = [base, `${base}-wal`, `${base}-shm`, `${base}-journal`];

let removed = 0;
for (const f of targets) {
  if (existsSync(f)) {
    unlinkSync(f);
    console.log(`  🗑  removed ${f}`);
    removed++;
  }
}
console.log(removed ? `✓ Cleaned ${removed} local file(s).` : 'No local test database to clean.');

// 2) server data (Parties / Items / Bills tagged [BS-TEST])
await runServer('clean');

console.log('\n✓ Cleanup done.');
