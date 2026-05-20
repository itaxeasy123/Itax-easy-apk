import { storage } from './mmkv';

const INVOICE_KEY = 'INVOICES';

export interface InvoiceItem {
  id: string;
  fileName: string;
  createdAt: string;
  response: any;
}

export const saveInvoice = (
  data: InvoiceItem
): void => {
  try {
    const existing =
      getInvoices();

    existing.unshift(data);

    storage.set(
      INVOICE_KEY,
      JSON.stringify(existing)
    );
  } catch (error) {
    console.log(
      'SAVE INVOICE ERROR:',
      error
    );
  }
};

export const getInvoices =
  (): InvoiceItem[] => {
    try {
      const data =
        storage.getString(
          INVOICE_KEY
        );

      return data
        ? JSON.parse(data)
        : [];
    } catch (error) {
      console.log(
        'GET INVOICE ERROR:',
        error
      );

      return [];
    }
  };

export const deleteInvoice = (
  id: string
): void => {
  try {
    const existing =
      getInvoices();

    const filtered =
      existing.filter(
        (item) =>
          item.id !== id
      );

    storage.set(
      INVOICE_KEY,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.log(
      'DELETE INVOICE ERROR:',
      error
    );
  }
};

export const clearInvoices =
  (): void => {
    try {
      storage.set(
        INVOICE_KEY,
        JSON.stringify([])
      );
    } catch (error) {
      console.log(
        'CLEAR INVOICE ERROR:',
        error
      );
    }
  };