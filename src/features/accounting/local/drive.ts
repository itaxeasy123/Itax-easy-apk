/**
 * Google Drive backup target for BillShield.
 *
 * The user connects THEIR OWN Google account (one-time consent). We then
 * mirror the local DB file to a folder in their Drive. Nothing goes to our
 * servers. Uses the `drive.file` scope, so the app can only see/manage the
 * files it created — not the user's other Drive content.
 *
 * Requires a Google OAuth client id in env:
 *   EXPO_PUBLIC_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
 * (Create it in Google Cloud Console; redirect handled via the app scheme.)
 */
import * as AuthSession from 'expo-auth-session';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKUP_FILE_NAME } from './backup';

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_NAME = 'ItaxEasy Backups';

const TOKEN_KEY = 'billshield_drive_tokens';

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

type Tokens = { accessToken: string; refreshToken?: string; expiresAt: number };

async function readTokens(): Promise<Tokens | null> {
  const raw = await AsyncStorage.getItem(TOKEN_KEY);
  return raw ? (JSON.parse(raw) as Tokens) : null;
}
async function writeTokens(t: Tokens): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(t));
}

function ensureConfigured() {
  if (!CLIENT_ID) {
    throw new Error(
      'Google Drive is not configured. Set EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env and restart Metro.'
    );
  }
}

/** Valid access token, refreshing via the refresh token when expired. */
async function getAccessToken(): Promise<string> {
  ensureConfigured();
  const tokens = await readTokens();
  if (!tokens) throw new Error('Google Drive not connected');
  if (Date.now() < tokens.expiresAt - 60_000) return tokens.accessToken;

  if (!tokens.refreshToken) throw new Error('Drive session expired — please reconnect');
  const refreshed = await AuthSession.refreshAsync(
    { clientId: CLIENT_ID!, refreshToken: tokens.refreshToken },
    discovery
  );
  const next: Tokens = {
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken ?? tokens.refreshToken,
    expiresAt: Date.now() + (refreshed.expiresIn ?? 3600) * 1000,
  };
  await writeTokens(next);
  return next.accessToken;
}

async function driveFetch(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  const res = await fetch(`https://www.googleapis.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text()}`);
  return res;
}

/** Finds (or creates) the backup folder, returns its id. */
async function ensureFolderId(): Promise<string> {
  const q = encodeURIComponent(
    `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const found = await driveFetch(`/drive/v3/files?q=${q}&fields=files(id)`);
  const data = (await found.json()) as { files: { id: string }[] };
  if (data.files?.length) return data.files[0].id;

  const created = await driveFetch('/drive/v3/files?fields=id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  });
  return ((await created.json()) as { id: string }).id;
}

/** The existing backup file id in our folder, if any. */
async function findBackupFileId(folderId: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${BACKUP_FILE_NAME}' and '${folderId}' in parents and trashed=false`);
  const res = await driveFetch(`/drive/v3/files?q=${q}&fields=files(id)`);
  const data = (await res.json()) as { files: { id: string }[] };
  return data.files?.[0]?.id ?? null;
}

export const driveBackup = {
  isConfigured: () => Boolean(CLIENT_ID),

  isConnected: async (): Promise<boolean> => {
    if (!CLIENT_ID) return false;
    return (await readTokens()) != null;
  },

  /** One-time Google sign-in + consent. Stores tokens for silent backup. */
  connect: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      ensureConfigured();
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'itaxeasyapp' });
      const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID!,
        scopes: SCOPES,
        redirectUri,
        usePKCE: true,
        extraParams: { access_type: 'offline', prompt: 'consent' },
      });
      await request.makeAuthUrlAsync(discovery);
      const result = await request.promptAsync(discovery);
      if (result.type !== 'success' || !result.params.code) {
        return { success: false, message: 'Google sign-in was cancelled' };
      }
      const exchanged = await AuthSession.exchangeCodeAsync(
        {
          clientId: CLIENT_ID!,
          code: result.params.code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier ?? '' },
        },
        discovery
      );
      await writeTokens({
        accessToken: exchanged.accessToken,
        refreshToken: exchanged.refreshToken,
        expiresAt: Date.now() + (exchanged.expiresIn ?? 3600) * 1000,
      });
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e?.message ?? 'Could not connect Google Drive' };
    }
  },

  disconnect: async (): Promise<void> => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  /** Uploads (creates or replaces) the backup file in the user's Drive.
   *  Creates an empty file (with the folder parent) first if needed, then
   *  streams the DB bytes into it — avoids manual base64/multipart. */
  uploadBackup: async (fileUri: string): Promise<void> => {
    const folderId = await ensureFolderId();
    let fileId = await findBackupFileId(folderId);
    if (!fileId) {
      const created = await driveFetch('/drive/v3/files?fields=id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: BACKUP_FILE_NAME, parents: [folderId] }),
      });
      fileId = ((await created.json()) as { id: string }).id;
    }

    const token = await getAccessToken();
    const res = await FileSystem.uploadAsync(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      fileUri,
      {
        httpMethod: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      }
    );
    if (res.status < 200 || res.status >= 300) throw new Error(`Drive upload ${res.status}: ${res.body}`);
  },

  /** Downloads the latest backup to a local cache file; returns its uri (or null). */
  downloadBackup: async (): Promise<string | null> => {
    const folderId = await ensureFolderId();
    const fileId = await findBackupFileId(folderId);
    if (!fileId) return null;
    const token = await getAccessToken();
    const target = `${FileSystem.cacheDirectory}${BACKUP_FILE_NAME}`;
    const { uri } = await FileSystem.downloadAsync(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      target,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return uri;
  },
};
