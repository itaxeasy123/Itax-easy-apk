import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { API_URL } from "../config/env";

// ===============================
// AXIOS INSTANCE
// ===============================
const apiClientInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export const apiClient = apiClientInstance as any;

// ===============================
// 🔐 TOKEN HELPERS
// ===============================
const getToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (e) {
    console.log("GET TOKEN ERROR:", e);
    return null;
  }
};

const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem("refreshToken");
  } catch {
    return null;
  }
};

// ===============================
// 🚀 REQUEST INTERCEPTOR
// ===============================
apiClientInstance.interceptors.request.use(
  async (config: any) => {
    const token = await getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// 🔁 RESPONSE INTERCEPTOR (FIXED)
// ===============================
apiClientInstance.interceptors.response.use(
  (response: any) => response,

  async (error: any) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    // ✅ IMPORTANT: Auth routes skip
    const isAuthRoute =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/signup") ||
      originalRequest.url?.includes("/sign-up") ||
      originalRequest.url?.includes("/verify") ||
      originalRequest.url?.includes("/resendotp") ||
      originalRequest.url?.includes("/forgot-password") ||
      originalRequest.url?.includes("/verify-otp");

    // ✅ TEMPORARY FIX: Skip buggy routes that return 401 incorrectly
    const isBuggyRoute = 
      originalRequest.url?.includes("/billpayable") || 
      originalRequest.url?.includes("/billrecieve");

    // 🔴 ONLY refresh if:
    // - 401
    // - NOT auth route
    // - NOT retried
    // - NOT a buggy route
    if (status === 401 && !originalRequest._retry && !isAuthRoute && !isBuggyRoute) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          console.log("❌ No refresh token available");
          if (router.canGoBack()) {
            router.dismissAll();
          }
          router.replace('/login');
          useAuthStore.getState().logout();
          return Promise.reject(error); // ✅ FIX
        }

        console.log("🔄 Refreshing token...");

        const res = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const responseData = res?.data as
          | { accessToken?: string; data?: { accessToken?: string } }
          | undefined;

        const newToken =
          responseData?.accessToken ||
          responseData?.data?.accessToken;

        if (!newToken) {
          throw new Error("Invalid refresh response");
        }

        await AsyncStorage.setItem("token", newToken);
        useAuthStore.getState().setAuth(useAuthStore.getState().user as any, newToken);

        console.log("✅ Token refreshed");

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log("❌ REFRESH FAILED:", refreshError);

        useAuthStore.getState().logout();
        if (router.canGoBack()) {
          router.dismissAll();
        }
        router.replace('/login');

        return Promise.reject(refreshError);
      }
    }

    // ✅ NORMAL ERROR FLOW
    return Promise.reject(error);
  }
);
