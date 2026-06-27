// Axios client for the NEW iTaxEasy APK backend (FastAPI, phone-OTP auth).
//
// This is intentionally separate from `./client` (which targets the legacy
// Node_API). Auth has been migrated to the new backend first; other features
// will follow module by module. This client owns the new backend's JWT
// access/refresh lifecycle.
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { APK_API_URL } from '../config/env';
import { useAuthStore } from '../store/authStore';

// Storage keys. Access token shares the existing "token" key so the global auth
// guard (_layout) keeps working; the refresh token uses an APK-specific key so
// it never collides with the legacy client's refresh flow.
export const APK_ACCESS_TOKEN_KEY = 'token';
export const APK_REFRESH_TOKEN_KEY = 'apk_refreshToken';

const apkApiInstance = axios.create({
  baseURL: APK_API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export const apkClient = apkApiInstance as any;

// ---------------------------------------------------------------- request
apkApiInstance.interceptors.request.use(
  async (config: any) => {
    const token = await AsyncStorage.getItem(APK_ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------- response
apkApiInstance.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Never try to refresh on the auth endpoints themselves.
    const isAuthRoute = String(originalRequest.url || '').includes('/api/auth/');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem(APK_REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Use a bare axios call so we don't recurse through this interceptor.
        const res = await axios.post(`${APK_API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const accessToken = res?.data?.accessToken;
        const newRefresh = res?.data?.refreshToken;
        if (!accessToken) {
          throw new Error('Invalid refresh response');
        }

        await AsyncStorage.setItem(APK_ACCESS_TOKEN_KEY, accessToken);
        if (newRefresh) {
          await AsyncStorage.setItem(APK_REFRESH_TOKEN_KEY, newRefresh);
        }
        useAuthStore.getState().setAuth(useAuthStore.getState().user as any, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apkClient(originalRequest);
      } catch (refreshError) {
        await useAuthStore.getState().logout();
        if (router.canGoBack()) {
          router.dismissAll();
        }
        router.replace('/login');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
