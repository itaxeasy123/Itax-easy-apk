export const validateEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePassword = (password: string) => {
  return password.length >= 6;
};

export const validateOTP = (otp: string) => {
  return otp.length === 6;
};
