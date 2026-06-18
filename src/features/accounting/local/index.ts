/**
 * Public surface for the local BillShield store + Google Drive backup.
 * A settings screen can import from here to let the user connect Drive,
 * back up / restore manually, and see sync status.
 */
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { driveBackup } from './drive';
import { exportDbToFile, importDbFromFile } from './backup';
import { getSyncStatus, syncNow } from './sync';

export { getSyncStatus, syncNow } from './sync';

export const billshieldBackup = {
  isDriveConfigured: () => driveBackup.isConfigured(),
  isDriveConnected: () => driveBackup.isConnected(),

  /** Connect the user's Google Drive, then push the first backup. */
  connectDrive: async () => {
    const res = await driveBackup.connect();
    if (res.success) await syncNow('manual');
    return res;
  },

  disconnectDrive: () => driveBackup.disconnect(),

  /** Force a backup now (manual "Back up" button). */
  backupNow: () => syncNow('manual'),

  /** Restore from the user's Drive backup (e.g. after reinstall). */
  restoreFromDrive: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      if (!(await driveBackup.isConnected())) return { success: false, message: 'Connect Google Drive first' };
      const fileUri = await driveBackup.downloadBackup();
      if (!fileUri) return { success: false, message: 'No backup found in your Drive' };
      await importDbFromFile(fileUri);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e?.message ?? 'Restore failed' };
    }
  },

  /** Export the DB file via the OS share-sheet (save to Files/Drive/email). */
  exportToFile: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const uri = await exportDbToFile();
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/octet-stream', dialogTitle: 'Export BillShield backup' });
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e?.message ?? 'Export failed' };
    }
  },

  /** Restore from a backup file the user picks (manual import). */
  importFromFile: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const picked = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (picked.canceled || !picked.assets?.[0]?.uri) return { success: false, message: 'No file selected' };
      await importDbFromFile(picked.assets[0].uri);
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e?.message ?? 'Import failed' };
    }
  },

  status: getSyncStatus,
};
