import { create } from "zustand";

export const useTaxStore = create((set) => ({
  data: null,
  result: null,

  setData: (data: any) => set({ data }),
  setResult: (result: any) => set({ result }),
}));