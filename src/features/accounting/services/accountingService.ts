import { apiClient } from '../../../api/client';
import { endpoints } from '../../../api/endpoints';
import {
  Ledger,
  Party,
  BillPayable,
  BillReceivable,
  ApiResponse,
  ListResponse,
  LedgerType,
  PartyType,
  Payment,
  ProfitAndLossReport,
  BalanceSheetReport,
  CashFlowReport,
  DayBook,
  Transaction,
  VoucherType,
  GetInvoicesParams,
  Invoice,
  Pagination,
  CreateInvoicePayload,
  CreateItemPayload,
  Item
} from '../types/accountingTypes';
import { voucherService } from './voucherService';

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const normalizeLedger = (ledger: unknown): Ledger => {
  const source = (ledger ?? {}) as Record<string, unknown>;
  return {
    ...(source as unknown as Ledger),
    openingBalance: toNumber(source.openingBalance),
    balance: toNumber(source.balance),
  };
};

const normalizeParty = (party: unknown): Party => {
  const source = (party ?? {}) as Record<string, unknown> & { ledgers?: unknown[] };
  return {
    ...(source as unknown as Party),
    ledgers: Array.isArray(source.ledgers)
      ? source.ledgers.map(normalizeLedger)
      : undefined,
  };
};

const normalizePayment = (payment: unknown): Payment => {
  const source = (payment ?? {}) as Record<string, unknown>;
  return {
    ...(source as unknown as Payment),
    amount: toNumber(source.amount),
    currency: typeof source.currency === 'string' ? source.currency : 'INR',
  };
};

const formatDayBookDate = (value: unknown): string => {
  if (!value) return new Date().toISOString();
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
};

const normalizeDayBookFromVoucher = (voucher: unknown): DayBook[] => {
  const source = (voucher ?? {}) as Record<string, unknown> & { lines?: unknown[] };
  const voucherDate = formatDayBookDate(source.entryDate);
  const voucherType = (source.voucherType ?? 'journal') as VoucherType;
  const voucherNumber = String(source.voucherNumber ?? source.voucherNo ?? '');
  const narration = String(source.narration ?? '');
  const lines = Array.isArray(source.lines) ? source.lines : [];

  return lines.map((line, index: number) => {
    const lineSource = (line ?? {}) as Record<string, unknown>;
    const side = (lineSource.side ?? lineSource.transactionType ?? 'debit') as Transaction['transactionType'];
    const amount = toNumber(lineSource.amount ?? 0);

    return {
      id: String(lineSource.id ?? `${source.id ?? voucherNumber}-${index}`),
      ledgerId: String(lineSource.ledgerId ?? ''),
      ledgerName: String(lineSource.ledgerName ?? ''),
      transactionDate: voucherDate,
      entryDate: voucherDate,
      amount,
      transactionType: side,
      description: narration || voucherNumber || String(lineSource.ledgerName ?? lineSource.ledgerId ?? 'Voucher'),
      voucherType,
      voucherNumber,
      narration,
      side,
    };
  });
};

const getLedgerTypeTotal = (ledgers: Ledger[], types: LedgerType[]) =>
  ledgers
    .filter((ledger) => types.includes(ledger.ledgerType))
    .reduce((sum, ledger) => sum + toNumber(ledger.balance), 0);

export const accountingService = {
  getCurrentUserProfile: async (): Promise<
    ApiResponse<{
      id: number;
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      inventory?: boolean;
      verified?: boolean;
    }>
  > => {
    const response = await apiClient.get(endpoints.auth.profile);
    return {
      success: true,
      data: response.data,
      message: response.data?.message,
    };
  },

  getInvoiceSummary: async (): Promise<
    ApiResponse<{
      total_sales: number;
      total_purchases: number;
      number_of_parties: number;
      number_of_items: number;
    }>
  > => {
    const response = await apiClient.get(endpoints.invoice.summary);
    return {
      success: Boolean(response.data?.success),
      data: response.data?.summary
        ? {
            total_sales: toNumber(response.data.summary.total_sales),
            total_purchases: toNumber(response.data.summary.total_purchases),
            number_of_parties: toNumber(response.data.summary.number_of_parties),
            number_of_items: toNumber(response.data.summary.number_of_items),
          }
        : undefined,
      message: response.data?.message,
    };
  },

  getLedgers: async (): Promise<ListResponse<Ledger>> => {
    const response = await apiClient.get(endpoints.accounting.ledgers);
    return {
      success: Boolean(response.data?.success),
      data: Array.isArray(response.data?.ledgers)
        ? response.data.ledgers.map(normalizeLedger)
        : [],
      message: response.data?.message,
    };
  },

  createLedger: async (data: {
    ledgerName: string;
    ledgerType: LedgerType;
    openingBalance: number;
  }): Promise<ApiResponse<Ledger>> => {
    const response = await apiClient.post(endpoints.accounting.createLedger, data);
    return {
      success: Boolean(response.data?.success),
      data: normalizeLedger(response.data?.ledger ?? response.data),
      message: response.data?.message,
    };
  },

  updateLedger: async (
    id: string,
    data: Partial<{
      ledgerName: string;
      ledgerType: LedgerType;
      openingBalance: number;
    }>
  ): Promise<ApiResponse<Ledger>> => {
    const response = await apiClient.put(endpoints.accounting.updateLedger(id), data);
    return {
      success: Boolean(response.data?.success),
      data: normalizeLedger(response.data?.ledger ?? response.data),
      message: response.data?.message,
    };
  },

  deleteLedger: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(endpoints.accounting.deleteLedger(id));
    return response.data;
  },

  getLedgerById: async (id: string): Promise<ApiResponse<Ledger>> => {
    const response = await apiClient.get(endpoints.accounting.ledgerById(id));
    return {
      success: Boolean(response.data?.success),
      data: response.data?.ledger ? normalizeLedger(response.data.ledger) : undefined,
      message: response.data?.message,
    };
  },

  getLedgerByPartyId: async (
    partyId: string,
    year?: number,
    month?: number
  ): Promise<ApiResponse<Ledger>> => {
    const response = await apiClient.get(endpoints.accounting.ledgerByPartyId(partyId), {
      params: {
        ...(year !== undefined ? { year } : {}),
        ...(month !== undefined ? { month } : {}),
      },
    });
    return {
      success: Boolean(response.data?.success),
      data: response.data?.ledger ? normalizeLedger(response.data.ledger) : undefined,
      message: response.data?.message,
    };
  },

  getParties: async (): Promise<ListResponse<Party>> => {
    const response = await apiClient.get(endpoints.accounting.parties, {
      params: {
        page: 1,
        limit: 1000,
      },
    });
    return {
      success: Boolean(response.data?.success),
      data: Array.isArray(response.data?.parties)
        ? response.data.parties.map(normalizeParty)
        : [],
      message: response.data?.message,
    };
  },

  getPartyById: async (id: string): Promise<ApiResponse<Party>> => {
    const response = await apiClient.get(endpoints.accounting.partyById(id));
    return {
      success: Boolean(response.data?.success),
      data: response.data?.party ? normalizeParty(response.data.party) : undefined,
      message: response.data?.message,
    };
  },

  createParty: async (data: {
    partyName: string;
    type: PartyType;
    gstin?: string;
    pan?: string;
    tan?: string;
    upi?: string;
    email?: string;
    phone?: string;
    address?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    bankBranch?: string;
    openingBalance?: number;
  }): Promise<ApiResponse<Party>> => {
    const response = await apiClient.post(endpoints.accounting.createParty, data);
    return {
      success: Boolean(response.data?.success),
      data: response.data?.party ? normalizeParty(response.data.party) : undefined,
      message: response.data?.message,
    };
  },

  updateParty: async (
    id: string,
    data: Partial<{
      partyName: string;
      type: PartyType;
      gstin?: string;
      pan?: string;
      tan?: string;
      upi?: string;
      email?: string;
      phone?: string;
      address?: string;
      bankName?: string;
      bankAccountNumber?: string;
      bankIfsc?: string;
      bankBranch?: string;
      openingBalance?: number;
    }>
  ): Promise<ApiResponse<Party>> => {
    const response = await apiClient.put(endpoints.accounting.updateParty(id), data);
    return {
      success: Boolean(response.data?.success),
      data: response.data?.party ? normalizeParty(response.data.party) : undefined,
      message: response.data?.message,
    };
  },

  deleteParty: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(endpoints.accounting.deleteParty(id));
    return response.data;
  },

  getAllBillPayables: async (): Promise<ListResponse<BillPayable>> => {
    const response = await apiClient.get(endpoints.accounting.billPayables);
    return {
      success: Boolean(response.data?.success),
      data: response.data?.data ?? response.data?.billPayables ?? [],
      message: response.data?.message,
    };
  },

  getBillPayable: async (id: string): Promise<ApiResponse<BillPayable>> => {
    const response = await apiClient.get(endpoints.accounting.billPayableById(id));
    return response.data;
  },

  createBillPayable: async (data: {
    supplierName: string;
    supplierAddress: string;
    contact: string;
    billDate: string;
    dueDate?: string;
    billAmount: number;
    billNumber: string;
    billDiscription?: string;
    paymentMethod?: string;
    transactionId?: string;
    paymentDate?: string;
    paymentAmount: number;
    tax?: number;
    comment?: string;
    invoiceNumber: string;
  }): Promise<ApiResponse<BillPayable>> => {
    const response = await apiClient.post(endpoints.accounting.createBillPayable, data);
    return response.data;
  },

  updateBillPayable: async (
    id: string,
    data: Partial<{
      supplierName: string;
      supplierAddress: string;
      contact: string;
      billDate: string;
      dueDate?: string;
      billAmount: number;
      billNumber: string;
      billDiscription?: string;
      paymentMethod?: string;
      transactionId?: string;
      paymentDate?: string;
      paymentAmount: number;
      tax?: number;
      comment?: string;
      invoiceNumber: string;
    }>
  ): Promise<ApiResponse<BillPayable>> => {
    const response = await apiClient.post(endpoints.accounting.updateBillPayable(id), data);
    return response.data;
  },

  deleteBillPayable: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(endpoints.accounting.deleteBillPayable(id));
    return response.data;
  },

  getAllBillReceivables: async (): Promise<ListResponse<BillReceivable>> => {
    const response = await apiClient.get(endpoints.accounting.billReceivables);
    return {
      success: Boolean(response.data?.success),
      data: response.data?.data ?? response.data?.billReceivables ?? [],
      message: response.data?.message,
    };
  },

  getBillReceivable: async (id: string): Promise<ApiResponse<BillReceivable>> => {
    const response = await apiClient.get(endpoints.accounting.billReceivableById(id));
    return response.data;
  },

  createBillReceivable: async (data: {
    billNumber: string;
    amount: string;
    tax?: string;
    customerName: string;
    customerAddress: string;
    contact: string;
    itemQuantity?: string;
    itemPrice?: string;
    itemDescription?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    dueDate?: string;
    comment?: string;
  }): Promise<ApiResponse<BillReceivable>> => {
    const response = await apiClient.post(endpoints.accounting.createBillReceivable, data);
    return response.data;
  },

  updateBillReceivable: async (
    id: string,
    data: Partial<{
      billNumber: string;
      amount: string;
      tax?: string;
      customerName: string;
      customerAddress: string;
      contact: string;
      itemQuantity?: string;
      itemPrice?: string;
      itemDescription?: string;
      paymentStatus?: string;
      paymentMethod?: string;
      dueDate?: string;
      comment?: string;
    }>
  ): Promise<ApiResponse<BillReceivable>> => {
    const response = await apiClient.post(endpoints.accounting.updateBillReceivable(id), data);
    return response.data;
  },

  deleteBillReceivable: async (id: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(endpoints.accounting.deleteBillReceivable(id));
    return response.data;
  },

  getActiveCustomers: async (
    ledgerType: LedgerType,
    year: number,
    month: number
  ): Promise<ApiResponse<{ activeCustomers: any[]; count: number }>> => {
    const parties = await accountingService.getParties();
    const filtered = (parties.data ?? []).filter((party) =>
      party.ledgers?.some(
        (ledger) =>
          ledger.ledgerType === ledgerType &&
          ledger.year === year &&
          ledger.month === month
      )
    );

    return {
      success: true,
      data: {
        activeCustomers: filtered,
        count: filtered.length,
      },
    };
  },

  getBankDetails: async (): Promise<ListResponse<any>> => {
    return { success: true, data: [] };
  },

  getBankDetailsByIfsc: async (ifsc: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(endpoints.accounting.bankDetails, { ifsc });
    return response.data;
  },

  verifyBankAccount: async (data: {
    accountNumber: string;
    ifsc: string;
    name: string;
    mobile: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(endpoints.accounting.verifyBank, data);
    return response.data;
  },

  getTransactions: async (limit = 50): Promise<ListResponse<Transaction>> => {
    const ledgers = await accountingService.getLedgers();
    const selectedLedgers = (ledgers.data ?? []).slice(0, Math.max(limit, 0));

    return {
      success: true,
      data: selectedLedgers.map((ledger) => ({
        id: ledger.id,
        ledgerId: ledger.id,
        journalEntryId: '',
        amount: ledger.balance,
        transactionType: ledger.balance >= 0 ? 'credit' : 'debit',
        userId: Number(ledger.userId),
        date: ledger.updatedAt,
        ledger,
      })),
    };
  },

  getDayBook: async (): Promise<ApiResponse<DayBook[]>> => {
    try {
      const response = await apiClient.get(endpoints.accounting.daybook);
      const backendDaybook = Array.isArray(response.data?.daybook)
        ? response.data.daybook.map((transaction: any) => {
            const transactionDate = formatDayBookDate(transaction?.date ?? transaction?.transactionDate);
            const side = (transaction?.transactionType ?? 'debit') as Transaction['transactionType'];

            return {
              id: String(transaction?.id ?? ''),
              ledgerId: String(transaction?.ledgerId ?? ''),
              ledgerName: String(transaction?.ledger?.ledgerName ?? transaction?.ledgerId ?? ''),
              transactionDate,
              entryDate: transactionDate,
              amount: toNumber(transaction?.amount ?? 0),
              transactionType: side,
              description: String(
                transaction?.journalEntry?.description ??
                  transaction?.ledger?.ledgerName ??
                  transaction?.ledgerId ??
                  'Transaction'
              ),
              narration: String(transaction?.journalEntry?.description ?? ''),
              side,
            } as DayBook;
          })
        : [];

      if (backendDaybook.length > 0) {
        return {
          success: Boolean(response.data?.success),
          data: backendDaybook.sort(
            (a: DayBook, b: DayBook) =>
              new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
          ),
          message: response.data?.message,
        };
      }

      const vouchers = await voucherService.getAll();
      const voucherEntries = (vouchers.data ?? []).flatMap(normalizeDayBookFromVoucher);

      return {
        success: Boolean(response.data?.success),
        data: voucherEntries.sort(
          (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        ),
        message: response.data?.message,
      };
    } catch {
      return { success: false, data: [] };
    }
  },

  getPayments: async (): Promise<ListResponse<Payment>> => {
    try {
      const response = await apiClient.get(endpoints.accounting.payments);
      return {
        success: Boolean(response.data?.success),
        data: Array.isArray(response.data?.data)
          ? response.data.data.map(normalizePayment)
          : Array.isArray(response.data?.payments)
            ? response.data.payments.map(normalizePayment)
            : [],
        message: response.data?.message,
      };
    } catch {
      return { success: false, data: [] };
    }
  },

  getPaymentById: async (id: string): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.get(endpoints.accounting.paymentById(id));
    return {
      success: Boolean(response.data?.success),
      data: response.data?.data ? normalizePayment(response.data.data) : undefined,
      message: response.data?.message,
    };
  },

  createPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    status: Payment['status'];
  }): Promise<ApiResponse<Payment>> => {
    const response = await apiClient.post(endpoints.accounting.createPayment, data);
    return {
      success: Boolean(response.data?.success),
      data: response.data?.data ? normalizePayment(response.data.data) : undefined,
      message: response.data?.message,
    };
  },

  getProfitAndLossReport: async (
    year: number,
    month: number
  ): Promise<ApiResponse<ProfitAndLossReport>> => {
    try {
      const summaryResponse = await accountingService.getInvoiceSummary();
      const totalIncome = toNumber(summaryResponse.data?.total_sales);
      const totalExpense = toNumber(summaryResponse.data?.total_purchases);
      const profit = totalIncome - totalExpense;

      return {
        success: true,
        data: {
          period: `${month}/${year}`,
          totalIncome,
          totalExpense,
          profit,
          profitMargin: totalIncome > 0 ? (profit / totalIncome) * 100 : 0,
        },
      };
    } catch {
      return { success: false };
    }
  },

  getBalanceSheetReport: async (): Promise<ApiResponse<BalanceSheetReport>> => {
    try {
      const ledgers = await accountingService.getLedgers();
      const data = ledgers.data ?? [];
      const assets = getLedgerTypeTotal(data, [
        'bank',
        'cash',
        'fixedAssets',
        'currentAssets',
        'accountsReceivable',
      ]);
      const liabilities = getLedgerTypeTotal(data, ['loansAndLiabilitieslw', 'accountsPayable']);
      const fixedAssets = getLedgerTypeTotal(data, ['fixedAssets']);
      const currentAssets = assets - fixedAssets;

      return {
        success: true,
        data: {
          date: new Date().toISOString(),
          assets: {
            currentAssets,
            fixedAssets,
            total: assets,
          },
          liabilities: {
            currentLiabilities: liabilities,
            fixedLiabilities: 0,
            total: liabilities,
          },
          equity: assets - liabilities,
        },
      };
    } catch {
      return { success: false };
    }
  },

  getCashFlowReport: async (
    year: number,
    month: number
  ): Promise<ApiResponse<CashFlowReport>> => {
    try {
      const summaryResponse = await accountingService.getInvoiceSummary();
      const inflow = toNumber(summaryResponse.data?.total_sales);
      const outflow = toNumber(summaryResponse.data?.total_purchases);

      return {
        success: true,
        data: {
          period: `${month}/${year}`,
          operatingCashFlow: inflow - outflow,
          investingCashFlow: 0,
          financingCashFlow: 0,
          netCashFlow: inflow - outflow,
        },
      };
    } catch {
      return { success: false };
    }
  },

  createItem: async (data: {
    itemName: string;
    unit: string;
    description?: string;
    quantity?: number;
    unitPrice: number;
    hsn?: string;
    sac?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(endpoints.invoice.items, {
      itemName: data.itemName,
      unit: data.unit,
      description: data.description,
      openingStock: data.quantity ?? 0,
      price: data.unitPrice,
      hsnCode: data.hsn ?? data.sac ?? '',
    });

    return {
      success: Boolean(response.data?.success),
      data: response.data?.item ?? response.data?.data,
      message: response.data?.message,
    };
  },

  getItems: async (): Promise<ListResponse<any>> => {
    const response = await apiClient.get(endpoints.invoice.items, {
      params: {
        page: 1,
        limit: 1000,
      },
    });
    return {
      success: Boolean(response.data?.success),
      data: response.data?.items ?? response.data?.data ?? [],
      message: response.data?.message,
    };
  },

  getItemById: async (id: string): Promise<any> => {
    const response = await apiClient.get(`${endpoints.invoice.items}/${id}`);
    return {
      success: Boolean(response.data?.success),
      data: response.data?.item ?? response.data?.data,
      message: response.data?.message,
    };
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

  updateItem: async (id: string, payload: Partial<CreateItemPayload>) => {
    const response = await apiClient.put(endpoints.invoice.itemById(id), payload);
    return response.data;
  },

  deleteItem: async (id: string) => {
    const response = await apiClient.delete(endpoints.invoice.itemById(id));
    return response.data;
  },
};
