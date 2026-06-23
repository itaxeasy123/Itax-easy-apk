export const endpoints = {
  auth: {
    forgotPassword: '/user/forgot-password',
    login: '/user/login',
    profile: '/user/profile',
    resendOtp: '/user/resendotp',
    signup: '/user/sign-up',
    update: '/user/update',
    updatePasswordWithOtp: '/user/update-password-with-otp',
    verifyOtp: '/user/verify',
  },
   invoice: {
    summary: '/invoice/summary',
    invoices: '/invoice/invoices',
    invoiceById: (id: string) => `/invoice/invoices/${id}`,
    parties: '/invoice/parties',
    partyById: (id: string) => `/invoice/parties/${id}`,
    items: '/invoice/items',
    itemById: (id: string) => `/invoice/items/${id}`,
  },

  einvoice: {
    auth: '/einvoice/auth',
    generate: '/einvoice/generate',
    pdf: '/einvoice/einvoicepdf',
    byIrn: '/einvoice/by-irn',
    cancel: '/einvoice/cancel',
    byDocument: '/einvoice/einvoicedoc',
  },

  // BillShield double-entry accounting (company-scoped)
  billshield: {
    companies: '/billshield/companies',
    company: (companyId: string) => `/billshield/companies/${companyId}`,
    groups: (companyId: string) => `/billshield/companies/${companyId}/groups`,
    groupTree: (companyId: string) => `/billshield/companies/${companyId}/groups/tree`,
    ledgers: (companyId: string) => `/billshield/companies/${companyId}/ledgers`,
    ledgerById: (companyId: string, id: string) => `/billshield/companies/${companyId}/ledgers/${id}`,
    ledgerStatement: (companyId: string, id: string) =>
      `/billshield/companies/${companyId}/ledgers/${id}/statement`,
    fiscalYears: (companyId: string) => `/billshield/companies/${companyId}/fiscal-years`,
    vouchers: (companyId: string) => `/billshield/companies/${companyId}/vouchers`,
    voucherById: (companyId: string, id: string) => `/billshield/companies/${companyId}/vouchers/${id}`,
    postVoucher: (companyId: string, id: string) =>
      `/billshield/companies/${companyId}/vouchers/${id}/post`,
    reverseVoucher: (companyId: string, id: string) =>
      `/billshield/companies/${companyId}/vouchers/${id}/reverse`,
    cashbook: (companyId: string) => `/billshield/companies/${companyId}/reports/cashbook`,
    bankbook: (companyId: string) => `/billshield/companies/${companyId}/reports/bankbook`,
    daybook: (companyId: string) => `/billshield/companies/${companyId}/reports/daybook`,
    trialBalance: (companyId: string) => `/billshield/companies/${companyId}/reports/trial-balance`,
    profitLoss: (companyId: string) => `/billshield/companies/${companyId}/reports/profit-loss`,
    balanceSheet: (companyId: string) => `/billshield/companies/${companyId}/reports/balance-sheet`,
  },

  accounting: {

    // Party endpoints (using invoice routes)
    parties: '/invoice/parties',
    partyById: (id: string) => `/invoice/parties/${id}`,
    createParty: '/invoice/parties',
    updateParty: (id: string) => `/invoice/parties/${id}`,
    deleteParty: (id: string) => `/invoice/parties/${id}`,

    // Bill endpoints
    billPayables: '/billpayable/getAll',
    billPayableById: (id: string) => `/billpayable/getOne/${id}`,
    createBillPayable: '/billpayable/create',
    updateBillPayable: (id: string) => `/billpayable/update/${id}`,
    deleteBillPayable: (id: string) => `/billpayable/delete/${id}`,

    billReceivables: '/billrecieve/getAll',
    billReceivableById: (id: string) => `/billrecieve/getOne/${id}`,
    createBillReceivable: '/billrecieve/create',
    updateBillReceivable: (id: string) => `/billrecieve/update/${id}`,
    deleteBillReceivable: (id: string) => `/billrecieve/delete/${id}`,

    // Bank endpoints
    bankDetails: '/bank/details',
    verifyBank: '/bank/verify-account',

    // Payment endpoints
    payments: '/payments',
    paymentById: (id: string) => `/payments/${id}`,
    createPayment: '/payments',
    updatePayment: (id: string) => `/payments/${id}`,
    deletePayment: (id: string) => `/payments/${id}`,
  },
};
