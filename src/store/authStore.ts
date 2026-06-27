
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { APK_API_URL } from "../config/env";

const APK_REFRESH_TOKEN_KEY = "apk_refreshToken";

export type AuthUser = {
  email?: string | null;
  firstName?: string;
  fullName?: string;
  gender?: string | null;
  id?: number;
  lastName?: string;
  phone?: string;
  profilePhoto?: string | null;
  timeZone?: string;
  language?: string;
  userType?: string;
  verified?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  profileImage: string | null;
  isHydrated: boolean;

  setAuth: (user: AuthUser, token: string) => Promise<void>;
  // Full session from the new APK backend (access + refresh).
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>;
  setProfileImage: (uri: string | null) => Promise<void>;
  loadAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  profileImage: null,
  isHydrated: false,

  // ✅ SET ACCESS TOKEN (also used by the refresh interceptor)
  setAuth: async (user, token) => {
    try {
      await AsyncStorage.setItem("token", token);
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }
      set({ user, token });
    } catch (e) {
      console.log("SET AUTH ERROR:", e);
    }
  },

  // ✅ SET FULL SESSION (phone-OTP login/register on the new backend)
  setSession: async (user, accessToken, refreshToken) => {
    try {
      await AsyncStorage.setItem("token", accessToken);
      await AsyncStorage.setItem(APK_REFRESH_TOKEN_KEY, refreshToken);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      set({ user, token: accessToken });
    } catch (e) {
      console.log("SET SESSION ERROR:", e);
    }
  },

  // ✅ SET PROFILE IMAGE
  setProfileImage: async (uri) => {
    try {
      if (uri) {
        await AsyncStorage.setItem("profile_image", uri);
      } else {
        await AsyncStorage.removeItem("profile_image");
      }
      set({ profileImage: uri });
    } catch (e) {
      console.log("SET PROFILE IMAGE ERROR:", e);
    }
  },

  // ✅ LOAD TOKEN ON APP START (validated against the new APK backend)
  loadAuth: async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");

      let user = userStr ? JSON.parse(userStr) : null;
      let isValidToken = !!token;

      if (token) {
        try {
          await axios.get(`${APK_API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          });
          isValidToken = true;
        } catch (error: any) {
          if (error.response && error.response.status === 401) {
            console.log("Token invalid on startup (401)");
            isValidToken = false;
          } else {
            console.log("Token verification failed (network/timeout), assuming valid for now");
            isValidToken = true;
          }
        }
      }

      if (token && !isValidToken) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        await AsyncStorage.removeItem(APK_REFRESH_TOKEN_KEY);
        token = null;
        user = null;
      }

      const imageStr = await AsyncStorage.getItem("profile_image");

      set({
        token,
        user,
        profileImage: imageStr,
        isHydrated: true,
      });
    } catch (e) {
      console.log("LOAD AUTH ERROR:", e);
      set({ isHydrated: true });
    }
  },

  // ✅ LOGOUT
  logout: async () => {
    try {
      // Best-effort: revoke the refresh-token session on the new backend.
      // Dynamic import avoids a circular dependency (apkClient → authStore).
      try {
        const { apkAuthService } = await import("../services/apkAuthService");
        await apkAuthService.logout();
      } catch {
        // ignore — local logout proceeds regardless
      }

      // Clear cached business state so it doesn't leak into the next account.
      try {
        const { useBusinessStore } = await import("./businessStore");
        useBusinessStore.getState().clear();
      } catch {
        // ignore
      }

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem(APK_REFRESH_TOKEN_KEY);
      // Intentionally NOT removing "profile_image" so it persists locally

      set({ user: null, token: null });
    } catch (e) {
      console.log("LOGOUT ERROR:", e);
    }
  },
}));
