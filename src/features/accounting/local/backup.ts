/**
 * Backup/restore of the local BillShield SQLite DB as a single file.
 *
 * Used by:
 *   - sync.ts (uploads this file to Google Drive),
 *   - manual Export/Restore (share-sheet / file-picker),
 *   - restore-on-reinstall (download from Drive → import here).
 *
 * The whole-DB approach: we copy the entire `billshield.db` file. Simple,
 * robust, and well under Drive's 25 MB limit for accounting data.
 */
import * as FileSystem from 'expo-file-system/legacy';
import { closeDb, DB_NAME, getDb } from './db';

export const BACKUP_FILE_NAME = 'billshield-backup.db';

const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
const dbPath = `${sqliteDir}/${DB_NAME}`;

/** Copies the live DB to a shareable file in the cache dir; returns its uri. */
export async function exportDbToFile(): Promise<string> {
  // Ensure the DB exists / is initialised before copying.
  await getDb();
  const target = `${FileSystem.cacheDirectory}${BACKUP_FILE_NAME}`;
  const existing = await FileSystem.getInfoAsync(target);
  if (existing.exists) await FileSystem.deleteAsync(target, { idempotent: true });
  await FileSystem.copyAsync({ from: dbPath, to: target });
  return target;
}

/** Replaces the live DB with the given backup file, then reopens it. */
export async function importDbFromFile(fileUri: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) throw new Error('Backup file not found');

  await closeDb(); // release the handle before overwriting the file
  const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
  if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });

  // Clear WAL/SHM sidecars so the imported DB is read cleanly.
  for (const suffix of ['', '-wal', '-shm']) {
    await FileSystem.deleteAsync(`${dbPath}${suffix}`, { idempotent: true });
  }
  await FileSystem.copyAsync({ from: fileUri, to: dbPath });
  await getDb(); // reopen + migrate
}
