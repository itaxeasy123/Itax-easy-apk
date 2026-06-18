import { create } from "zustand";

export interface GSTLoginData {
  gstin: string;
  username: string;
  password: string;
  manageApiSession: boolean;
}

interface GSTLoginStore {
  loginData: GSTLoginData;

  setLoginData: (
    data: GSTLoginData
  ) => void;

  clearLoginData: () => void;
}

export const useGSTLoginStore =
  create<GSTLoginStore>(
    (set) => ({
      loginData: {
        gstin: "",
        username: "",
        password: "",
        manageApiSession: false,
      },

      setLoginData: (
        data
      ) =>
        set({
          loginData: data,
        }),

      clearLoginData: () =>
        set({
          loginData: {
            gstin: "",
            username: "",
            password: "",
            manageApiSession: false,
          },
        }),
    })
  );