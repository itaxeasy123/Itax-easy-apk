import { apiClient } from '../../../api/client';
import { endpoints } from '../../../api/endpoints';
import type {
  CreateInvoicePayload,
  CreateItemPayload,
  CreatePartyPayload,
  GetInvoicesParams,
  Invoice,
  InvoiceSummary,
  Item,
  Pagination,
  Party,
} from '../types/invoice.types';

export const invoiceService = {
  getSummary: async () => {
    const response = await apiClient.get(endpoints.invoice.summary);
    return response.data.summary as InvoiceSummary;
  },

  getInvoices: async (params: GetInvoicesParams = {}) => {
    const response = await apiClient.get(endpoints.invoice.invoices, { params });
    return response.data as {
      success: boolean;
      invoices: Invoice[];
      pagination: Pagination;
    };
  },

  getInvoiceById: async (id: string) => {
    const response = await apiClient.get(endpoints.invoice.invoiceById(id));
    return response.data as Invoice;
  },

  createInvoice: async (payload: CreateInvoicePayload) => {
    const response = await apiClient.post(endpoints.invoice.invoices, payload);
    return response.data as Invoice;
  },

  updateInvoice: async (id: string, payload: CreateInvoicePayload) => {
    const response = await apiClient.put(endpoints.invoice.invoiceById(id), payload);
    return response.data;
  },

  deleteInvoice: async (id: string) => {
    const response = await apiClient.delete(endpoints.invoice.invoiceById(id));
    return response.data;
  },

  getParties: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get(endpoints.invoice.parties, { params });
    return response.data as { success: boolean; parties: Party[] };
  },

  createParty: async (payload: CreatePartyPayload) => {
    const response = await apiClient.post(endpoints.invoice.parties, payload);
    return response.data as { success: boolean; party: Party };
  },

  updateParty: async (id: string, payload: CreatePartyPayload) => {
    const response = await apiClient.put(endpoints.invoice.partyById(id), payload);
    return response.data as { success: boolean; party: Party };
  },

  deleteParty: async (id: string) => {
    const response = await apiClient.delete(endpoints.invoice.partyById(id));
    return response.data;
  },

  getItems: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await apiClient.get(endpoints.invoice.items, { params });
    return response.data as { success: boolean; items: Item[] };
  },

  createItem: async (payload: CreateItemPayload) => {
    const response = await apiClient.post(endpoints.invoice.items, payload);
    return response.data as { success: boolean; item: Item };
  },

  updateItem: async (id: string, payload: Partial<CreateItemPayload>) => {
    const response = await apiClient.put(endpoints.invoice.itemById(id), payload);
    return response.data;
  },

  deleteItem: async (id: string) => {
    const response = await apiClient.delete(endpoints.invoice.itemById(id));
    return response.data;
  },
};
