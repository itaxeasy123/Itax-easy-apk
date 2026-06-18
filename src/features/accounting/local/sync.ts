/**
 * Sync orchestrator for the local BillShield DB.
 *
 * Strategy: LOCAL-FIRST + debounced backup (NOT a per-change upload, and
 * NOT a server cron). The local SQLite DB is always the working copy; we
 * mirror the WHOLE DB to the user's Google Drive when:
 *   - changes settle (debounced ~10s after the last edit),
 *   - the app goes to the background,
 *   - the app starts (catch up anything pending),
 * and only if Drive is connected. If offline, the "dirty" flag stays set
 * and the next trigger retries — so sync resumes from where it left off.
 */
import { AppState, type AppStateStatus } from 'react-native';
import { getDb, getMeta, setMeta, nowIso } from './db';
import { exportDbToFile } from './backup';
import { driveBackup } from './drive';

const DEBOUNCE_MS = 10_000;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let syncing = false;
let triggersRegistered = false;

/** Called by the engine after every mutation. Debounces a backup. */
export function notifyChange(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void syncNow('debounce');
  }, DEBOUNCE_MS);
}

/** Uploads the DB to Drive if there are unsynced changes and Drive is
 *  connected. Safe to call anytime; no-ops when clean/offline/not connected. */
export async function syncNow(reason: 'debounce' | 'background' | 'startup' | 'manual' = 'manual'): Promise<
  { status: 'skipped' | 'synced' | 'failed' | 'not-connected' | 'clean'; message?: string }
> {
  if (syncing) return { status: 'skipped' };
  const db = await getDb();
  const dirty = (await getMeta(db, 'dirty')) === '1';
  if (!dirty && reason !== 'manual') return { status: 'clean' };
  if (!(await driveBackup.isConnected())) return { status: 'not-connected' };

  syncing = true;
  try {
    const fileUri = await exportDbToFile();
    await driveBackup.uploadBackup(fileUri);
    await setMeta(db, 'dirty', '0');
    await setMeta(db, 'lastSyncAt', nowIso());
    return { status: 'synced' };
  } catch (e: any) {
    // Leave dirty=1 so the next trigger retries (resume-from-pending).
    return { status: 'failed', message: e?.message ?? 'Backup failed' };
  } finally {
    syncing = false;
  }
}

/** Wire app-lifecycle triggers. Call once at app start (e.g. in a layout). */
export function registerSyncTriggers(): () => void {
  if (triggersRegistered) return () => {};
  triggersRegistered = true;

  const onState = (state: AppStateStatus) => {
    if (state === 'background' || state === 'inactive') void syncNow('background');
  };
  const sub = AppState.addEventListener('change', onState);

  // Catch up anything pending from a previous session.
  void syncNow('startup');

  return () => {
    sub.remove();
    triggersRegistered = false;
  };
}

export async function getSyncStatus() {
  const db = await getDb();
  return {
    dirty: (await getMeta(db, 'dirty')) === '1',
    lastSyncAt: await getMeta(db, 'lastSyncAt'),
    connected: await driveBackup.isConnected(),
  };
}
