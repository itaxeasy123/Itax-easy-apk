import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type DraftItem = {
  itemName: string;
  hsnSac: string;
  unit: string;
  itemType: "item" | "service";
  salePrice: string;
  purchasePrice: string;
  taxRate: string;
};

export type VoucherLineDraft = {
  id: string;
  itemId: string;
  itemName: string;
  quantity: string;
  rate: string;
  discount: string;
  taxPercent: string;
};

export type DraftVoucher = {
  selectedPartyId: string;
  invoiceDate: string;
  dueDate: string;
  gstAmount: string;
  selectedGstOption: string | null;
  otherCharges: string;
  notes: string;
  lineItems: VoucherLineDraft[];
};

type AccountingSessionState = {
  draftItem: DraftItem | null;
  draftVouchers: Record<string, DraftVoucher | null>; // keyed by mode e.g. "sales", "purchase"

  setDraftItem: (item: DraftItem) => void;
  clearDraftItem: () => void;
  
  setDraftVoucher: (mode: string, voucher: DraftVoucher) => void;
  clearDraftVoucher: (mode: string) => void;
};

export const useAccountingSessionStore = create<AccountingSessionState>()(
  persist(
    (set) => ({
      draftItem: null,
      draftVouchers: {},

      setDraftItem: (item) => set({ draftItem: item }),
      clearDraftItem: () => set({ draftItem: null }),

      setDraftVoucher: (mode, voucher) =>
        set((state) => ({
          draftVouchers: { ...state.draftVouchers, [mode]: voucher },
        })),
        
      clearDraftVoucher: (mode) =>
        set((state) => ({
          draftVouchers: { ...state.draftVouchers, [mode]: null },
        })),
    }),
    {
      name: "accounting-session-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
