
import { apiClient } from '../api/client';
import { endpoints } from '../api/endpoints';

type SignupPayload = {
  email: string;
  fullName: string;
  gender: 'female' | 'male' | 'other';
  password: string;
  phone: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || '',
  };
}

export const authService = {
  forgotPassword: async (email: string) => {
    const response = await apiClient.post(endpoints.auth.forgotPassword, {
      email,
    });
    return response.data;
  },

  login: async ({ email, password }: LoginPayload) => {
    const response = await apiClient.post(endpoints.auth.login, {
      email,
      password,
    });

    return response.data; // ✅ FIXED
  },

  resendOtp: async (email: string) => {
    const response = await apiClient.post(endpoints.auth.resendOtp, {
      email,
    });

    return response.data;
  },

  signup: async ({ email, fullName, gender, password, phone }: SignupPayload) => {
    const { firstName, lastName } = splitFullName(fullName);

    if (!firstName) {
      throw new Error("First name is required");
    }

    const response = await apiClient.post(endpoints.auth.signup, {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
    });

    return response.data;
  },

  updatePasswordWithOtp: async ({
    email,
    newPassword,
    otp,
  }: {
    email: string;
    newPassword: string;
    otp: string;
  }) => {
    const response = await apiClient.post(
      endpoints.auth.updatePasswordWithOtp,
      {
        email,
        newPassword,
        otp,
      }
    );

    return response.data;
  },

  verifyOtp: async ({ email, otp }: { email: string; otp: string }) => {
    const response = await apiClient.post(endpoints.auth.verifyOtp, {
      email,
      otp,
    });

    return response.data;
  },
};