import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../api/client';
import { endpoints } from '../../../api/endpoints';

const COMPANY_ID_KEY = 'billshield_company_id';

let cachedCompanyId: string | null = null;
let inflight: Promise<string> | null = null;

/** Indian FY start (Apr 1) for the current date — used as booksBeginDate
 *  when auto-creating the user's first company. */
const currentFyStart = () => {
  const now = new Date();
  const year = now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-04-01`;
};

const resolveCompanyId = async (): Promise<string> => {
  const stored = await AsyncStorage.getItem(COMPANY_ID_KEY);
  if (stored) {
    cachedCompanyId = stored;
    return stored;
  }

  const list = await apiClient.get(endpoints.billshield.companies);
  const companies: any[] = Array.isArray(list.data?.data) ? list.data.data : [];
  let companyId = companies[0]?.id as string | undefined;

  if (!companyId) {
    // First use: create the books. The backend seeds the full chart of
    // accounts (28 groups), 8 voucher types, system ledgers and the FY.
    const created = await apiClient.post(endpoints.billshield.companies, {
      name: 'My Company',
      booksBeginDate: currentFyStart(),
    });
    companyId = created.data?.data?.id;
  }

  if (!companyId) throw new Error('Could not resolve a BillShield company');
  await AsyncStorage.setItem(COMPANY_ID_KEY, companyId);
  cachedCompanyId = companyId;
  return companyId;
};

export const companyService = {
  /** Returns the active company id, creating the user's first company on
   *  demand. Concurrent callers share one in-flight resolution. */
  ensureCompanyId: async (): Promise<string> => {
    if (cachedCompanyId) return cachedCompanyId;
    if (!inflight) {
      inflight = resolveCompanyId().finally(() => {
        inflight = null;
      });
    }
    return inflight;
  },

  /** Forgets the cached company (e.g. on 403/membership change) so the
   *  next call re-resolves it. */
  resetCompany: async () => {
    cachedCompanyId = null;
    await AsyncStorage.removeItem(COMPANY_ID_KEY);
  },

  listCompanies: async () => {
    const response = await apiClient.get(endpoints.billshield.companies);
    return {
      success: Boolean(response.data?.success),
      data: Array.isArray(response.data?.data) ? response.data.data : [],
    };
  },

  selectCompany: async (companyId: string) => {
    cachedCompanyId = companyId;
    await AsyncStorage.setItem(COMPANY_ID_KEY, companyId);
  },

  createCompany: async (data: {
    name: string;
    gstin?: string;
    pan?: string;
    stateCode?: string;
    booksBeginDate?: string;
  }) => {
    const response = await apiClient.post(endpoints.billshield.companies, {
      booksBeginDate: currentFyStart(),
      ...data,
    });
    const company = response.data?.data;
    if (company?.id) await companyService.selectCompany(company.id);
    return { success: Boolean(response.data?.success), data: company };
  },
};
