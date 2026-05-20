import { create } from "zustand";

export type SalaryData = {
  basicDA: string;
  hra: string;
  bonus: string;
  otherAllowance: string;
  pTax: string;
  grossTotal: number;
  netSalary: number;
};

export type HousePropertyData = {
  grossRent: string;
  municipalTaxes: string;
  interestOnLoan: string;
  nav: number;
  standardDeduction: number;
  incomeFromHP: number;
};

export type OtherSourcesData = {
  savingBankInterest: string;
  fixedDepositInterest: string;
  dividendIncome: string;
  anyOtherIncome: string;
  totalOtherIncome: number;
};

export type BusinessProfessionData = {
  businessTurnover: string;
  businessProfitRate: number; // 6 or 8
  professionReceipts: string;
  totalBusinessProfit: number;
  totalProfessionProfit: number;
  totalIncome: number;
};

export type CapitalGainsData = {
  stcg15: string;
  stcgSlab: string;
  ltcg10: string;
  ltcg20: string;
  totalGains: number;
};

export type DeductionData = {
  section80C: string;
  section80D: string;
  section80CCD1B: string;
  otherDeductions: string;
  totalDeductions: number;
  totalExemptions: number;
};

export type AdvanceTaxEntry = {
  id: string;
  bsrCode: string;
  bankName: string;
  date: string;
  challanNo: string;
  amount: number;
};

export type TDSEntry = {
  id: string;
  tan: string;
  deductorName: string;
  purchaseAmount: string;
  taxAmount: number;
};

export type TDSSalaryEntry = {
  id: string;
  tan: string;
  employerName: string;
  salaryIncome: string;
  taxAmount: number;
};

export type TDSNonSalaryEntry = {
  id: string;
  business: string;
  section: string;
  name: string;
  tanPan: string;
  amountPaid: string;
  paymentDate: string;
  taxAmount: number;
  creditAmount: string;
  certificateNo: string;
};

export type TaxesPaidData = {
  tdsSalary: number;
  tdsNonSalary: number;
  tdsOther: number;
  advanceTax: number;
  advanceTaxEntries: AdvanceTaxEntry[];
  tdsEntries: TDSEntry[];
  tdsSalaryEntries: TDSSalaryEntry[];
  tdsNonSalaryEntries: TDSNonSalaryEntry[];
};

export type Form16ImportData = {
  fileName: string;
  source: "pdf" | "image";
  rawText: string;
  employeePan?: string;
  assessmentYear?: string;
  grossSalary?: number;
  salaryChargeable?: number;
  standardDeduction?: number;
  otherIncome?: number;
  section80C?: number;
  section80D?: number;
  section80CCD1B?: number;
  tdsSalary?: number;
  employerName?: string;
  importedAt: string;
};

export type InterestsData = {
  section234A: string;
  section234B: string;
  section234C: string;
  section234F: string;
  totalInterests: number;
};

type ITRState = {
  salary: SalaryData;
  houseProperty: HousePropertyData;
  otherSources: OtherSourcesData;
  businessProfession: BusinessProfessionData;
  capitalGains: CapitalGainsData;
  deductions: DeductionData;
  taxesPaid: TaxesPaidData;
  interests: InterestsData;
  form16: Form16ImportData | null;
  regime: "old" | "new";
  setSalary: (data: Partial<SalaryData>) => void;
  setHouseProperty: (data: Partial<HousePropertyData>) => void;
  setOtherSources: (data: Partial<OtherSourcesData>) => void;
  setBusinessProfession: (data: Partial<BusinessProfessionData>) => void;
  setCapitalGains: (data: Partial<CapitalGainsData>) => void;
  setDeductions: (data: Partial<DeductionData>) => void;
  setTaxesPaid: (data: Partial<TaxesPaidData>) => void;
  setInterests: (data: Partial<InterestsData>) => void;
  setForm16: (data: Form16ImportData | null) => void;
  setRegime: (regime: "old" | "new") => void;
  resetITR: () => void;
};

const INITIAL_TAXES_PAID: TaxesPaidData = {
  tdsSalary: 0,
  tdsNonSalary: 0,
  tdsOther: 0,
  advanceTax: 0,
  advanceTaxEntries: [],
  tdsEntries: [],
  tdsSalaryEntries: [],
  tdsNonSalaryEntries: [],
};

const INITIAL_DEDUCTIONS: DeductionData = {
  section80C: "",
  section80D: "",
  section80CCD1B: "",
  otherDeductions: "",
  totalDeductions: 0,
  totalExemptions: 0,
};

const INITIAL_INTERESTS: InterestsData = {
  section234A: "",
  section234B: "",
  section234C: "",
  section234F: "",
  totalInterests: 0,
};

const INITIAL_SALARY: SalaryData = {
  basicDA: "",
  hra: "",
  bonus: "",
  otherAllowance: "",
  pTax: "",
  grossTotal: 0,
  netSalary: 0,
};

const INITIAL_HOUSE_PROPERTY: HousePropertyData = {
  grossRent: "",
  municipalTaxes: "",
  interestOnLoan: "",
  nav: 0,
  standardDeduction: 0,
  incomeFromHP: 0,
};

const INITIAL_OTHER_SOURCES: OtherSourcesData = {
  savingBankInterest: "",
  fixedDepositInterest: "",
  dividendIncome: "",
  anyOtherIncome: "",
  totalOtherIncome: 0,
};

const INITIAL_BUSINESS_PROFESSION: BusinessProfessionData = {
  businessTurnover: "",
  businessProfitRate: 8,
  professionReceipts: "",
  totalBusinessProfit: 0,
  totalProfessionProfit: 0,
  totalIncome: 0,
};

const INITIAL_CAPITAL_GAINS: CapitalGainsData = {
  stcg15: "",
  stcgSlab: "",
  ltcg10: "",
  ltcg20: "",
  totalGains: 0,
};

export const useITRStore = create<ITRState>((set) => ({
  salary: INITIAL_SALARY,
  houseProperty: INITIAL_HOUSE_PROPERTY,
  otherSources: INITIAL_OTHER_SOURCES,
  businessProfession: INITIAL_BUSINESS_PROFESSION,
  capitalGains: INITIAL_CAPITAL_GAINS,
  deductions: INITIAL_DEDUCTIONS,
  taxesPaid: INITIAL_TAXES_PAID,
  interests: INITIAL_INTERESTS,
  form16: null,
  regime: "new",

  // Action Setters
  setSalary: (data) =>
    set((state) => ({
      salary: { ...state.salary, ...data },
    })),

  setHouseProperty: (data) =>
    set((state) => ({
      houseProperty: { ...state.houseProperty, ...data },
    })),

  setOtherSources: (data) =>
    set((state) => ({
      otherSources: { ...state.otherSources, ...data },
    })),

  setBusinessProfession: (data) =>
    set((state) => ({
      businessProfession: { ...state.businessProfession, ...data },
    })),

  setCapitalGains: (data) =>
    set((state) => ({
      capitalGains: { ...state.capitalGains, ...data },
    })),

  setDeductions: (data) =>
    set((state) => ({
      deductions: { ...state.deductions, ...data },
    })),

  setTaxesPaid: (data) =>
    set((state) => ({
      taxesPaid: { ...state.taxesPaid, ...data },
    })),

  setInterests: (data) =>
    set((state) => ({
      interests: { ...state.interests, ...data },
    })),

  setForm16: (data) => set({ form16: data }),

  setRegime: (regime) => set({ regime }),

  resetITR: () =>
    set({
      salary: INITIAL_SALARY,
      houseProperty: INITIAL_HOUSE_PROPERTY,
      otherSources: INITIAL_OTHER_SOURCES,
      businessProfession: INITIAL_BUSINESS_PROFESSION,
      capitalGains: INITIAL_CAPITAL_GAINS,
      deductions: INITIAL_DEDUCTIONS,
      taxesPaid: INITIAL_TAXES_PAID,
      interests: INITIAL_INTERESTS,
      form16: null,
      regime: "new",
    }),
}));
