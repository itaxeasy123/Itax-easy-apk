import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ API URL
const API_URL =
  Constants.expoConfig?.extra?.API_URL || "https://api.itaxeasy.com/api";

console.log("🔥 API URL:", API_URL);

// ===============================
// 🔥 AXIOS INSTANCE
// ===============================
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

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
apiClient.interceptors.request.use(
  async (config) => {
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
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    // ✅ IMPORTANT: Auth routes skip
    const isAuthRoute =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/signup") ||
      originalRequest.url?.includes("/forgot-password") ||
      originalRequest.url?.includes("/verify-otp");

    // 🔴 ONLY refresh if:
    // - 401
    // - NOT auth route
    // - NOT retried
    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          console.log("❌ No refresh token available");
          return Promise.reject(error); // ✅ FIX
        }

        console.log("🔄 Refreshing token...");

        const res = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken }
        );

        const newToken =
          res?.data?.accessToken ||
          res?.data?.data?.accessToken;

        if (!newToken) {
          throw new Error("Invalid refresh response");
        }

        await AsyncStorage.setItem("token", newToken);

        console.log("✅ Token refreshed");

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        console.log("❌ REFRESH FAILED:", refreshError);

        await Promise.all([
          AsyncStorage.removeItem("token"),
          AsyncStorage.removeItem("refreshToken"),
        ]);

        return Promise.reject(refreshError);
      }
    }

    // ✅ NORMAL ERROR FLOW
    return Promise.reject(error);
  }
);