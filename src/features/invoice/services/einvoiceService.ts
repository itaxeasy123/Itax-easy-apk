import { apiClient } from '../../../api/client';
import { endpoints } from '../../../api/endpoints';
import type {
  EinvoiceAuthPayload,
  GenerateEinvoicePayload,
  GenerateEinvoicePdfPayload,
} from '../types/invoice.types';

export const einvoiceService = {
  login: async (payload: EinvoiceAuthPayload) => {
    const response = await apiClient.post(endpoints.einvoice.auth, payload);
    return response.data;
  },

  generate: async (payload: GenerateEinvoicePayload) => {
    const response = await apiClient.post(endpoints.einvoice.generate, payload);
    return response.data;
  },

  generatePdf: async (payload: GenerateEinvoicePdfPayload) => {
    const response = await apiClient.post(endpoints.einvoice.pdf, payload);
    return response.data;
  },
};
