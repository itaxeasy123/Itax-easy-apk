import { storage } from './mmkv';

const BANK_KEY = 'BANK_STATEMENTS';



export const saveBankStatement = (
  data: any
): void => {
  const existing = getBankStatements();

  existing.unshift(data);

  storage.set(
    BANK_KEY,
    JSON.stringify(existing)
  );
};



export const getBankStatements =
  (): any[] => {
    const data =
      storage.getString(BANK_KEY);

    if (!data || data === '') {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };



export const deleteBankStatement = (
  id: string
): void => {
  const existing =
    getBankStatements();

  const filtered = existing.filter(
    (item: any) => item.id !== id
  );

  storage.set(
    BANK_KEY,
    JSON.stringify(filtered)
  );
};



export const clearBankStatements =
  (): void => {
    storage.set(BANK_KEY, '[]');
  };