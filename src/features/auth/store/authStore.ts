import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isHydrated: boolean;

  setToken: (token: string) => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
};

const STORAGE_KEYS = {
  TOKEN: "auth_token",
  USER: "auth_user",
};

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  isHydrated: false,

  // ===============================
  // 🔐 SET TOKEN
  // ===============================
  setToken: async (token) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      set({ token });
    } catch (error) {
      console.log("❌ setToken error:", error);
    }
  },

  // ===============================
  // 👤 SET USER
  // ===============================
  setUser: async (user) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(user)
      );
      set({ user });
    } catch (error) {
      console.log("❌ setUser error:", error);
    }
  },

  // ===============================
  // 🔥 SET AUTH (LOGIN)
  // ===============================
  setAuth: async (user, token) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, token],
        [STORAGE_KEYS.USER, JSON.stringify(user)],
      ]);

      set({ token, user });
    } catch (error) {
      console.log("❌ setAuth error:", error);
    }
  },

  // ===============================
  // 🚪 LOGOUT
  // ===============================
  logout: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
      ]);

      set({ token: null, user: null });
    } catch (error) {
      console.log("❌ logout error:", error);
    }
  },

  // ===============================
  // 🔄 LOAD TOKEN (APP START)
  // ===============================
  loadToken: async () => {
    try {
      const [[, token], [, user]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
      ]);

      set({
        token: token || null,
        user: user ? JSON.parse(user) : null,
        isHydrated: true,
      });
    } catch (error) {
      console.log("❌ loadToken error:", error);
      set({ isHydrated: true });
    }
  },
}));