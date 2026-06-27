// Auth API for the new APK backend (phone-OTP / Firebase).
//
// Flow: the app verifies the phone OTP with Firebase on-device (see
// features/auth/services/firebasePhone), then posts the resulting Firebase ID
// token here. The backend verifies it, registers-or-logs-in the user, and
// returns our own JWT access + refresh tokens.
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apkClient, APK_ACCESS_TOKEN_KEY, APK_REFRESH_TOKEN_KEY } from '../api/apkClient';

export type ApkUser = {
  id: number;
  phone: string;
  email?: string | null;
  fullName: string;
  profilePhoto?: string | null;
  timeZone: string;
  language: string;
  gender?: string | null;
  verified: boolean;
  userType: string;
};

export type ApkTokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  isNewUser: boolean;
  user: ApkUser;
};

async function persistTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.setItem(APK_ACCESS_TOKEN_KEY, accessToken);
  await AsyncStorage.setItem(APK_REFRESH_TOKEN_KEY, refreshToken);
}

export const apkAuthService = {
  // Register (first time, needs fullName) OR login with a verified Firebase token.
  firebaseAuth: async (params: {
    idToken: string;
    fullName?: string;
    email?: string;
    deviceInfo?: string;
  }): Promise<ApkTokenResponse> => {
    const res = await apkClient.post('/api/auth/firebase', {
      idToken: params.idToken,
      ...(params.fullName ? { fullName: params.fullName } : {}),
      ...(params.email ? { email: params.email } : {}),
      ...(params.deviceInfo ? { deviceInfo: params.deviceInfo } : {}),
    });
    const data = res.data as ApkTokenResponse;
    await persistTokens(data.accessToken, data.refreshToken);
    return data;
  },

  getMe: async (): Promise<ApkUser> => {
    const res = await apkClient.get('/api/auth/me');
    return res.data as ApkUser;
  },

  updateProfile: async (patch: Partial<Pick<
    ApkUser,
    'fullName' | 'email' | 'profilePhoto' | 'timeZone' | 'language' | 'gender'
  >>): Promise<ApkUser> => {
    const res = await apkClient.patch('/api/auth/me', patch);
    return res.data as ApkUser;
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = await AsyncStorage.getItem(APK_REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await apkClient.post('/api/auth/logout', { refreshToken });
      }
    } catch {
      // best-effort; local logout happens regardless via authStore
    } finally {
      await AsyncStorage.removeItem(APK_REFRESH_TOKEN_KEY);
    }
  },
};
