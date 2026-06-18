/**
 * Resolves the active BillShield company — now from the on-device SQLite
 * engine. On first use it creates + seeds the local company (full chart of
 * accounts, voucher types, system ledgers, first fiscal year).
 */
import * as engine from '../local/engine';

let cachedCompanyId: string | null = null;
let inflight: Promise<string> | null = null;

export const companyService = {
  /** Active company id, creating the first company locally on demand. */
  ensureCompanyId: async (): Promise<string> => {
    if (cachedCompanyId) return cachedCompanyId;
    if (!inflight) {
      inflight = engine
        .ensureCompany()
        .then((id) => {
          cachedCompanyId = id;
          return id;
        })
        .finally(() => {
          inflight = null;
        });
    }
    return inflight;
  },

  resetCompany: async () => {
    cachedCompanyId = null;
  },

  listCompanies: async () => {
    const data = await engine.listCompanies();
    return { success: true, data };
  },

  selectCompany: async (companyId: string) => {
    cachedCompanyId = companyId;
  },

  createCompany: async (data: {
    name: string;
    gstin?: string;
    pan?: string;
    stateCode?: string;
    booksBeginDate?: string;
  }) => {
    const company = await engine.createCompany(data);
    if (company?.id) cachedCompanyId = company.id;
    return { success: true, data: company };
  },
};
