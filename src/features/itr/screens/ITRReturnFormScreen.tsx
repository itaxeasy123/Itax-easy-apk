import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useITRStore } from "../../../store/itrStore";
import { itrColors, itrShadows } from "../../../theme/itr";
import { calculateIncomeTax } from "../../taxCalculator/services/taxCalculator.service";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import {
  buildItrReturnDraft,
  buildItrReturnJson,
} from "../services/itrReturnForm.service";
import { exportITRData } from "../services/itrExport.service";

type FormState = {
  filingInfo: {
    acknowledgmentNo: string;
    dateOfFilingOriginalReturn: string;
    din: string;
    travelExpenditureOver2L: "yes" | "no";
    electricityExpenditureOver1L: "yes" | "no";
    filedInResponseToNotice: string;
    filedUnder: string;
    originalOrRevised: string;
    optOutOfNewRegime: "yes" | "no";
    otherConditionsClause: "yes" | "no";
    originalReturnReceiptNumber: string;
    returnType: string;
    submissionMode: string;
    dateOfNoticeOrOrder: string;
    noticeSection: string;
  };
  contactDetails: {
    addressLine1: string;
    addressLine2: string;
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
    assessmentYear: string;
    aadhaar: string;
    dob: string;
    firstName: string;
    middleName: string;
    lastName: string;
    employerName: string;
    employerPan: string;
    name: string;
    residentialStatus: string;
    pan: string;
    regime: "old" | "new";
    tan: string;
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
    retirementBenefit89ACountry: string;
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
    businessProfession: string;
    capitalGains: string;
    grossTotalIncome: string;
    houseProperty: string;
    otherSources: string;
    salary: string;
    standardDeduction: string;
    taxableIncome: string;
  };
  deductions: {
    section80C: string;
    section80CCC: string;
    section80CCD1: string;
    section80CCD1B: string;
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
    section80G: string;
    section80U: string;
    otherDeductions: string;
    totalDeductions: string;
    totalExemptions: string;
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
    row1Amount: string;
    row1Description: string;
    row1Nature: string;
    row2Amount: string;
    row2Description: string;
    row2Nature: string;
    row3Amount: string;
    row3Description: string;
    row3Nature: string;
    row4Amount: string;
    row4Description: string;
    row4Nature: string;
    exemptIncome1Nature: string;
    exemptIncome1Description: string;
    exemptIncome1Amount: string;
    exemptIncome2Nature: string;
    exemptIncome2Description: string;
    exemptIncome2Amount: string;
    ltcg112A_saleConsideration: string;
    ltcg112A_costOfAcquisition: string;
    ltcg112A_amount: string;
  };
  taxesPaid: {
    advanceTax: string;
    tdsNonSalary: string;
    tdsOther: string;
    tdsSalary: string;
    tcs: string;
    selfAssessmentTax: string;
    totalPaid: string;
  };
  verification: {
    place: string;
    date: string;
    name: string;
    capacity: string;
  };
};

const toAmount = (value: string) => {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
};

const toText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const toAmountText = (value: unknown) => {
  const amount = typeof value === "number" ? Math.round(value) : toAmount(toText(value));
  return amount ? String(amount) : "";
};

function FieldRow({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
  helper,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: "default" | "numeric" | "number-pad" | "email-address";
  placeholder?: string;
  helper?: string;
  readOnly?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
      <TextInput
        editable={true}
        keyboardType={keyboardType}
        onChangeText={readOnly ? undefined : onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        pointerEvents="auto"
        selectTextOnFocus
        style={[styles.input, readOnly && styles.readOnlyInput]}
        value={value}
      />
    </View>
  );
}

function SectionCard({
  title,
  children,
  subtitle,
}: {
  title: string;
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function ITRReturnFormScreen() {
  const router = useRouter();
  const {
    salary,
    houseProperty,
    otherSources,
    businessProfession,
    capitalGains,
    deductions,
    taxesPaid,
    interests,
    regime,
    form16,
    setReturnFormDraft,
    resetITR,
  } = useITRStore();

  const seedDraft = useMemo(
    () =>
      buildItrReturnDraft({
        assessmentYear: form16?.assessmentYear,
        businessProfession,
        capitalGains,
        deductions,
        form16,
        houseProperty,
        otherSources,
        regime,
        salary,
        taxesPaid,
      }),
    [
      businessProfession,
      capitalGains,
      deductions,
      form16,
      houseProperty,
      otherSources,
      regime,
      salary,
      taxesPaid,
    ],
  );

  const [form, setForm] = useState<FormState>(() => ({
    filingInfo: {
      acknowledgmentNo: "",
      dateOfFilingOriginalReturn: "",
      din: "",
      travelExpenditureOver2L: "no",
      electricityExpenditureOver1L: "no",
      filedInResponseToNotice: "No",
      filedUnder: "139(1)",
      originalReturnReceiptNumber: "",
      originalOrRevised: "Original",
      optOutOfNewRegime: seedDraft.personalInfo.regime === "old" ? "yes" : "no",
      otherConditionsClause: "no",
      returnType: "ITR-1",
      submissionMode: "Online",
      dateOfNoticeOrOrder: "",
      noticeSection: "139(1)",
    },
    contactDetails: {
      addressLine1: seedDraft.contactDetails.addressLine1,
      addressLine2: seedDraft.contactDetails.addressLine2,
      buildingVillage: seedDraft.contactDetails.buildingVillage,
      roadStreetPostOffice: seedDraft.contactDetails.roadStreetPostOffice,
      areaLocality: seedDraft.contactDetails.areaLocality,
      townCityDistrict: seedDraft.contactDetails.townCityDistrict,
      countryRegion: seedDraft.contactDetails.countryRegion,
      city: "",
      email: seedDraft.contactDetails.email,
      mobile: seedDraft.contactDetails.mobile,
      pincode: seedDraft.contactDetails.pincode,
      noZipCode: seedDraft.contactDetails.noZipCode,
      zipCode: seedDraft.contactDetails.zipCode,
      state: seedDraft.contactDetails.state,
    },
    bankDetails: {
      accountNumber: "",
      accountType: "Savings",
      bankName: "",
      ifsc: "",
      prevalidated: "Yes",
    },
    personalInfo: {
      assessmentYear: seedDraft.personalInfo.assessmentYear,
      aadhaar: "",
      dob: "",
      firstName: seedDraft.personalInfo.firstName,
      middleName: seedDraft.personalInfo.middleName,
      lastName: seedDraft.personalInfo.lastName,
      employerName: seedDraft.personalInfo.employerName,
      employerPan: seedDraft.personalInfo.employerPan,
      name: seedDraft.personalInfo.name,
      residentialStatus: seedDraft.personalInfo.regime === "old" ? "Resident" : "Resident",
      pan: seedDraft.personalInfo.pan,
      regime: seedDraft.personalInfo.regime,
      tan: seedDraft.personalInfo.tan,
    },
    salaryBreakup: {
      basicDA: toAmountText(seedDraft.salaryBreakup.basicDA),
      bonus: toAmountText(seedDraft.salaryBreakup.bonus),
      entertainmentAllowance: toAmountText(seedDraft.salaryBreakup.entertainmentAllowance),
      exemptAllowance10: toAmountText(seedDraft.salaryBreakup.exemptAllowance10),
      grossSalary17_1: toAmountText(seedDraft.income.salary),
      grossTotal: toAmountText(seedDraft.income.salary),
      incomeChargeableSalaries: toAmountText(seedDraft.income.salary),
      hra: toAmountText(seedDraft.salaryBreakup.hra),
      perquisites17_2: toAmountText(seedDraft.salaryBreakup.perquisites17_2),
      netSalary: toAmountText(seedDraft.income.salary),
      otherAllowance: toAmountText(seedDraft.salaryBreakup.otherAllowance),
      pTax: toAmountText(seedDraft.salaryBreakup.pTax),
      profit17_3: toAmountText(seedDraft.salaryBreakup.profit17_3),
      retirementBenefit89A: toAmountText(seedDraft.salaryBreakup.retirementBenefit89A),
      retirementBenefit89ACountry: "",
      professionalTax16iii: toAmountText(seedDraft.salaryBreakup.professionalTax16iii),
      standardDeduction16ia: toAmountText(seedDraft.income.standardDeduction),
    },
    scheduleEA: {
      houseRentAllowance: toAmountText(seedDraft.salaryBreakup.hra ?? ""),
      leaveTravelAllowance: "",
      otherExemptAllowances: toAmountText(seedDraft.salaryBreakup.exemptAllowance10 ?? ""),
      description: "",
    },
    schedule24B: {
      selfOccupiedInterest: toAmountText(seedDraft.schedule24B.selfOccupiedInterest ?? ""),
      letOutInterest: toAmountText(seedDraft.schedule24B.letOutInterest ?? ""),
      preConstructionInterest: toAmountText(seedDraft.schedule24B.preConstructionInterest ?? ""),
      remarks: seedDraft.schedule24B.remarks ?? "",
    },
    income: {
      businessProfession: toAmountText(seedDraft.income.businessProfession),
      capitalGains: toAmountText(seedDraft.income.capitalGains),
      grossTotalIncome: toAmountText(seedDraft.income.grossTotalIncome),
      houseProperty: toAmountText(seedDraft.income.houseProperty),
      otherSources: toAmountText(seedDraft.income.otherSources),
      salary: toAmountText(seedDraft.income.salary),
      standardDeduction: toAmountText(seedDraft.income.standardDeduction),
      taxableIncome: toAmountText(seedDraft.income.taxableIncome),
    },
    deductions: {
      section80C: toAmountText(seedDraft.deductions.section80C),
      section80CCC: toAmountText(seedDraft.deductions.section80CCC),
      section80CCD1: toAmountText(seedDraft.deductions.section80CCD1),
      section80CCD1B: toAmountText(seedDraft.deductions.section80CCD1B),
      section80D: toAmountText(seedDraft.deductions.section80D),
      section80E: toAmountText(seedDraft.deductions.section80E),
      section80DD: toAmountText(seedDraft.deductions.section80DD),
      section80DDB: toAmountText(seedDraft.deductions.section80DDB),
      section80EE: toAmountText(seedDraft.deductions.section80EE),
      section80EEA: toAmountText(seedDraft.deductions.section80EEA),
      section80EEB: toAmountText(seedDraft.deductions.section80EEB),
      section80GGA: toAmountText(seedDraft.deductions.section80GGA),
      section80GGC: toAmountText(seedDraft.deductions.section80GGC),
      section80GG: toAmountText(seedDraft.deductions.section80GG),
      section80TTA: toAmountText(seedDraft.deductions.section80TTA),
      section80TTB: toAmountText(seedDraft.deductions.section80TTB),
      section80CCH: toAmountText(seedDraft.deductions.section80CCH),
      section80G: toAmountText(seedDraft.deductions.section80G),
      section80U: toAmountText(seedDraft.deductions.section80U),
      otherDeductions: toAmountText(seedDraft.deductions.otherDeductions),
      totalDeductions: toAmountText(seedDraft.deductions.totalDeductions),
      totalExemptions: toAmountText(seedDraft.deductions.totalExemptions),
    },
    housePropertyDetails: {
      annualValue: "",
      arrearsUnrealisedRent: "",
      grossRent: "",
      interestOnLoan: "",
      municipalTaxes: "",
      propertyType: "",
      thirtyPercentDeduction: "",
      incomeChargeableHouseProperty: toAmountText(seedDraft.income.houseProperty),
    },
    otherSourcesDetails: {
      anyOtherIncome: "",
      dividendIncome: "",
      fixedDepositInterest: "",
      savingBankInterest: "",
      row1Amount: "",
      row1Description: "",
      row1Nature: "",
      row2Amount: "",
      row2Description: "",
      row2Nature: "",
      row3Amount: "",
      row3Description: "",
      row3Nature: "",
      row4Amount: "",
      row4Description: "",
      row4Nature: "",
      exemptIncome1Nature: "",
      exemptIncome1Description: "",
      exemptIncome1Amount: "",
      exemptIncome2Nature: "",
      exemptIncome2Description: "",
      exemptIncome2Amount: "",
      ltcg112A_saleConsideration: "",
      ltcg112A_costOfAcquisition: "",
      ltcg112A_amount: "",
    },
    taxesPaid: {
      advanceTax: toAmountText(seedDraft.taxesPaid.advanceTax),
      tdsNonSalary: toAmountText(seedDraft.taxesPaid.tdsNonSalary),
      tdsOther: toAmountText(seedDraft.taxesPaid.tdsOther),
      tdsSalary: toAmountText(seedDraft.taxesPaid.tdsSalary),
      tcs: "",
      selfAssessmentTax: "",
      totalPaid: toAmountText(seedDraft.taxesPaid.totalPaid),
    },
    verification: {
      place: "",
      date: "",
      name: seedDraft.personalInfo.name,
      capacity: "Self",
    },
  }));

  useEffect(() => {
    setForm({
    filingInfo: {
      acknowledgmentNo: "",
      dateOfFilingOriginalReturn: "",
      din: "",
      travelExpenditureOver2L: "no",
      electricityExpenditureOver1L: "no",
      filedInResponseToNotice: "No",
      filedUnder: "139(1)",
      originalReturnReceiptNumber: "",
      originalOrRevised: "Original",
      optOutOfNewRegime: seedDraft.personalInfo.regime === "old" ? "yes" : "no",
      otherConditionsClause: "no",
      returnType: "ITR-1",
      submissionMode: "Online",
      dateOfNoticeOrOrder: "",
      noticeSection: "139(1)",
    },
      contactDetails: {
        addressLine1: seedDraft.contactDetails.addressLine1,
        addressLine2: seedDraft.contactDetails.addressLine2,
        buildingVillage: seedDraft.contactDetails.buildingVillage,
        roadStreetPostOffice: seedDraft.contactDetails.roadStreetPostOffice,
        areaLocality: seedDraft.contactDetails.areaLocality,
        townCityDistrict: seedDraft.contactDetails.townCityDistrict,
        countryRegion: seedDraft.contactDetails.countryRegion,
        city: "",
        email: seedDraft.contactDetails.email,
        mobile: seedDraft.contactDetails.mobile,
        pincode: seedDraft.contactDetails.pincode,
        noZipCode: seedDraft.contactDetails.noZipCode,
        zipCode: seedDraft.contactDetails.zipCode,
        state: seedDraft.contactDetails.state,
      },
      bankDetails: {
        accountNumber: "",
        accountType: "Savings",
        bankName: "",
        ifsc: "",
        prevalidated: "Yes",
      },
      personalInfo: {
        assessmentYear: seedDraft.personalInfo.assessmentYear,
        aadhaar: "",
        dob: "",
        firstName: seedDraft.personalInfo.firstName,
        middleName: seedDraft.personalInfo.middleName,
        lastName: seedDraft.personalInfo.lastName,
        employerName: seedDraft.personalInfo.employerName,
        employerPan: seedDraft.personalInfo.employerPan,
        name: seedDraft.personalInfo.name,
        residentialStatus: seedDraft.personalInfo.regime === "old" ? "Resident" : "Resident",
        pan: seedDraft.personalInfo.pan,
        regime: seedDraft.personalInfo.regime,
        tan: seedDraft.personalInfo.tan,
      },
      salaryBreakup: {
        basicDA: "",
        bonus: "",
        entertainmentAllowance: "",
        exemptAllowance10: "",
        grossSalary17_1: toAmountText(seedDraft.income.salary),
        grossTotal: toAmountText(seedDraft.income.salary),
        incomeChargeableSalaries: toAmountText(seedDraft.income.salary),
        hra: "",
        perquisites17_2: "",
        netSalary: toAmountText(seedDraft.income.salary),
        otherAllowance: "",
        pTax: "",
        profit17_3: "",
        retirementBenefit89A: "",
        retirementBenefit89ACountry: "",
        professionalTax16iii: "",
        standardDeduction16ia: toAmountText(seedDraft.income.standardDeduction),
      },
      scheduleEA: {
        houseRentAllowance: toAmountText(seedDraft.salaryBreakup.hra ?? ""),
        leaveTravelAllowance: "",
        otherExemptAllowances: toAmountText(seedDraft.salaryBreakup.exemptAllowance10 ?? ""),
        description: "",
      },
      schedule24B: {
        selfOccupiedInterest: toAmountText(seedDraft.schedule24B.selfOccupiedInterest ?? ""),
        letOutInterest: toAmountText(seedDraft.schedule24B.letOutInterest ?? ""),
        preConstructionInterest: toAmountText(seedDraft.schedule24B.preConstructionInterest ?? ""),
        remarks: seedDraft.schedule24B.remarks ?? "",
      },
      income: {
        businessProfession: toAmountText(seedDraft.income.businessProfession),
        capitalGains: toAmountText(seedDraft.income.capitalGains),
        grossTotalIncome: toAmountText(seedDraft.income.grossTotalIncome),
        houseProperty: toAmountText(seedDraft.income.houseProperty),
        otherSources: toAmountText(seedDraft.income.otherSources),
        salary: toAmountText(seedDraft.income.salary),
        standardDeduction: toAmountText(seedDraft.income.standardDeduction),
        taxableIncome: toAmountText(seedDraft.income.taxableIncome),
      },
      deductions: {
        section80C: toAmountText(seedDraft.deductions.section80C),
        section80CCC: toAmountText(seedDraft.deductions.section80CCC),
        section80CCD1: toAmountText(seedDraft.deductions.section80CCD1),
        section80CCD1B: toAmountText(seedDraft.deductions.section80CCD1B),
        section80D: toAmountText(seedDraft.deductions.section80D),
        section80E: toAmountText(seedDraft.deductions.section80E),
        section80DD: toAmountText(seedDraft.deductions.section80DD),
        section80DDB: toAmountText(seedDraft.deductions.section80DDB),
        section80EE: toAmountText(seedDraft.deductions.section80EE),
        section80EEA: toAmountText(seedDraft.deductions.section80EEA),
        section80EEB: toAmountText(seedDraft.deductions.section80EEB),
        section80GGA: toAmountText(seedDraft.deductions.section80GGA),
        section80GGC: toAmountText(seedDraft.deductions.section80GGC),
        section80GG: toAmountText(seedDraft.deductions.section80GG),
        section80TTA: toAmountText(seedDraft.deductions.section80TTA),
        section80TTB: toAmountText(seedDraft.deductions.section80TTB),
        section80CCH: toAmountText(seedDraft.deductions.section80CCH),
        section80G: toAmountText(seedDraft.deductions.section80G),
        section80U: toAmountText(seedDraft.deductions.section80U),
        otherDeductions: toAmountText(seedDraft.deductions.otherDeductions),
        totalDeductions: toAmountText(seedDraft.deductions.totalDeductions),
        totalExemptions: toAmountText(seedDraft.deductions.totalExemptions),
      },
      housePropertyDetails: {
        annualValue: "",
        arrearsUnrealisedRent: "",
        grossRent: "",
        interestOnLoan: "",
        municipalTaxes: "",
        propertyType: "",
        thirtyPercentDeduction: "",
        incomeChargeableHouseProperty: toAmountText(seedDraft.income.houseProperty),
      },
      otherSourcesDetails: {
        anyOtherIncome: "",
        dividendIncome: "",
        fixedDepositInterest: "",
        savingBankInterest: "",
        row1Amount: "",
        row1Description: "",
        row1Nature: "",
        row2Amount: "",
        row2Description: "",
        row2Nature: "",
        row3Amount: "",
        row3Description: "",
        row3Nature: "",
        row4Amount: "",
        row4Description: "",
        row4Nature: "",
        exemptIncome1Nature: "",
        exemptIncome1Description: "",
        exemptIncome1Amount: "",
        exemptIncome2Nature: "",
        exemptIncome2Description: "",
        exemptIncome2Amount: "",
        ltcg112A_saleConsideration: "",
        ltcg112A_costOfAcquisition: "",
        ltcg112A_amount: "",
      },
      taxesPaid: {
        advanceTax: toAmountText(seedDraft.taxesPaid.advanceTax),
        tdsNonSalary: toAmountText(seedDraft.taxesPaid.tdsNonSalary),
        tdsOther: toAmountText(seedDraft.taxesPaid.tdsOther),
        tdsSalary: toAmountText(seedDraft.taxesPaid.tdsSalary),
        tcs: "",
        selfAssessmentTax: "",
        totalPaid: toAmountText(seedDraft.taxesPaid.totalPaid),
      },
      verification: {
        place: "",
        date: "",
        name: seedDraft.personalInfo.name,
        capacity: "Self",
      },
    });
  }, [seedDraft]);

  const summary = useMemo(() => {
    const salaryValue = toAmount(form.income.salary);
    const housePropertyValue = toAmount(form.income.houseProperty);
    const otherSourcesValue = toAmount(form.income.otherSources);
    const businessValue = toAmount(form.income.businessProfession);
    const capitalGainsValue = toAmount(form.income.capitalGains);
    const standardDeductionValue = toAmount(form.income.standardDeduction);
    const deductionsValue = toAmount(form.deductions.totalDeductions);
    const exemptionsValue = toAmount(form.deductions.totalExemptions);
    const taxResult = calculateIncomeTax({
      salary:
        salaryValue +
        housePropertyValue +
        businessValue +
        capitalGainsValue -
        standardDeductionValue,
      otherIncome: otherSourcesValue,
      deductions: deductionsValue,
      exemptions: exemptionsValue,
      tdsSalary: toAmount(form.taxesPaid.tdsSalary),
      tdsNonSalary: toAmount(form.taxesPaid.tdsNonSalary),
      tdsOther: toAmount(form.taxesPaid.tdsOther),
      advanceTax: toAmount(form.taxesPaid.advanceTax),
      regime: form.personalInfo.regime,
    });
    const grossTotalIncome =
      salaryValue + housePropertyValue + otherSourcesValue + businessValue + capitalGainsValue;

    return {
      totalIncome: grossTotalIncome,
      grossTotalIncome,
      taxPayableOnTotalIncome: taxResult.tax + taxResult.rebate,
      taxAfterRebate: taxResult.tax,
      taxOnTotalIncome: taxResult.totalTax,
      rebate: taxResult.rebate,
      surcharge: taxResult.surcharge,
      cess: taxResult.cess,
      relief89: 0,
      totalTaxFeeInterest: taxResult.netPayable,
      totalPaid: taxResult.totalPaid,
      totalInterestAndFee: 0,
      interest234A: 0,
      interest234B: 0,
      interest234C: 0,
      net: taxResult.netPayable,
      refund: taxResult.refund,
    };
  }, [form]);

  const updatePersonalInfo = (key: keyof FormState["personalInfo"], value: string) => {
    setForm((current) => ({
      ...current,
      personalInfo: { ...current.personalInfo, [key]: value },
    }));
  };

  const updateIncome = (key: keyof FormState["income"], value: string) => {
    setForm((current) => ({
      ...current,
      income: { ...current.income, [key]: value },
    }));
  };

  const updateDeductions = (key: keyof FormState["deductions"], value: string) => {
    setForm((current) => ({
      ...current,
      deductions: { ...current.deductions, [key]: value },
    }));
  };

  const updateTaxesPaid = (key: keyof FormState["taxesPaid"], value: string) => {
    setForm((current) => ({
      ...current,
      taxesPaid: { ...current.taxesPaid, [key]: value },
    }));
  };

  const updateFilingInfo = (key: keyof FormState["filingInfo"], value: string) => {
    setForm((current) => ({
      ...current,
      filingInfo: { ...current.filingInfo, [key]: value },
    }));
  };

  const updateContactDetails = (key: keyof FormState["contactDetails"], value: string) => {
    setForm((current) => ({
      ...current,
      contactDetails: { ...current.contactDetails, [key]: value },
    }));
  };

  const updateBankDetails = (key: keyof FormState["bankDetails"], value: string) => {
    setForm((current) => ({
      ...current,
      bankDetails: { ...current.bankDetails, [key]: value },
    }));
  };

  const updateSalaryBreakup = (key: keyof FormState["salaryBreakup"], value: string) => {
    setForm((current) => ({
      ...current,
      salaryBreakup: { ...current.salaryBreakup, [key]: value },
    }));
  };

  const updateScheduleEA = (key: keyof FormState["scheduleEA"], value: string) => {
    setForm((current) => ({
      ...current,
      scheduleEA: { ...current.scheduleEA, [key]: value },
    }));
  };

  const updateSchedule24B = (key: keyof FormState["schedule24B"], value: string) => {
    setForm((current) => ({
      ...current,
      schedule24B: { ...current.schedule24B, [key]: value },
    }));
  };

  const updateHousePropertyDetails = (key: keyof FormState["housePropertyDetails"], value: string) => {
    setForm((current) => ({
      ...current,
      housePropertyDetails: { ...current.housePropertyDetails, [key]: value },
    }));
  };

  const updateOtherSourcesDetails = (key: keyof FormState["otherSourcesDetails"], value: string) => {
    setForm((current) => ({
      ...current,
      otherSourcesDetails: { ...current.otherSourcesDetails, [key]: value },
    }));
  };

  const updateVerification = (key: keyof FormState["verification"], value: string) => {
    setForm((current) => ({
      ...current,
      verification: { ...current.verification, [key]: value },
    }));
  };

  const handleExport = async () => {
    const normalizedDraft = {
      filingInfo: {
        ...form.filingInfo,
      },
      contactDetails: {
        ...form.contactDetails,
      },
      bankDetails: {
        ...form.bankDetails,
      },
      personalInfo: {
        ...form.personalInfo,
      },
      salaryBreakup: {
        ...form.salaryBreakup,
        grossTotal: summary.grossTotalIncome,
        netSalary: summary.grossTotalIncome - toAmount(form.income.standardDeduction),
      },
      scheduleEA: {
        ...form.scheduleEA,
      },
      schedule24B: {
        ...form.schedule24B,
      },
      income: {
        salary: toAmount(form.income.salary),
        houseProperty: toAmount(form.income.houseProperty),
        otherSources: toAmount(form.income.otherSources),
        businessProfession: toAmount(form.income.businessProfession),
        capitalGains: toAmount(form.income.capitalGains),
        standardDeduction: toAmount(form.income.standardDeduction),
        grossTotalIncome: summary.grossTotalIncome,
        taxableIncome: toAmount(form.income.taxableIncome),
      },
      deductions: {
        section80C: toAmount(form.deductions.section80C),
        section80CCC: toAmount(form.deductions.section80CCC),
        section80CCD1: toAmount(form.deductions.section80CCD1),
        section80D: toAmount(form.deductions.section80D),
        section80E: toAmount(form.deductions.section80E),
        section80DD: toAmount(form.deductions.section80DD),
        section80EE: toAmount(form.deductions.section80EE),
        section80EEA: toAmount(form.deductions.section80EEA),
        section80EEB: toAmount(form.deductions.section80EEB),
        section80CCD1B: toAmount(form.deductions.section80CCD1B),
        section80G: toAmount(form.deductions.section80G),
        section80GGA: toAmount(form.deductions.section80GGA),
        section80GGC: toAmount(form.deductions.section80GGC),
        section80TTA: toAmount(form.deductions.section80TTA),
        section80TTB: toAmount(form.deductions.section80TTB),
        section80U: toAmount(form.deductions.section80U),
        otherDeductions: toAmount(form.deductions.otherDeductions),
        totalDeductions: toAmount(form.deductions.totalDeductions),
        totalExemptions: toAmount(form.deductions.totalExemptions),
      },
      housePropertyDetails: {
        ...form.housePropertyDetails,
      },
      otherSourcesDetails: {
        ...form.otherSourcesDetails,
      },
      taxesPaid: {
        tdsSalary: toAmount(form.taxesPaid.tdsSalary),
        tdsNonSalary: toAmount(form.taxesPaid.tdsNonSalary),
        tdsOther: toAmount(form.taxesPaid.tdsOther),
        advanceTax: toAmount(form.taxesPaid.advanceTax),
        tcs: toAmount(form.taxesPaid.tcs),
        selfAssessmentTax: toAmount(form.taxesPaid.selfAssessmentTax),
        totalPaid: summary.totalPaid,
      },
      verification: {
        ...form.verification,
      },
      summary: {
        taxOnTotalIncome: summary.taxOnTotalIncome,
        cess: 0,
        rebate: 0,
        surcharge: 0,
        netPayable: summary.net,
        refund: summary.refund,
      },
      importedAt: new Date().toISOString(),
    };

    setReturnFormDraft(normalizedDraft);
    await exportITRData(buildItrReturnJson(normalizedDraft));
  };

  const handleReset = () => {
    Alert.alert("Reset return form?", "This will clear the current filled return form draft.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          setForm({
            filingInfo: {
              acknowledgmentNo: "",
              dateOfFilingOriginalReturn: "",
              din: "",
              travelExpenditureOver2L: "no",
              electricityExpenditureOver1L: "no",
              filedInResponseToNotice: "No",
              filedUnder: "139(1)",
              originalReturnReceiptNumber: "",
              originalOrRevised: "Original",
              optOutOfNewRegime: seedDraft.personalInfo.regime === "old" ? "yes" : "no",
              otherConditionsClause: "no",
              returnType: "ITR-1",
              submissionMode: "Online",
              dateOfNoticeOrOrder: "",
              noticeSection: "139(1)",
            },
              contactDetails: {
                addressLine1: "",
                addressLine2: "",
                buildingVillage: "",
                roadStreetPostOffice: "",
                areaLocality: "",
              townCityDistrict: "",
              countryRegion: "",
              city: "",
              email: seedDraft.contactDetails.email,
              mobile: seedDraft.contactDetails.mobile,
              pincode: "",
              noZipCode: "",
              zipCode: "",
              state: "",
            },
            bankDetails: {
              accountNumber: "",
              accountType: "Savings",
              bankName: "",
              ifsc: "",
              prevalidated: "Yes",
            },
            personalInfo: {
              assessmentYear: seedDraft.personalInfo.assessmentYear,
              aadhaar: "",
              dob: "",
              firstName: seedDraft.personalInfo.firstName,
              middleName: seedDraft.personalInfo.middleName,
              lastName: seedDraft.personalInfo.lastName,
              employerName: seedDraft.personalInfo.employerName,
              employerPan: seedDraft.personalInfo.employerPan,
              name: seedDraft.personalInfo.name,
              residentialStatus: seedDraft.personalInfo.regime === "old" ? "Resident" : "Resident",
              pan: seedDraft.personalInfo.pan,
              regime: seedDraft.personalInfo.regime,
              tan: seedDraft.personalInfo.tan,
            },
            salaryBreakup: {
              basicDA: "",
              bonus: "",
              entertainmentAllowance: "",
              exemptAllowance10: "",
              grossSalary17_1: toAmountText(seedDraft.income.salary),
              grossTotal: toAmountText(seedDraft.income.salary),
              incomeChargeableSalaries: toAmountText(seedDraft.income.salary),
              hra: "",
              perquisites17_2: "",
              netSalary: toAmountText(seedDraft.income.salary),
              otherAllowance: "",
              pTax: "",
              profit17_3: "",
              retirementBenefit89A: "",
              retirementBenefit89ACountry: "",
              professionalTax16iii: "",
              standardDeduction16ia: toAmountText(seedDraft.income.standardDeduction),
            },
            scheduleEA: {
              houseRentAllowance: toAmountText(seedDraft.salaryBreakup.hra ?? ""),
              leaveTravelAllowance: "",
              otherExemptAllowances: toAmountText(seedDraft.salaryBreakup.exemptAllowance10 ?? ""),
              description: "",
            },
            schedule24B: {
              selfOccupiedInterest: toAmountText(seedDraft.schedule24B.selfOccupiedInterest ?? ""),
              letOutInterest: toAmountText(seedDraft.schedule24B.letOutInterest ?? ""),
              preConstructionInterest: toAmountText(seedDraft.schedule24B.preConstructionInterest ?? ""),
              remarks: seedDraft.schedule24B.remarks ?? "",
            },
            income: {
              businessProfession: toAmountText(seedDraft.income.businessProfession),
              capitalGains: toAmountText(seedDraft.income.capitalGains),
              grossTotalIncome: toAmountText(seedDraft.income.grossTotalIncome),
              houseProperty: toAmountText(seedDraft.income.houseProperty),
              otherSources: toAmountText(seedDraft.income.otherSources),
              salary: toAmountText(seedDraft.income.salary),
              standardDeduction: toAmountText(seedDraft.income.standardDeduction),
              taxableIncome: toAmountText(seedDraft.income.taxableIncome),
            },
            deductions: {
              section80C: toAmountText(seedDraft.deductions.section80C),
              section80CCC: toAmountText(seedDraft.deductions.section80CCC),
              section80CCD1: toAmountText(seedDraft.deductions.section80CCD1),
              section80CCD1B: toAmountText(seedDraft.deductions.section80CCD1B),
              section80D: toAmountText(seedDraft.deductions.section80D),
              section80E: toAmountText(seedDraft.deductions.section80E),
              section80DD: toAmountText(seedDraft.deductions.section80DD),
              section80DDB: toAmountText(seedDraft.deductions.section80DDB),
              section80EE: toAmountText(seedDraft.deductions.section80EE),
              section80EEA: toAmountText(seedDraft.deductions.section80EEA),
              section80EEB: toAmountText(seedDraft.deductions.section80EEB),
              section80GGA: toAmountText(seedDraft.deductions.section80GGA),
              section80GGC: toAmountText(seedDraft.deductions.section80GGC),
              section80GG: toAmountText(seedDraft.deductions.section80GG),
              section80TTA: toAmountText(seedDraft.deductions.section80TTA),
              section80TTB: toAmountText(seedDraft.deductions.section80TTB),
              section80CCH: toAmountText(seedDraft.deductions.section80CCH),
              section80G: toAmountText(seedDraft.deductions.section80G),
              section80U: toAmountText(seedDraft.deductions.section80U),
              otherDeductions: toAmountText(seedDraft.deductions.otherDeductions),
              totalDeductions: toAmountText(seedDraft.deductions.totalDeductions),
              totalExemptions: toAmountText(seedDraft.deductions.totalExemptions),
            },
            housePropertyDetails: {
              annualValue: "",
              arrearsUnrealisedRent: "",
              grossRent: "",
              interestOnLoan: "",
              municipalTaxes: "",
              propertyType: "",
              thirtyPercentDeduction: "",
              incomeChargeableHouseProperty: toAmountText(seedDraft.income.houseProperty),
            },
            otherSourcesDetails: {
              anyOtherIncome: "",
              dividendIncome: "",
              fixedDepositInterest: "",
              savingBankInterest: "",
              row1Amount: "",
              row1Description: "",
              row1Nature: "",
              row2Amount: "",
              row2Description: "",
              row2Nature: "",
              row3Amount: "",
              row3Description: "",
              row3Nature: "",
              row4Amount: "",
              row4Description: "",
              row4Nature: "",
              exemptIncome1Nature: "",
              exemptIncome1Description: "",
              exemptIncome1Amount: "",
              exemptIncome2Nature: "",
              exemptIncome2Description: "",
              exemptIncome2Amount: "",
              ltcg112A_saleConsideration: "",
              ltcg112A_costOfAcquisition: "",
              ltcg112A_amount: "",
            },
            taxesPaid: {
              advanceTax: toAmountText(seedDraft.taxesPaid.advanceTax),
              tdsNonSalary: toAmountText(seedDraft.taxesPaid.tdsNonSalary),
              tdsOther: toAmountText(seedDraft.taxesPaid.tdsOther),
              tdsSalary: toAmountText(seedDraft.taxesPaid.tdsSalary),
              tcs: "",
              selfAssessmentTax: "",
              totalPaid: toAmountText(seedDraft.taxesPaid.totalPaid),
            },
            verification: {
              place: "",
              date: "",
              name: seedDraft.personalInfo.name,
              capacity: "Self",
            },
          });
          setReturnFormDraft(null);
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ITRHeader
        title="ITR Return Form"
        rightContent={<Text style={styles.headerYear}>{form.personalInfo.assessmentYear || "Return"}</Text>}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {form16 ? (
          <Pressable style={styles.importBanner} onPress={() => router.push("/itr/form-16")}>
            <View style={styles.importBannerLeft}>
              <Ionicons name="document-text-outline" size={18} color={itrColors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.importBannerTitle}>Filled from Form 16</Text>
                <Text style={styles.importBannerSub}>
                  {form16.fileName}
                  {form16.assessmentYear ? ` · ${form16.assessmentYear}` : ""}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </Pressable>
        ) : null}

        <SectionCard title="PART A GENERAL INFORMATION" subtitle="Filing section and identity details as shown in the workbook.">
          <FieldRow label="FORM" value={form.filingInfo.returnType} onChangeText={(value) => updateFilingInfo("returnType", value)} />
          <FieldRow label="Assessment Year" value={form.personalInfo.assessmentYear} onChangeText={(value) => updatePersonalInfo("assessmentYear", value)} />
          <FieldRow label="Acknowledgement Number" value={form.filingInfo.acknowledgmentNo} onChangeText={(value) => updateFilingInfo("acknowledgmentNo", value)} />
          <FieldRow label="Date of filing of original return" value={form.filingInfo.dateOfFilingOriginalReturn} onChangeText={(value) => updateFilingInfo("dateOfFilingOriginalReturn", value)} placeholder="DD/MM/YYYY" />
          <FieldRow label="Unique Number / Document Identification Number (DIN)" value={form.filingInfo.din} onChangeText={(value) => updateFilingInfo("din", value)} />
          <FieldRow label="PAN" value={form.personalInfo.pan} onChangeText={(value) => updatePersonalInfo("pan", value)} />
          <FieldRow label="First Name" value={form.personalInfo.firstName} onChangeText={(value) => updatePersonalInfo("firstName", value)} />
          <FieldRow label="Middle Name" value={form.personalInfo.middleName} onChangeText={(value) => updatePersonalInfo("middleName", value)} />
          <FieldRow label="Last Name" value={form.personalInfo.lastName} onChangeText={(value) => updatePersonalInfo("lastName", value)} />
          <FieldRow label="Date of Birth (DD/MM/YYYY)" value={form.personalInfo.dob} onChangeText={(value) => updatePersonalInfo("dob", value)} placeholder="DD/MM/YYYY" />
          <FieldRow label="Aadhaar Number [12 Digits]" value={form.personalInfo.aadhaar} onChangeText={(value) => updatePersonalInfo("aadhaar", value)} keyboardType="numeric" />
          <FieldRow label="Email Address" value={form.contactDetails.email} onChangeText={(value) => updateContactDetails("email", value)} keyboardType="email-address" />
          <FieldRow label="Mobile Number" value={form.contactDetails.mobile} onChangeText={(value) => updateContactDetails("mobile", value)} keyboardType="numeric" />
          <FieldRow label="Name of Premises / Building / Village" value={form.contactDetails.buildingVillage} onChangeText={(value) => updateContactDetails("buildingVillage", value)} />
          <FieldRow label="Road / Street / Post Office" value={form.contactDetails.roadStreetPostOffice} onChangeText={(value) => updateContactDetails("roadStreetPostOffice", value)} />
          <FieldRow label="Area / Locality" value={form.contactDetails.areaLocality} onChangeText={(value) => updateContactDetails("areaLocality", value)} />
          <FieldRow label="Town / City / District" value={form.contactDetails.townCityDistrict} onChangeText={(value) => updateContactDetails("townCityDistrict", value)} />
          <FieldRow label="Country / Region" value={form.contactDetails.countryRegion} onChangeText={(value) => updateContactDetails("countryRegion", value)} />
          <FieldRow label="State" value={form.contactDetails.state} onChangeText={(value) => updateContactDetails("state", value)} />
          <FieldRow label="PIN Code" value={form.contactDetails.pincode} onChangeText={(value) => updateContactDetails("pincode", value)} keyboardType="numeric" />
          <FieldRow label="No ZIP Code" value={form.contactDetails.noZipCode} onChangeText={(value) => updateContactDetails("noZipCode", value)} />
          <FieldRow label="ZIP Code" value={form.contactDetails.zipCode} onChangeText={(value) => updateContactDetails("zipCode", value)} />
          <Text style={styles.questionHeading}>Do you wish to exercise the option u/s 115BAC(6) of Opting out of new tax regime? (default is "No")</Text>
          <Text style={styles.helperText}>1. By selecting "No" option your income and tax computation shall be as per "NEW TAX REGIME"</Text>
          <Text style={styles.helperText}>2. By selecting "Yes" option your income and tax computation shall be as per "OLD TAX REGIME"</Text>
          <Text style={styles.helperText}>Note- For Opting out, option should be exercised along with the return of income filed u/s 139(1).</Text>
          <View style={styles.pillsRow}>
            {(["no", "yes"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => updateFilingInfo("optOutOfNewRegime", item)}
                style={[styles.pill, form.filingInfo.optOutOfNewRegime === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.filingInfo.optOutOfNewRegime === item && styles.pillTextActive]}>
                  {item === "no" ? "No" : "Yes"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.questionHeading}>Have you incurred expenditure of an amount or aggregate of amount exceeding Rs. 2 lakhs for travel to a foreign country for yourself or for any other person?</Text>
          <View style={styles.pillsRow}>
            {(["no", "yes"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => updateFilingInfo("travelExpenditureOver2L", item)}
                style={[styles.pill, form.filingInfo.travelExpenditureOver2L === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.filingInfo.travelExpenditureOver2L === item && styles.pillTextActive]}>{item === "no" ? "No" : "Yes"}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.questionHeading}>Have you incurred expenditure of amount or aggregate of amount exceeding Rs. 1 lakh on consumption of electricity during the previous year?</Text>
          <View style={styles.pillsRow}>
            {(["no", "yes"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => updateFilingInfo("electricityExpenditureOver1L", item)}
                style={[styles.pill, form.filingInfo.electricityExpenditureOver1L === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.filingInfo.electricityExpenditureOver1L === item && styles.pillTextActive]}>{item === "no" ? "No" : "Yes"}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.questionHeading}>Are you required to file a return as per other conditions prescribed under clause (iv) of seventh proviso to section 139(1)</Text>
          <Text style={styles.helperText}>(If yes, please furnish following information)</Text>
          <View style={styles.pillsRow}>
            {(["no", "yes"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => updateFilingInfo("otherConditionsClause", item)}
                style={[styles.pill, form.filingInfo.otherConditionsClause === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.filingInfo.otherConditionsClause === item && styles.pillTextActive]}>{item === "no" ? "No" : "Yes"}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.helperText}>the aggregate of tax deducted at source and tax collected at source during the previous year, in the case of the person, is twenty-five thousand rupees or more (fifty thousand for resident senior citizen); or</Text>
          <Text style={styles.helperText}>The deposit in one or more savings bank account of the person, in aggregate, is fifty lakh rupees or more, in the previous year</Text>
          <View style={styles.pillsRow}>
            {(["139(1)", "139(4)", "139(5)", "119(2)(b)", "139(8A)"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => updateFilingInfo("filedUnder", item)}
                style={[styles.pill, form.filingInfo.filedUnder === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.filingInfo.filedUnder === item && styles.pillTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <FieldRow label="Date of such Notice or Order" value={form.filingInfo.dateOfNoticeOrOrder} onChangeText={(value) => updateFilingInfo("dateOfNoticeOrOrder", value)} placeholder="DD/MM/YYYY" />
          <Text style={styles.subSectionLabel}>Filed in response to notice u/s</Text>
          <View style={styles.pillsRow}>
            {(["No", "Yes"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => updateFilingInfo("filedInResponseToNotice", item)}
                style={[styles.pill, form.filingInfo.filedInResponseToNotice === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.filingInfo.filedInResponseToNotice === item && styles.pillTextActive]}>
                  {item === "Yes" ? "Yes" : "No"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.fieldHelper}>139(9) / 142(1) / 148 / 153C / 119(2)(b)</Text>
          <View style={styles.pillsRow}>
            {(["139(9)", "142(1)", "148", "153C"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => updateFilingInfo("noticeSection", item)}
                style={[styles.pill, form.filingInfo.noticeSection === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.filingInfo.noticeSection === item && styles.pillTextActive]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="SALARY / PENSION" subtitle="Exact salary section wording from the ITR-1 workbook.">
          <FieldRow label="Gross Salary (ia + ib + ic + id + ie)" value={form.salaryBreakup.grossTotal} onChangeText={(value) => updateSalaryBreakup("grossTotal", value)} keyboardType="numeric" helper="a + b + c + d + e" />
          <FieldRow label="Salary as per section 17(1)" value={form.salaryBreakup.grossSalary17_1} onChangeText={(value) => updateSalaryBreakup("grossSalary17_1", value)} keyboardType="numeric" helper="Salary received during the year" />
          <FieldRow label="Value of perquisites as per section 17(2)" value={form.salaryBreakup.perquisites17_2} onChangeText={(value) => updateSalaryBreakup("perquisites17_2", value)} keyboardType="numeric" helper="Employer-provided benefits / perquisites" />
          <FieldRow label="Profit in lieu of salary as per section 17(3)" value={form.salaryBreakup.profit17_3} onChangeText={(value) => updateSalaryBreakup("profit17_3", value)} keyboardType="numeric" helper="Any compensation taxable under section 17(3)" />
          <FieldRow label="Income from retirement benefit account maintained in a notified country u/s 89A" value={form.salaryBreakup.retirementBenefit89A} onChangeText={(value) => updateSalaryBreakup("retirementBenefit89A", value)} keyboardType="numeric" />
          <FieldRow label="Country" value={form.salaryBreakup.retirementBenefit89ACountry} onChangeText={(value) => updateSalaryBreakup("retirementBenefit89ACountry", value)} placeholder="United States of America / United Kingdom / Canada" />
          <View style={styles.pillsRow}>
            {(["United States of America", "United Kingdom of Great Britain and Northern Ireland", "Canada"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => updateSalaryBreakup("retirementBenefit89ACountry", item)}
                style={[styles.pill, form.salaryBreakup.retirementBenefit89ACountry === item && styles.pillActive]}
              >
                <Text style={[styles.pillText, form.salaryBreakup.retirementBenefit89ACountry === item && styles.pillTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <FieldRow label="Less : Allowances to the extent exempt u/s 10" value={form.salaryBreakup.exemptAllowance10} onChangeText={(value) => updateSalaryBreakup("exemptAllowance10", value)} keyboardType="numeric" helper="Ensure that it is included in salary income u/s 17(1)/17(2)/17(3)" />
          {false && (
          <>
          <FieldRow label="Basic + DA" value={form.salaryBreakup.basicDA} onChangeText={(value) => updateSalaryBreakup("basicDA", value)} keyboardType="numeric" />
          <FieldRow label="HRA" value={form.salaryBreakup.hra} onChangeText={(value) => updateSalaryBreakup("hra", value)} keyboardType="numeric" />
          <FieldRow label="Bonus / Commission" value={form.salaryBreakup.bonus} onChangeText={(value) => updateSalaryBreakup("bonus", value)} keyboardType="numeric" />
          <FieldRow label="Other Allowance" value={form.salaryBreakup.otherAllowance} onChangeText={(value) => updateSalaryBreakup("otherAllowance", value)} keyboardType="numeric" />
          <FieldRow label="Professional Tax u/s 16(iii)" value={form.salaryBreakup.pTax} onChangeText={(value) => updateSalaryBreakup("pTax", value)} keyboardType="numeric" />
          <FieldRow label="Standard Deduction u/s 16(ia)" value={form.salaryBreakup.standardDeduction16ia} onChangeText={(value) => updateSalaryBreakup("standardDeduction16ia", value)} keyboardType="numeric" />
          <FieldRow label="Entertainment Allowance u/s 16(ii)" value={form.salaryBreakup.entertainmentAllowance} onChangeText={(value) => updateSalaryBreakup("entertainmentAllowance", value)} keyboardType="numeric" />
          <FieldRow label="Net Salary" value={form.salaryBreakup.netSalary} onChangeText={(value) => updateSalaryBreakup("netSalary", value)} keyboardType="numeric" />
          <FieldRow label="Income Chargeable under Salaries" value={form.salaryBreakup.incomeChargeableSalaries} onChangeText={(value) => updateSalaryBreakup("incomeChargeableSalaries", value)} keyboardType="numeric" />
          </>
          )}
        </SectionCard>

        <SectionCard title="HOUSE PROPERTY" subtitle="One house property is supported for ITR-1.">
          <FieldRow label="Type of House Property" value={form.housePropertyDetails.propertyType} onChangeText={(value) => updateHousePropertyDetails("propertyType", value)} />
          <FieldRow label="Gross rent received / receivable / lettable value during the year" value={form.housePropertyDetails.grossRent} onChangeText={(value) => updateHousePropertyDetails("grossRent", value)} keyboardType="numeric" />
          <FieldRow label="Tax paid to local authorities" value={form.housePropertyDetails.municipalTaxes} onChangeText={(value) => updateHousePropertyDetails("municipalTaxes", value)} keyboardType="numeric" />
          <FieldRow label="Arrears / Unrealised Rent received during the year Less 30%" value={form.housePropertyDetails.arrearsUnrealisedRent} onChangeText={(value) => updateHousePropertyDetails("arrearsUnrealisedRent", value)} keyboardType="numeric" />
          <FieldRow label="30% of Annual Value (30% * iii)" value={form.housePropertyDetails.thirtyPercentDeduction} onChangeText={(value) => updateHousePropertyDetails("thirtyPercentDeduction", value)} keyboardType="numeric" />
          <FieldRow label="Interest payable on borrowed capital" value={form.housePropertyDetails.interestOnLoan} onChangeText={(value) => updateHousePropertyDetails("interestOnLoan", value)} keyboardType="numeric" />
          <FieldRow label="Income Chargeable under House Property" value={form.housePropertyDetails.incomeChargeableHouseProperty} onChangeText={(value) => updateHousePropertyDetails("incomeChargeableHouseProperty", value)} keyboardType="numeric" />
        </SectionCard>

        <SectionCard title="Exempt Income: For reporting purpose and Income on which no tax is payable" subtitle="Workbook rows 1 and 2, plus total exempt income and 7a details.">
          <FieldRow label="1. Nature of Income" value={form.otherSourcesDetails.exemptIncome1Nature} onChangeText={(value) => updateOtherSourcesDetails("exemptIncome1Nature", value)} />
          <FieldRow label="Description (If 'Any Other' selected)" value={form.otherSourcesDetails.exemptIncome1Description} onChangeText={(value) => updateOtherSourcesDetails("exemptIncome1Description", value)} />
          <FieldRow label="Amount" value={form.otherSourcesDetails.exemptIncome1Amount} onChangeText={(value) => updateOtherSourcesDetails("exemptIncome1Amount", value)} keyboardType="numeric" />
          <FieldRow label="2. Nature of Income" value={form.otherSourcesDetails.exemptIncome2Nature} onChangeText={(value) => updateOtherSourcesDetails("exemptIncome2Nature", value)} />
          <FieldRow label="Description (If 'Any Other' selected)" value={form.otherSourcesDetails.exemptIncome2Description} onChangeText={(value) => updateOtherSourcesDetails("exemptIncome2Description", value)} />
          <FieldRow label="Amount" value={form.otherSourcesDetails.exemptIncome2Amount} onChangeText={(value) => updateOtherSourcesDetails("exemptIncome2Amount", value)} keyboardType="numeric" />
          <FieldRow label="Total Exempt Income" value={form.deductions.totalExemptions} onChangeText={(value) => updateDeductions("totalExemptions", value)} keyboardType="numeric" />
          <FieldRow label="7a(i) Total sale consideration" value={form.otherSourcesDetails.ltcg112A_saleConsideration} onChangeText={(value) => updateOtherSourcesDetails("ltcg112A_saleConsideration", value)} keyboardType="numeric" />
          <FieldRow label="7a(ii) Total cost of acquisition" value={form.otherSourcesDetails.ltcg112A_costOfAcquisition} onChangeText={(value) => updateOtherSourcesDetails("ltcg112A_costOfAcquisition", value)} keyboardType="numeric" />
          <FieldRow label="7a(iii) Long term capital gains as per sec 112A" value={form.otherSourcesDetails.ltcg112A_amount} onChangeText={(value) => updateOtherSourcesDetails("ltcg112A_amount", value)} keyboardType="numeric" />
        </SectionCard>

        <SectionCard title="DEDUCTIONS" subtitle="Chapter VI-A amounts from the workbook.">
          <FieldRow label="80C - Life insurance premium, deferred annuity, contributions to provident fund, subscription to certain equity shares or debentures, etc." value={form.deductions.section80C} onChangeText={(value) => updateDeductions("section80C", value)} keyboardType="numeric" />
          <FieldRow label="80CCC - Payment in respect Pension Fund, etc." value={form.deductions.section80CCC} onChangeText={(value) => updateDeductions("section80CCC", value)} keyboardType="numeric" />
          <FieldRow label="80CCD(1) - Contribution to pension scheme of Central Government" value={form.deductions.section80CCD1} onChangeText={(value) => updateDeductions("section80CCD1", value)} keyboardType="numeric" />
          <FieldRow label="80CCD(1B) - Contribution to pension scheme of Central Government" value={form.deductions.section80CCD1B} onChangeText={(value) => updateDeductions("section80CCD1B", value)} keyboardType="numeric" />
          <FieldRow label="80D - Deduction in respect of Health Insurance premia..." value={form.deductions.section80D} onChangeText={(value) => updateDeductions("section80D", value)} keyboardType="numeric" />
          <FieldRow label="80DDB - Maintenance including medical treatment of a dependent who is a person with disability..." value={form.deductions.section80DDB} onChangeText={(value) => updateDeductions("section80DDB", value)} keyboardType="numeric" />
          <FieldRow label="80E - Interest on loan taken for higher education" value={form.deductions.section80E} onChangeText={(value) => updateDeductions("section80E", value)} keyboardType="numeric" />
          <FieldRow label="80EE - Interest on loan taken for residential house property" value={form.deductions.section80EE} onChangeText={(value) => updateDeductions("section80EE", value)} keyboardType="numeric" />
          <FieldRow label="80EEA - Deduction in respect of interest on loan taken for certain house property" value={form.deductions.section80EEA} onChangeText={(value) => updateDeductions("section80EEA", value)} keyboardType="numeric" />
          <FieldRow label="80EEB - Deduction in respect of purchase of electric vehicle" value={form.deductions.section80EEB} onChangeText={(value) => updateDeductions("section80EEB", value)} keyboardType="numeric" />
          <FieldRow label="80GGA - Donations for scientific research or rural development" value={form.deductions.section80GGA} onChangeText={(value) => updateDeductions("section80GGA", value)} keyboardType="numeric" />
          <FieldRow label="80GGC - Contribution to Political party." value={form.deductions.section80GGC} onChangeText={(value) => updateDeductions("section80GGC", value)} keyboardType="numeric" />
          <FieldRow label="80GG - Rent paid (Please submit form 10BA to claim deduction)" value={form.deductions.section80GG} onChangeText={(value) => updateDeductions("section80GG", value)} keyboardType="numeric" />
          <FieldRow label="80TTA - Interest from savings bank account" value={form.deductions.section80TTA} onChangeText={(value) => updateDeductions("section80TTA", value)} keyboardType="numeric" />
          <FieldRow label="80TTB - Interest from deposits by senior citizen" value={form.deductions.section80TTB} onChangeText={(value) => updateDeductions("section80TTB", value)} keyboardType="numeric" />
          <FieldRow label="80CCH - Contribution to Agniveer Corpus Fund" value={form.deductions.section80CCH} onChangeText={(value) => updateDeductions("section80CCH", value)} keyboardType="numeric" />
          <FieldRow label="80U - In case of a person with disability" value={form.deductions.section80U} onChangeText={(value) => updateDeductions("section80U", value)} keyboardType="numeric" />
          <FieldRow label="Any other deduction" value={form.deductions.otherDeductions} onChangeText={(value) => updateDeductions("otherDeductions", value)} keyboardType="numeric" />
          <FieldRow label="Total Deductions (Total of 5a to 5t)" value={form.deductions.totalDeductions} onChangeText={(value) => updateDeductions("totalDeductions", value)} keyboardType="numeric" />
          <FieldRow label="Total Exempt Income" value={form.deductions.totalExemptions} onChangeText={(value) => updateDeductions("totalExemptions", value)} keyboardType="numeric" />
        </SectionCard>

        {false && (
          <>
        <SectionCard title="TAXES PAID / TDS" subtitle="TDS and advance tax values.">
          <FieldRow label="TDS Salary" value={form.taxesPaid.tdsSalary} onChangeText={(value) => updateTaxesPaid("tdsSalary", value)} keyboardType="numeric" />
          <FieldRow label="TDS Non Salary" value={form.taxesPaid.tdsNonSalary} onChangeText={(value) => updateTaxesPaid("tdsNonSalary", value)} keyboardType="numeric" />
          <FieldRow label="TDS Other" value={form.taxesPaid.tdsOther} onChangeText={(value) => updateTaxesPaid("tdsOther", value)} keyboardType="numeric" />
          <FieldRow label="Advance Tax" value={form.taxesPaid.advanceTax} onChangeText={(value) => updateTaxesPaid("advanceTax", value)} keyboardType="numeric" />
          <FieldRow label="TCS" value={form.taxesPaid.tcs} onChangeText={(value) => updateTaxesPaid("tcs", value)} keyboardType="numeric" />
          <FieldRow label="Self Assessment Tax" value={form.taxesPaid.selfAssessmentTax} onChangeText={(value) => updateTaxesPaid("selfAssessmentTax", value)} keyboardType="numeric" />
          <FieldRow label="Total Paid" value={String(summary.totalPaid)} readOnly />
        </SectionCard>

        <SectionCard title="TAX PAYABLE / VERIFICATION" subtitle="Portal-style declaration and sign-off details.">
          <FieldRow label="Verification Place" value={form.verification.place} onChangeText={(value) => updateVerification("place", value)} />
          <FieldRow label="Verification Date" value={form.verification.date} onChangeText={(value) => updateVerification("date", value)} placeholder="DD/MM/YYYY" />
          <FieldRow label="Verified By Name" value={form.verification.name} onChangeText={(value) => updateVerification("name", value)} />
          <FieldRow label="Capacity" value={form.verification.capacity} onChangeText={(value) => updateVerification("capacity", value)} placeholder="Self / Representative" />
        </SectionCard>

        <SectionCard title="FINAL SUMMARY" subtitle="A preview of the filled JSON data.">
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax on Total Income</Text>
              <Text style={styles.summaryValue}>₹ {summary.taxOnTotalIncome.toLocaleString("en-IN")}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Net Payable</Text>
              <Text style={[styles.summaryValue, styles.payableColor]}>
                ₹ {summary.net.toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Refund</Text>
              <Text style={[styles.summaryValue, styles.refundColor]}>
                ₹ {summary.refund.toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
        </SectionCard>
          </>
        )}

        <SectionCard title="TOTAL INCOME / TAX PAYABLE" subtitle="Auto-calculated return totals, matching the workbook summary section.">
          <FieldRow label="Total Income (4-6)" value={String(summary.totalIncome)} readOnly />
          <FieldRow label="Tax Payable on Total Income" value={String(summary.taxPayableOnTotalIncome)} readOnly />
          <FieldRow label="Rebate u/s 87A" value={String(summary.rebate)} readOnly />
          <FieldRow label="Tax payable after Rebate" value={String(summary.taxAfterRebate)} readOnly />
          <FieldRow label="Health and Education Cess @4% on (10)" value={String(summary.cess)} readOnly />
          <FieldRow label="Total Tax and Cess" value={String(summary.taxOnTotalIncome)} readOnly />
          <FieldRow label="Relief u/s 89 (Please ensure to submit Form 10E to claim this relief)" value={String(summary.relief89)} readOnly />
          <FieldRow label="Balance Tax after Relief (12-13)" value={String(summary.net)} readOnly />
          <FieldRow label="Interest u/s 234 A" value={String(summary.interest234A)} readOnly />
          <FieldRow label="Interest u/s 234 B" value={String(summary.interest234B)} readOnly />
          <FieldRow label="Interest u/s 234 C" value={String(summary.interest234C)} readOnly />
          <FieldRow label="Fee u/s 234F" value={String(summary.totalInterestAndFee)} readOnly />
          <FieldRow label="Total Interest, Fee Payable (15a + 15b + 15c + 15d)" value={String(summary.totalInterestAndFee)} readOnly />
          <FieldRow label="Total Tax, Fee and Interest (14 + 16)" value={String(summary.totalTaxFeeInterest)} readOnly />
        </SectionCard>

        <View style={styles.actionsRow}>
          <Pressable style={styles.secondaryButton} onPress={handleReset}>
            <Text style={styles.secondaryButtonText}>Reset Draft</Text>
          </Pressable>
        </View>

        <ITRSaveButton title="Download JSON" onPress={handleExport} />
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: itrColors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 112,
    gap: 14,
  },
  scrollView: {
    flex: 1,
  },
  headerYear: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  importBanner: {
    alignItems: "center",
    backgroundColor: "#F8FBFF",
    borderColor: "#CFE0FF",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  importBannerLeft: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 10,
    paddingRight: 10,
  },
  importBannerTitle: {
    color: "#1E293B",
    fontSize: 13,
    fontWeight: "800",
  },
  importBannerSub: {
    color: "#64748B",
    fontSize: 11.5,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderColor: "#E2E8F0",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    ...itrShadows.card,
  },
  sectionTitle: {
    color: "#1E293B",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  sectionBody: {
    gap: 12,
    marginTop: 14,
  },
  fieldWrap: {
    gap: 6,
    width: "100%",
  },
  fieldLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  fieldHelper: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
  },
  questionHeading: {
    color: "#0F172A",
    fontSize: 12.5,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 4,
  },
  helperText: {
    color: "#64748B",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  subSectionLabel: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#CBD5E1",
    borderRadius: 12,
    borderWidth: 1,
    color: "#0F172A",
    fontSize: 14,
    height: 44,
    position: "relative",
    paddingHorizontal: 12,
    width: "100%",
    zIndex: 1,
  },
  readOnlyInput: {
    backgroundColor: "#F8FAFC",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  pill: {
    backgroundColor: "#F8FAFC",
    borderColor: "#D7E0ED",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pillActive: {
    backgroundColor: "#EEF4FF",
    borderColor: itrColors.primary,
  },
  pillText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "700",
  },
  pillTextActive: {
    color: itrColors.primary,
  },
  summaryBox: {
    backgroundColor: "#F8FBFF",
    borderColor: "#E2E8F0",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },
  summaryValue: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
  },
  payableColor: {
    color: "#EF4444",
  },
  refundColor: {
    color: "#059669",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#CBD5E1",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "800",
  },
});
