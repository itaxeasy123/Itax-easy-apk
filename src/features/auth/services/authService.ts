import { apiClient } from "../../../api/client";
export const authService = {
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },

  signup: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/signup', data);
    return res.data;
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    const res = await apiClient.post('/auth/verify-otp', data);
    return res.data;
  },
};