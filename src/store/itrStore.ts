import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SalaryData = {
  basicDA: string;
  hra: string;
  bonus: string;
  entertainmentAllowance: string;
  exemptAllowance10: string;
  grossSalary17_1: string;
  otherAllowance: string;
  pTax: string;
  grossTotal: number;
  incomeChargeableSalaries: string;
  netSalary: number;
  perquisites17_2: string;
  profit17_3: string;
  retirementBenefit89A: string;
  professionalTax16iii: string;
  standardDeduction16ia: string;
};

export type HousePropertyData = {
  annualValue: string;
  arrearsUnrealisedRent: string;
  grossRent: string;
  municipalTaxes: string;
  interestOnLoan: string;
  propertyType: string;
  thirtyPercentDeduction: string;
  incomeChargeableHouseProperty: string;
  nav: number;
  standardDeduction: number;
  incomeFromHP: number;
};

export type OtherSourcesData = {
  savingBankInterest: string;
  fixedDepositInterest: string;
  dividendIncome: string;
  anyOtherIncome: string;
  row1Description: string;
  row1Nature: string;
  row1Amount: string;
  row2Description: string;
  row2Nature: string;
  row2Amount: string;
  row3Description: string;
  row3Nature: string;
  row3Amount: string;
  row4Description: string;
  row4Nature: string;
  row4Amount: string;
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
  section80CCC: string;
  section80CCD1: string;
  section80D: string;
  section80E: string;
  section80DD: string;
  section80DDB: string;
  section80EE: string;
  section80EEA: string;
  section80EEB: string;
  section80GGA: string;
  section80GGC: string;
  section80GG: string;
  section80TTA: string;
  section80TTB: string;
  section80CCH: string;
  section80CCD1B: string;
  section80G: string;
  section80U: string;
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
  fileUri?: string;
  source: "pdf" | "image";
  rawText: string;
  employeeName?: string;
  employeePan?: string;
  employeeAddress?: string;
  employeeEmail?: string;
  employeePhone?: string;
  employerPan?: string;
  tan?: string;
  assessmentYear?: string;
  grossSalary?: number;
  grossTotalIncome?: number;
  salaryChargeable?: number;
  standardDeduction?: number;
  otherIncome?: number;
  basicDA?: number;
  hra?: number;
  bonus?: number;
  entertainmentAllowance?: number;
  exemptAllowance10?: number;
  otherAllowance?: number;
  pTax?: number;
  professionalTax16iii?: number;
  housePropertyIncome?: number;
  taxableIncome?: number;
  taxOnTotalIncome?: number;
  rebateUnderSection87A?: number;
  surcharge?: number;
  healthAndEducationCess?: number;
  taxPayable?: number;
  netTaxPayable?: number;
  totalAmountPaid?: number;
  totalAmountCredited?: number;
  totalTaxDeducted?: number;
  totalTaxDeposited?: number;
  section80C?: number;
  section80D?: number;
  section80CCD1B?: number;
  section80DD?: number;
  section80DDB?: number;
  section80EE?: number;
  section80EEA?: number;
  section80EEB?: number;
  section80GGA?: number;
  section80GGC?: number;
  section80GG?: number;
  section80TTA?: number;
  section80TTB?: number;
  section80CCH?: number;
  section80U?: number;
  otherDeductions?: number;
  chapterVIDeductionTotal?: number;
  tdsSalary?: number;
  employerName?: string;
  taxRegime?: "old" | "new";
  importedAt: string;
};

export type ReturnFormDraft = {
  filingInfo: {
    acknowledgmentNo: string;
    dateOfFilingOriginalReturn: string;
    din: string;
    filedInResponseToNotice: string;
    filedUnder: string;
    originalOrRevised: string;
    optOutOfNewRegime: "yes" | "no";
    originalReturnReceiptNumber: string;
    returnType: string;
    submissionMode: string;
    dateOfNoticeOrOrder: string;
    noticeSection: string;
  };
  contactDetails: {
    addressLine1: string;
    addressLine2: string;
    flatDoorBlockNo: string;
    buildingVillage: string;
    roadStreetPostOffice: string;
    areaLocality: string;
    townCityDistrict: string;
    countryRegion: string;
    city: string;
    email: string;
    mobile: string;
    pincode: string;
    noZipCode: string;
    zipCode: string;
    state: string;
  };
  bankDetails: {
    accountNumber: string;
    accountType: string;
    bankName: string;
    ifsc: string;
    prevalidated: string;
  };
  personalInfo: {
    firstName: string;
    middleName: string;
    lastName: string;
    name: string;
    pan: string;
    assessmentYear: string;
    employerName: string;
    employerPan: string;
    fatherName: string;
    dob: string;
    aadhaar: string;
    gender: string;
    natureOfEmployment: string;
    residentialStatus: string;
    tan: string;
    regime: "old" | "new";
  };
  salaryBreakup: {
    bonus: string;
    basicDA: string;
    entertainmentAllowance: string;
    exemptAllowance10: string;
    grossSalary17_1: string;
    grossTotal: string;
    incomeChargeableSalaries: string;
    hra: string;
    perquisites17_2: string;
    netSalary: string;
    otherAllowance: string;
    pTax: string;
    profit17_3: string;
    retirementBenefit89A: string;
    professionalTax16iii: string;
    standardDeduction16ia: string;
  };
  scheduleEA: {
    houseRentAllowance: string;
    leaveTravelAllowance: string;
    otherExemptAllowances: string;
    description: string;
  };
  schedule24B: {
    selfOccupiedInterest: string;
    letOutInterest: string;
    preConstructionInterest: string;
    remarks: string;
  };
  income: {
    salary: number;
    houseProperty: number;
    otherSources: number;
    businessProfession: number;
    capitalGains: number;
    standardDeduction: number;
    grossTotalIncome: number;
    taxableIncome: number;
  };
  deductions: {
    section80C: number;
    section80CCC: number;
    section80CCD1: number;
    section80CCD1B: number;
    section80D: number;
    section80DD: number;
    section80DDB: number;
    section80E: number;
    section80EE: number;
    section80EEA: number;
    section80EEB: number;
    section80GGA: number;
    section80GGC: number;
    section80GG: number;
    section80TTA: number;
    section80TTB: number;
    section80CCH: number;
    section80G: number;
    section80U: number;
    otherDeductions: number;
    totalDeductions: number;
    totalExemptions: number;
  };
  housePropertyDetails: {
    annualValue: string;
    arrearsUnrealisedRent: string;
    grossRent: string;
    interestOnLoan: string;
    municipalTaxes: string;
    propertyType: string;
    thirtyPercentDeduction: string;
    incomeChargeableHouseProperty: string;
  };
  otherSourcesDetails: {
    anyOtherIncome: string;
    dividendIncome: string;
    fixedDepositInterest: string;
    savingBankInterest: string;
    row1Description: string;
    row1Nature: string;
    row1Amount: string;
    row2Description: string;
    row2Nature: string;
    row2Amount: string;
    row3Description: string;
    row3Nature: string;
    row3Amount: string;
    row4Description: string;
    row4Nature: string;
    row4Amount: string;
  };
  taxesPaid: {
    tdsSalary: number;
    tdsNonSalary: number;
    tdsOther: number;
    advanceTax: number;
    tcs: number;
    selfAssessmentTax: number;
    totalPaid: number;
  };
  verification: {
    place: string;
    date: string;
    name: string;
    capacity: string;
  };
  summary: {
    taxOnTotalIncome: number;
    cess: number;
    rebate: number;
    surcharge: number;
    netPayable: number;
    refund: number;
  };
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
  returnFormDraft: ReturnFormDraft | null;
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
  setReturnFormDraft: (data: ReturnFormDraft | null) => void;
  setRegime: (regime: "old" | "new") => void;
  assessmentYear: string;
  setAssessmentYear: (year: string) => void;
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
  section80CCC: "",
  section80CCD1: "",
  section80D: "",
  section80E: "",
  section80DD: "",
  section80DDB: "",
  section80EE: "",
  section80EEA: "",
  section80EEB: "",
  section80GGA: "",
  section80GGC: "",
  section80GG: "",
  section80TTA: "",
  section80TTB: "",
  section80CCH: "",
  section80CCD1B: "",
  section80G: "",
  section80U: "",
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
  entertainmentAllowance: "",
  exemptAllowance10: "",
  grossSalary17_1: "",
  otherAllowance: "",
  pTax: "",
  grossTotal: 0,
  incomeChargeableSalaries: "",
  netSalary: 0,
  perquisites17_2: "",
  profit17_3: "",
  retirementBenefit89A: "",
  professionalTax16iii: "",
  standardDeduction16ia: "",
};

const INITIAL_HOUSE_PROPERTY: HousePropertyData = {
  annualValue: "",
  arrearsUnrealisedRent: "",
  grossRent: "",
  municipalTaxes: "",
  interestOnLoan: "",
  propertyType: "",
  thirtyPercentDeduction: "",
  incomeChargeableHouseProperty: "",
  nav: 0,
  standardDeduction: 0,
  incomeFromHP: 0,
};

const INITIAL_OTHER_SOURCES: OtherSourcesData = {
  savingBankInterest: "",
  fixedDepositInterest: "",
  dividendIncome: "",
  anyOtherIncome: "",
  row1Description: "",
  row1Nature: "",
  row1Amount: "",
  row2Description: "",
  row2Nature: "",
  row2Amount: "",
  row3Description: "",
  row3Nature: "",
  row3Amount: "",
  row4Description: "",
  row4Nature: "",
  row4Amount: "",
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

export const useITRStore = create<ITRState>()(
  persist(
    (set) => ({
      salary: INITIAL_SALARY,
      houseProperty: INITIAL_HOUSE_PROPERTY,
      otherSources: INITIAL_OTHER_SOURCES,
      businessProfession: INITIAL_BUSINESS_PROFESSION,
      capitalGains: INITIAL_CAPITAL_GAINS,
      deductions: INITIAL_DEDUCTIONS,
      taxesPaid: INITIAL_TAXES_PAID,
      interests: INITIAL_INTERESTS,
      form16: null,
      returnFormDraft: null,
      regime: "new",
      assessmentYear: "",

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

      setReturnFormDraft: (data) => set({ returnFormDraft: data }),

      setRegime: (regime) => set({ regime }),
      
      setAssessmentYear: (year) => set({ assessmentYear: year }),

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
          returnFormDraft: null,
          regime: "new",
        }),
    }),
    {
      name: "itr-data-storage",
      storage: createJSONStorage(() => {
        if (Platform.OS === "web") {
          if (typeof window !== "undefined" && window.localStorage) {
            return window.localStorage as any;
          }
          // Fallback for SSR
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as any;
        }
        return AsyncStorage;
      }),
    },
  ),
);
