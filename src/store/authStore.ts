
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import axios from "axios";

export type AuthUser = {
  email: string;
  firstName?: string;
  fullName?: string;
  gender?: string;
  id?: number;
  lastName?: string;
  phone?: string;
  verified?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  profileImage: string | null;
  isHydrated: boolean;

  setAuth: (user: AuthUser, token: string) => Promise<void>;
  setProfileImage: (uri: string | null) => Promise<void>;
  loadAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  profileImage: null,
  isHydrated: false,

  // ✅ LOGIN / SET AUTH
  setAuth: async (user, token) => {
    try {
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      set({ user, token });
    } catch (e) {
      console.log("SET AUTH ERROR:", e);
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

  // ✅ LOAD TOKEN ON APP START
  loadAuth: async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");

      let user = userStr ? JSON.parse(userStr) : null;
      let isValidToken = !!token;

      if (token) {
        try {
          const API_URL = Constants?.expoConfig?.extra?.API_URL || "https://api.itaxeasy.com/api";
          
          await axios.get(`${API_URL}/user/profile`, {
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
        await AsyncStorage.removeItem("refreshToken");
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
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      // Intentionally NOT removing "profile_image" so it persists locally

      set({ user: null, token: null });
    } catch (e) {
      console.log("LOGOUT ERROR:", e);
    }
  },
}));