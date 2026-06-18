import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getStorage } from "./storageHelper";

export interface RecordItem {
  [key: string]: any;
  id: number;
  place: string;
  rate: string;
  totalTaxable: string;
  integrated: string;
  centralTax: string;
  stateTax: string;
  cess: string;
}

interface StoreState {
  records: RecordItem[];
  addRecord: (record: RecordItem) => void;
  updateRecord: (id: number, field: keyof RecordItem, value: string) => void;
  updateFullRecord: (id: number, record: Partial<RecordItem>) => void;
  deleteRecord: (id: number) => void;
}

export const useAdjustmentAdvancesStore = create<StoreState>()(
  persist(
    (set) => ({
      records: [],
  addRecord: (record) => set((state) => ({ records: [...state.records, record] })),
  updateRecord: (id, field, value) => set((state) => ({
    records: state.records.map((r) => r.id === id ? { ...r, [field]: value } : r)
  })),
  updateFullRecord: (id, record) => set((state) => ({
    records: state.records.map((r) => r.id === id ? { ...r, ...record } : r)
  })),
  deleteRecord: (id) => set((state) => ({
    records: state.records.filter((r) => r.id !== id)
  })),
    }),
    {
      name: "adjustmentadvances-storage",
      storage: createJSONStorage(getStorage),
    }
  )
);
