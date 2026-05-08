export const endpoints = {
  auth: {
    forgotPassword: '/user/forgot-password',
    login: '/user/login',
    profile: '/user/profile',
    resendOtp: '/user/resendotp',
    signup: '/user/sign-up',
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

  accounting: {
    // Ledger endpoints
    ledgers: '/accountancy/all',
    createLedger: '/accountancy/create',
    updateLedger: (id: string) => `/accountancy/update/${id}`,
    deleteLedger: (id: string) => `/accountancy/delete/${id}`,
    ledgerById: (id: string) => `/accountancy/account/${id}`,
    ledgerByPartyId: (partyId: string) => `/accountancy/party/${partyId}`,
    searchLedgers: '/accountancy/search',
    customerCount: '/accountancy/customer-count',
    inactiveCustomers: '/accountancy/inactive-customers',
    activeCustomers: '/accountancy/favouraiteparty',
    transactions: '/accountancy/transactions',
    daybook: '/accountancy/daybook',
    journalEntries: '/accountancy/journal-entries',

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
