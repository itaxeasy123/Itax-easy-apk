import type {
  BusinessProfessionData,
  CapitalGainsData,
  DeductionData,
  Form16ImportData,
  HousePropertyData,
  OtherSourcesData,
  ReturnFormDraft,
  SalaryData,
  TaxesPaidData,
} from "../../../store/itrStore";

type BuildItrReturnDraftInput = {
  assessmentYear?: string;
  businessProfession: BusinessProfessionData;
  capitalGains: CapitalGainsData;
  deductions: DeductionData;
  form16: Form16ImportData | null;
  houseProperty: HousePropertyData;
  otherSources: OtherSourcesData;
  regime: "old" | "new";
  salary: SalaryData;
  taxesPaid: TaxesPaidData;
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
};

const splitName = (value: string | undefined) => {
  const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    lastName: parts.length > 1 ? parts[parts.length - 1] : "",
  };
};

const splitAddress = (value: string | undefined) => {
  const parts = (value ?? "")
    .split(/\r?\n|,/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    addressLine1: parts[0] ?? "",
    addressLine2: parts[1] ?? "",
    buildingVillage: parts[0] ?? "",
    roadStreetPostOffice: parts[1] ?? "",
    areaLocality: parts[2] ?? "",
    townCityDistrict: parts[3] ?? "",
    countryRegion: parts[4] ?? "",
    pincode: parts.find((part) => /\b\d{6}\b/.test(part)) ?? "",
    state: parts[parts.length - 1] ?? "",
  };
};

export const buildItrReturnDraft = ({
  assessmentYear,
  businessProfession,
  capitalGains,
  deductions,
  form16,
  houseProperty,
  otherSources,
  regime,
  salary,
  taxesPaid,
}: BuildItrReturnDraftInput): ReturnFormDraft => {
  const grossSalary = toNumber(form16?.grossSalary ?? salary.grossTotal);
  const salaryIncome = Math.max(
    grossSalary - toNumber(form16?.standardDeduction ?? 0),
    0,
  );

  const housePropertyIncome = toNumber(form16?.housePropertyIncome ?? houseProperty.incomeFromHP);
  const otherIncome = toNumber(form16?.otherIncome ?? otherSources.totalOtherIncome);
  const businessIncome = toNumber(businessProfession.totalIncome);
  const capitalGainIncome = toNumber(capitalGains.totalGains);
  const standardDeduction = toNumber(form16?.standardDeduction ?? 0);
  const grossTotalIncome =
    salaryIncome + housePropertyIncome + otherIncome + businessIncome + capitalGainIncome;

  const taxableIncome = Math.max(
    grossTotalIncome - toNumber(deductions.totalDeductions + deductions.totalExemptions),
    0,
  );

  const totalPaid =
    toNumber(form16?.totalTaxDeducted ?? taxesPaid.tdsSalary) +
    toNumber(taxesPaid.tdsNonSalary) +
    toNumber(taxesPaid.tdsOther) +
    toNumber(taxesPaid.advanceTax);

  const taxOnTotalIncome = toNumber(form16?.taxOnTotalIncome);
  const cess = toNumber(form16?.healthAndEducationCess);
  const rebate = toNumber(form16?.rebateUnderSection87A);
  const surcharge = toNumber(form16?.surcharge);
  const totalTax = toNumber(form16?.taxPayable ?? form16?.netTaxPayable);
  const netPayable = Math.max(totalTax - totalPaid, 0);
  const refund = Math.max(totalPaid - totalTax, 0);
  const { firstName, middleName, lastName } = splitName(form16?.employeeName);
  const address = splitAddress(form16?.employeeAddress);

  return {
    filingInfo: {
      acknowledgmentNo: "",
      dateOfFilingOriginalReturn: "",
      din: "",
      filedInResponseToNotice: "No",
      filedUnder: "139(1)",
      originalOrRevised: "Original",
      optOutOfNewRegime: regime === "old" ? "yes" : "no",
      originalReturnReceiptNumber: "",
      returnType: "ITR-1",
      submissionMode: "Online",
      dateOfNoticeOrOrder: "",
      noticeSection: "139(1)",
    },
    contactDetails: {
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      flatDoorBlockNo: "",
      buildingVillage: address.buildingVillage,
      roadStreetPostOffice: address.roadStreetPostOffice,
      areaLocality: address.areaLocality,
      townCityDistrict: address.townCityDistrict,
      countryRegion: address.countryRegion,
      city: "",
      email: form16?.employeeEmail ?? "",
      mobile: form16?.employeePhone ?? "",
      pincode: address.pincode,
      noZipCode: "",
      zipCode: "",
      state: address.state,
    },
    bankDetails: {
      accountNumber: "",
      accountType: "Savings",
      bankName: "",
      ifsc: "",
      prevalidated: "Yes",
    },
    personalInfo: {
      firstName,
      middleName,
      lastName,
      name: form16?.employeeName ?? "",
      pan: form16?.employeePan ?? "",
      assessmentYear: assessmentYear ?? form16?.assessmentYear ?? "",
      employerName: form16?.employerName ?? "",
      employerPan: form16?.employerPan ?? "",
      fatherName: "",
      dob: "",
      aadhaar: "",
      gender: "",
      natureOfEmployment: "",
      residentialStatus: "Resident",
      tan: form16?.tan ?? "",
      regime,
    },
    salaryBreakup: {
      bonus: String(toNumber(form16?.bonus ?? salary.bonus)),
      basicDA: String(toNumber(form16?.basicDA ?? salary.basicDA)),
      entertainmentAllowance: String(
        toNumber(form16?.entertainmentAllowance ?? salary.entertainmentAllowance),
      ),
      exemptAllowance10: String(toNumber(form16?.exemptAllowance10 ?? salary.exemptAllowance10)),
      grossSalary17_1: String(grossSalary),
      grossTotal: String(grossSalary),
      incomeChargeableSalaries: String(salaryIncome),
      hra: String(toNumber(form16?.hra ?? salary.hra)),
      perquisites17_2: "",
      netSalary: String(salaryIncome),
      otherAllowance: String(toNumber(form16?.otherAllowance ?? salary.otherAllowance)),
      pTax: String(toNumber(form16?.pTax ?? form16?.professionalTax16iii ?? salary.pTax)),
      profit17_3: "",
      retirementBenefit89A: "",
      professionalTax16iii: String(
        toNumber(form16?.professionalTax16iii ?? salary.professionalTax16iii),
      ),
      standardDeduction16ia: String(standardDeduction),
    },
    scheduleEA: {
      houseRentAllowance: String(toNumber(salary.hra)),
      leaveTravelAllowance: "",
      otherExemptAllowances: String(toNumber(salary.exemptAllowance10)),
      description: "",
    },
    schedule24B: {
      selfOccupiedInterest: String(toNumber(houseProperty.interestOnLoan)),
      letOutInterest: String(toNumber(houseProperty.interestOnLoan)),
      preConstructionInterest: "",
      remarks: "",
    },
    income: {
      salary: salaryIncome,
      houseProperty: housePropertyIncome,
      otherSources: otherIncome,
      businessProfession: businessIncome,
      capitalGains: capitalGainIncome,
      standardDeduction,
      grossTotalIncome,
      taxableIncome,
    },
    deductions: {
      section80C: toNumber(form16?.section80C ?? deductions.section80C),
      section80CCC: toNumber(deductions.section80CCC),
      section80CCD1: toNumber(deductions.section80CCD1),
      section80D: toNumber(form16?.section80D ?? deductions.section80D),
      section80E: toNumber(deductions.section80E),
      section80CCD1B: toNumber(form16?.section80CCD1B ?? deductions.section80CCD1B),
      section80DD: toNumber(form16?.section80DD ?? deductions.section80DD),
      section80DDB: toNumber(form16?.section80DDB ?? deductions.section80DDB),
      section80EE: toNumber(form16?.section80EE ?? deductions.section80EE),
      section80EEA: toNumber(form16?.section80EEA ?? deductions.section80EEA),
      section80EEB: toNumber(form16?.section80EEB ?? deductions.section80EEB),
      section80GGA: toNumber(form16?.section80GGA ?? deductions.section80GGA),
      section80GGC: toNumber(form16?.section80GGC ?? deductions.section80GGC),
      section80GG: toNumber(form16?.section80GG ?? deductions.section80GG),
      section80TTA: toNumber(form16?.section80TTA ?? deductions.section80TTA),
      section80TTB: toNumber(form16?.section80TTB ?? deductions.section80TTB),
      section80CCH: toNumber(form16?.section80CCH ?? deductions.section80CCH),
      section80G: toNumber(deductions.section80G),
      section80U: toNumber(form16?.section80U ?? deductions.section80U),
      otherDeductions: toNumber(form16?.otherDeductions ?? deductions.otherDeductions),
      totalDeductions: toNumber(deductions.totalDeductions),
      totalExemptions: toNumber(deductions.totalExemptions),
    },
    housePropertyDetails: {
      annualValue: String(houseProperty.incomeFromHP),
      arrearsUnrealisedRent: "",
      grossRent: String(houseProperty.incomeFromHP),
      interestOnLoan: "",
      municipalTaxes: "",
      propertyType: "",
      thirtyPercentDeduction: "",
      incomeChargeableHouseProperty: String(housePropertyIncome),
    },
    otherSourcesDetails: {
      anyOtherIncome: String(otherIncome),
      dividendIncome: "",
      fixedDepositInterest: "",
      savingBankInterest: "",
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
    },
    taxesPaid: {
      tdsSalary: toNumber(form16?.totalTaxDeducted ?? taxesPaid.tdsSalary),
      tdsNonSalary: toNumber(taxesPaid.tdsNonSalary),
      tdsOther: toNumber(taxesPaid.tdsOther),
      advanceTax: toNumber(taxesPaid.advanceTax),
      tcs: 0,
      selfAssessmentTax: 0,
      totalPaid,
    },
    verification: {
      place: "",
      date: "",
      name: form16?.employeeName ?? "",
      capacity: "",
    },
    summary: {
      taxOnTotalIncome,
      cess,
      rebate,
      surcharge,
      netPayable,
      refund,
    },
    importedAt: form16?.importedAt ?? new Date().toISOString(),
  };
};

export const buildItrReturnJson = (draft: ReturnFormDraft) => ({
  formName: "ITR1",
  generatedAt: new Date().toISOString(),
  ...draft,
});
