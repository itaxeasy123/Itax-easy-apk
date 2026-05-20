import { storage } from './mmkv';

/* =========================
   TYPES
========================= */

export interface GSTItem {
  id: string;
  fileName: string;
  createdAt: string;
  response: any;
}

/* =========================
   STORAGE KEY
========================= */

const GST_STORAGE_KEY =
  'GST_STORAGE_KEY';

/* =========================
   SAVE GST
========================= */

export const saveGST = (
  data: GSTItem
): void => {
  try {
    const existing = getGSTs();

    existing.unshift(data);

    storage.set(
      GST_STORAGE_KEY,
      JSON.stringify(existing)
    );
  } catch (error) {
    console.log(
      'SAVE GST ERROR:',
      error
    );
  }
};

/* =========================
   GET GSTS
========================= */

export const getGSTs = (): GSTItem[] => {
  try {
    const data = storage.getString(
      GST_STORAGE_KEY
    );

    return data
      ? JSON.parse(data)
      : [];
  } catch (error) {
    console.log(
      'GET GST ERROR:',
      error
    );

    return [];
  }
};

/* =========================
   DELETE GST
========================= */

export const deleteGST = (
  id: string
): void => {
  try {
    const existing = getGSTs();

    const filtered =
      existing.filter(
        (item) => item.id !== id
      );

    storage.set(
      GST_STORAGE_KEY,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.log(
      'DELETE GST ERROR:',
      error
    );
  }
};

/* =========================
   CLEAR GST
========================= */

export const clearGSTs =
  (): void => {
    try {
      storage.remove(
        GST_STORAGE_KEY
      );
    } catch (error) {
      console.log(
        'CLEAR GST ERROR:',
        error
      );
    }
  };