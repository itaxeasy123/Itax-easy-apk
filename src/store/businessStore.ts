import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apkBusinessService, Business } from '../services/apkBusinessService';

const ACTIVE_KEY = 'active_business_id';

type BusinessState = {
  businesses: Business[];
  activeBusinessId: number | null;
  loaded: boolean;
  loading: boolean;

  load: (force?: boolean) => Promise<void>;
  setActive: (id: number) => Promise<void>;
  getActiveBusiness: () => Business | null;
  hasActiveBusiness: () => boolean; // status === 'active'
  clear: () => void;
};

export const useBusinessStore = create<BusinessState>((set, get) => ({
  businesses: [],
  activeBusinessId: null,
  loaded: false,
  loading: false,

  load: async (force = false) => {
    if (get().loading) return;
    if (get().loaded && !force) return;

    set({ loading: true });
    try {
      const businesses = await apkBusinessService.list();
      const storedActive = await AsyncStorage.getItem(ACTIVE_KEY);
      let activeId = storedActive ? Number(storedActive) : null;

      // If nothing chosen (or the stored one is gone), prefer the first ACTIVE
      // business, else the first business of any status.
      const stillExists = businesses.some((b) => b.id === activeId);
      if (!activeId || !stillExists) {
        const firstActive = businesses.find((b) => b.status === 'active');
        activeId = (firstActive ?? businesses[0])?.id ?? null;
        if (activeId) {
          await AsyncStorage.setItem(ACTIVE_KEY, String(activeId));
        }
      }

      set({ businesses, activeBusinessId: activeId, loaded: true });
    } catch (e) {
      console.log('BUSINESS LOAD ERROR:', e);
    } finally {
      set({ loading: false });
    }
  },

  setActive: async (id) => {
    await AsyncStorage.setItem(ACTIVE_KEY, String(id));
    set({ activeBusinessId: id });
  },

  getActiveBusiness: () => {
    const { businesses, activeBusinessId } = get();
    return businesses.find((b) => b.id === activeBusinessId) ?? null;
  },

  hasActiveBusiness: () => {
    const active = get().getActiveBusiness();
    return !!active && active.status === 'active';
  },

  clear: () => set({ businesses: [], activeBusinessId: null, loaded: false }),
}));
