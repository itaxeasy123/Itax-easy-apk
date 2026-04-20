import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PanState {
  panNumber: string;
  name: string;
  fatherName: string;
  dob: string;
  setPan: (data: any) => void;
  loadPan: () => void;
}

export const usePanStore = create<PanState>((set) => ({
  panNumber: "",
  name: "",
  fatherName: "",
  dob: "",

  setPan: async (data) => {
    await AsyncStorage.setItem("panData", JSON.stringify(data));
    set(data);
  },

  loadPan: async () => {
    const stored = await AsyncStorage.getItem("panData");
    if (stored) set(JSON.parse(stored));
  },
}));