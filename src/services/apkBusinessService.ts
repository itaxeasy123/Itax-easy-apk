// Business (SRS Module 3) API for the new APK backend.
// The business is the server source of truth; BillShield's on-device engine
// scopes its local books by the selected business.
import { apkClient } from '../api/apkClient';

export type BusinessStatus = 'draft' | 'active';

export type FinancialYear = {
  id: number;
  label: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
};

export type Business = {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  name: string;
  tradeName?: string | null;
  pan?: string | null;
  gstin?: string | null;
  stateCode?: string | null;
  country: string;
  currency: string;
  fyStartMonth: number;
  status: BusinessStatus;
  financial_years: FinancialYear[];
};

export type BusinessInput = {
  name: string;
  tradeName?: string;
  pan?: string;
  gstin?: string;
  stateCode?: string;
  country?: string;
  currency?: string;
  fyStartMonth?: number;
  status?: BusinessStatus;
};

export const apkBusinessService = {
  list: async (): Promise<Business[]> => {
    const res = await apkClient.get('/api/business');
    return res.data as Business[];
  },

  get: async (id: number): Promise<Business> => {
    const res = await apkClient.get(`/api/business/${id}`);
    return res.data as Business;
  },

  create: async (input: BusinessInput): Promise<Business> => {
    const res = await apkClient.post('/api/business', input);
    return res.data as Business;
  },

  update: async (id: number, patch: Partial<BusinessInput>): Promise<Business> => {
    const res = await apkClient.patch(`/api/business/${id}`, patch);
    return res.data as Business;
  },
};
