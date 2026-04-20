
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  isHydrated: boolean;

  setAuth: (user: AuthUser, token: string) => Promise<void>;
  loadAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
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

  // ✅ LOAD TOKEN ON APP START
  loadAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");

      const user = userStr ? JSON.parse(userStr) : null;

      set({
        token,
        user,
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

      set({ user: null, token: null });
    } catch (e) {
      console.log("LOGOUT ERROR:", e);
    }
  },
}));