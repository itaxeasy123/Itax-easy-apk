import axios from "axios";
import { Platform } from "react-native";

import type { Form16ImportData } from "../../../store/itrStore";

type Form16NormalizedResponse = Omit<
  Form16ImportData,
  "fileName" | "source" | "rawText" | "importedAt"
> & {
  confidence: "high" | "medium" | "low";
  warnings: string[];
  rawText: string;
  housePropertyIncome?: number;
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
  section80DD?: number;
  section80EE?: number;
  section80EEA?: number;
  section80EEB?: number;
  section80GGA?: number;
  section80GGC?: number;
  section80TTA?: number;
  section80TTB?: number;
  section80U?: number;
  otherDeductions?: number;
};

const OCR_API_URL = "https://ocr.itaxeasy.com/api/parse_form16";

function normalizeText(text: string) {
  return text
    .replace(/\u0000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readFirstLine(value: unknown) {
  const text = readText(value);
  if (!text) return undefined;
  return text.split(/\r?\n/)[0]?.trim() || undefined;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function getRecord(source: Record<string, unknown> | undefined, key: string) {
  return asRecord(source?.[key]);
}

function getNestedNumber(
  source: Record<string, unknown> | undefined,
  key: string,
  nestedKey: string,
) {
  return toNumber(asRecord(source?.[key])?.[nestedKey]);
}

function getArrayItem(value: unknown, index = 0) {
  if (Array.isArray(value)) {
    return value[index];
  }

  return value;
}

function readTextAt(value: unknown, index = 0) {
  return readText(getArrayItem(value, index));
}

function toNumberAt(value: unknown, index = 0) {
  return toNumber(getArrayItem(value, index));
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    const text = readText(value);
    if (text) return text;
  }

  return undefined;
}

function splitAddressLines(value: string | undefined) {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const number = toNumber(value);
    if (typeof number === "number") return number;
  }

  return undefined;
}

function getServerErrorMessage(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const data = error.response?.data as
    | { detail?: unknown; message?: unknown; error?: unknown }
    | string
    | undefined;

  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const detail = readText(data.detail);
  if (detail) return detail;

  const message = readText(data.message);
  if (message) return message;

  const fallbackError = readText(data.error);
  if (fallbackError) return fallbackError;

  return null;
}

function extractData(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};

  const topLevel = payload as {
    data?: unknown;
    result?: unknown;
    parsed?: unknown;
    parsedData?: unknown;
    extracted?: unknown;
    form16?: unknown;
  };
  if (topLevel.data && typeof topLevel.data === "object") {
    return topLevel.data as Record<string, unknown>;
  }

  if (topLevel.result && typeof topLevel.result === "object") {
    return topLevel.result as Record<string, unknown>;
  }

  if (topLevel.parsed && typeof topLevel.parsed === "object") {
    return topLevel.parsed as Record<string, unknown>;
  }

  if (topLevel.parsedData && typeof topLevel.parsedData === "object") {
    return topLevel.parsedData as Record<string, unknown>;
  }

  if (topLevel.extracted && typeof topLevel.extracted === "object") {
    return topLevel.extracted as Record<string, unknown>;
  }

  if (topLevel.form16 && typeof topLevel.form16 === "object") {
    return topLevel.form16 as Record<string, unknown>;
  }

  return payload as Record<string, unknown>;
}

function normalizeApiResponse(payload: unknown, fileName: string): Form16NormalizedResponse {
  const data = extractData(payload);
  const partA = asRecord(data.part_a) ?? asRecord(data.partA) ?? asRecord(data.form16_part_a);
  const partB = asRecord(data.part_b) ?? asRecord(data.partB) ?? asRecord(data.form16_part_b);
  const salaryDetails =
    getRecord(partB, "details_of_salary_paid_and_any_other_income_and_tax_deducted") ??
    asRecord(data.details_of_salary_paid_and_any_other_income_and_tax_deducted);
  const grossSalaryBlock = getRecord(salaryDetails, "gross_salary");
  const exemptionsBlock = getRecord(
    salaryDetails,
    "less_allowances_to_the_extent_exempt_under_section_10",
  );
  const section16Block = getRecord(salaryDetails, "less_deductions_under_section_16");
  const chapterVIABlock = getRecord(salaryDetails, "deductions_under_chapter_vi_a");
  const otherIncomeBlock = getRecord(
    salaryDetails,
    "add_any_other_income_reported_by_the_employee_under_as_per_section_192_2b",
  );
  const tdsSummary = getRecord(partA, "summary_of_amount_paid_or_credited_and_tax_deducted");
  const tdsSummaryTotal = getRecord(tdsSummary, "total");
  const challanBlock = getRecord(partA, "section_2_tax_deducted_and_deposited_through_challan");

  const rawText = normalizeText(
    firstText(
      data.rawText,
      data.raw_text,
      data.text,
      data.extractedText,
      data.extracted_text,
      data.form16Text,
      data.form16_text,
      partA?.rawText,
      partB?.rawText,
    ) ?? "",
  );

  const employeeName = firstText(
    data.employeeName,
    data.employee_name,
    partA?.name_of_employee,
    partA?.name_of_employee_of_the_employee,
    readFirstLine(partA?.name_and_address_of_the_employee_or_specified_senior_citizen),
  );

  const employeePan =
    firstText(
      data.employeePan,
      data.employee_pan,
      data.pan,
      data.employee_pAN,
      data.panNumber,
      data.pan_number,
      partA?.employee_pan,
      partA?.pan_of_employee,
      partA?.pan_of_the_employee_or_specified_senior_citizen,
    );

  const employeeEmail = firstText(
    data.employeeEmail,
    data.employee_email,
    partA?.email,
    rawText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0],
  );

  const employeePhone = firstText(
    data.employeePhone,
    data.employee_phone,
    data.mobile,
    data.phone,
    rawText.match(/\b(?:\+91[-\s]?)?[6-9]\d{9}\b/)?.[0],
  );

  const employeeAddress = firstText(
    data.employeeAddress,
    data.employee_address,
    partA?.address_of_the_employee,
    partA?.address_of_employee,
    partA?.address_of_the_employee_or_specified_senior_citizen,
    partA?.name_and_address_of_the_employee_or_specified_senior_citizen,
  );
  const normalizedEmployeeAddress =
    employeeAddress ??
    splitAddressLines(rawText)
      .slice(1)
      .join(", ");

  const employerPan = firstText(
    data.employerPan,
    data.employer_pan,
    partA?.pan_of_the_deductor,
    partA?.employer_pan,
  );

  const tan = firstText(data.tan, data.tan_number, partA?.tan_of_the_deductor, partA?.tan);

  const assessmentYear = firstText(
    data.assessmentYear,
    data.assessment_year,
    data.ay,
    data.financialYear,
    data.financial_year,
    partA?.assesment_year,
    partA?.assessment_year,
  );

  const employerName = firstText(
    data.employerName,
    data.employer_name,
    data.employer,
    data.companyName,
    data.company_name,
    partA?.name_and_address_of_the_employer_or_specified_bank,
  );

  const grossSalary =
    firstNumber(
      data.grossSalary,
      data.gross_salary,
      data.total_salary,
      data.salary_gross,
      data.salary,
      data.gross_income,
      grossSalaryBlock?.total,
    ) ?? 0;

  const salaryChargeable =
    firstNumber(
      data.salaryChargeable,
      data.salary_chargeable,
      data.income_chargeable,
      data.chargeable_salary,
      data.income_from_salary,
      toNumberAt(salaryDetails?.income_chargeable_under_the_head_salaries, 1),
      toNumberAt(salaryDetails?.total_amount_of_salary_received_from_current_employer_1d_2h, 1),
    ) ?? 0;

  const grossTotalIncome =
    firstNumber(
      data.grossTotalIncome,
      data.gross_total_income,
      toNumberAt(salaryDetails?.gross_total_income, 1),
      toNumberAt(salaryDetails?.gross_total_income_before_deductions, 1),
    ) ?? 0;

  const housePropertyIncome =
    firstNumber(
      data.housePropertyIncome,
      data.house_property_income,
      data.income_from_house_property,
      toNumberAt(
        otherIncomeBlock?.income_or_admissible_loss_from_house_property_reported_by_employee_offered_for_tds,
        0,
      ),
    ) ?? 0;

  const standardDeduction =
    firstNumber(
      data.standardDeduction,
      data.standard_deduction,
      data.deduction_standard,
      toNumberAt(section16Block?.standard_deduction_under_section_16_ia, 0),
    ) ?? 0;

  const otherIncome =
    firstNumber(
      data.otherIncome,
      data.other_income,
      data.income_from_other_sources,
      toNumberAt(otherIncomeBlock?.income_under_the_head_other_sources_offered_for_tds, 0),
      toNumberAt(salaryDetails?.total_amount_of_other_income_reported_by_the_employee, 1),
    ) ?? 0;

  const basicDA =
    firstNumber(
      data.basicDA,
      data.basic_da,
      data.basicSalary,
      data.basic_salary,
      toNumberAt(grossSalaryBlock?.salary_as_per_provisions_contained_in_section_17_1, 0),
    ) ?? 0;

  const hra =
    firstNumber(
      data.hra,
      data.houseRentAllowance,
      data.house_rent_allowance,
      toNumberAt(exemptionsBlock?.house_rent_allowance_under_section_10_13A, 0),
    ) ?? 0;

  const bonus =
    firstNumber(
      data.bonus,
      data.bonusCommission,
      data.bonus_commission,
      toNumberAt(grossSalaryBlock?.profits_in_lieu_of_salary_under_section_17_3, 0),
    ) ?? 0;

  const entertainmentAllowance =
    firstNumber(
      data.entertainmentAllowance,
      data.entertainment_allowance,
      toNumberAt(section16Block?.entertainment_allowance_under_section_16_ii, 0),
    ) ?? 0;

  const exemptAllowance10 =
    firstNumber(
      data.exemptAllowance10,
      data.exempt_allowance10,
      toNumberAt(exemptionsBlock?.total_amount_of_exemption_claimed_under_section_10, 0),
    ) ?? 0;

  const otherAllowance =
    firstNumber(
      data.otherAllowance,
      data.other_allowance,
    ) ?? 0;

  const pTax =
    firstNumber(
      data.pTax,
      data.p_tax,
      data.professionalTax16iii,
      data.professional_tax16iii,
      toNumberAt(section16Block?.tax_on_employment_under_section_16_iii, 0),
    ) ?? 0;

  const professionalTax16iii = pTax;

  const section80C =
    firstNumber(
      data.section80C,
      data.section_80c,
      data.deduction80C,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_life_insurance_premia_pf_etc_under_section_80c",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80D =
    firstNumber(
      data.section80D,
      data.section_80d,
      data.deduction80D,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_health_insurance_premia_under_section_80d",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80DD =
    firstNumber(
      data.section80DD,
      data.section_80dd,
      data.deduction80DD,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_medical_treatment_of_a_handicapped_dependent_relative_under_section_80dd",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80EE =
    firstNumber(
      data.section80EE,
      data.section_80ee,
      data.deduction80EE,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_interest_on_loan_taken_for_residential_house_property_under_section_80ee",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80EEA =
    firstNumber(
      data.section80EEA,
      data.section_80eea,
      data.deduction80EEA,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_interest_on_loan_taken_for_certain_house_property_under_section_80eea",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80EEB =
    firstNumber(
      data.section80EEB,
      data.section_80eeb,
      data.deduction80EEB,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_interest_on_loan_taken_for_electric_vehicle_under_section_80eeb",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80GGA =
    firstNumber(
      data.section80GGA,
      data.section_80gga,
      data.deduction80GGA,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_donations_for_scientific_research_or_rural_development_under_section_80gga",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80GGC =
    firstNumber(
      data.section80GGC,
      data.section_80ggc,
      data.deduction80GGC,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_contribution_by_any_person_to_political_parties_under_section_80ggc",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80TTA =
    firstNumber(
      data.section80TTA,
      data.section_80tta,
      data.deduction80TTA,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_interest_on_deposits_in_savings_account_under_section_80tta",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80TTB =
    firstNumber(
      data.section80TTB,
      data.section_80ttb,
      data.deduction80TTB,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_respect_of_interest_on_deposits_in_case_of_senior_citizens_under_section_80ttb",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80U =
    firstNumber(
      data.section80U,
      data.section_80u,
      data.deduction80U,
      getNestedNumber(
        chapterVIABlock,
        "deduction_in_case_of_a_person_with_disability_under_section_80u",
        "deductible_amount",
      ),
    ) ?? 0;

  const section80CCD1B =
    firstNumber(
      data.section80CCD1B,
      data.section_80ccd1b,
      data.deduction80CCD1B,
      getNestedNumber(
        chapterVIABlock,
        "deductions_in_respect_of_amount_paid_or_deposited_to_notified_pension_scheme_under_section_80ccd_1b",
        "deductible_amount",
      ),
    ) ?? 0;

  const chapterVIDeductionTotal =
    firstNumber(
      data.chapterVIDeductionTotal,
      data.chapter_vi_a_total,
      salaryDetails?.aggregate_of_deductible_amount_under_chapter_vi_A,
      getNestedNumber(
        chapterVIABlock,
        "total_amount_deductible_under_any_other_provisions_of_chapter_vi_a",
        "deductible_amount",
      ),
    ) ?? 0;

  const taxableIncome =
    firstNumber(
      data.taxableIncome,
      data.taxable_income,
      salaryDetails?.total_taxable_income,
    ) ?? 0;

  const taxOnTotalIncome =
    firstNumber(
      data.taxOnTotalIncome,
      data.tax_on_total_income,
      salaryDetails?.tax_on_total_income,
    ) ?? 0;

  const rebateUnderSection87A =
    firstNumber(
      data.rebateUnderSection87A,
      data.rebate_under_section_87a,
      salaryDetails?.rebate_under_section_87a_if_applicable,
    ) ?? 0;

  const surcharge =
    firstNumber(
      data.surcharge,
      salaryDetails?.surcharge_wherever_applicable,
    ) ?? 0;

  const healthAndEducationCess =
    firstNumber(
      data.healthAndEducationCess,
      data.health_and_education_cess,
      salaryDetails?.health_and_education_cess,
    ) ?? 0;

  const taxPayable =
    firstNumber(
      data.taxPayable,
      data.tax_payable,
      salaryDetails?.tax_payable,
    ) ?? 0;

  const netTaxPayable =
    firstNumber(
      data.netTaxPayable,
      data.net_tax_payable,
      salaryDetails?.net_tax_payable,
    ) ?? 0;

  const totalAmountPaid =
    firstNumber(
      data.totalAmountPaid,
      data.total_amount_paid,
      tdsSummaryTotal?.total_amt_paid_or_credited,
    ) ?? 0;

  const totalAmountCredited =
    firstNumber(
      data.totalAmountCredited,
      data.total_amount_credited,
      tdsSummaryTotal?.total_amt_paid_or_credited,
    ) ?? 0;

  const totalTaxDeducted =
    firstNumber(
      data.totalTaxDeducted,
      data.total_tax_deducted,
      tdsSummaryTotal?.total_amt_of_tax_deducted,
      tdsSummaryTotal?.total_amt_of_tax_deducted_at_source,
      tdsSummaryTotal?.total_amt_of_tax_deducted_at_source_from_salary,
    ) ?? 0;

  const tdsSalary = totalTaxDeducted;

  const totalTaxDeposited =
    firstNumber(
      data.totalTaxDeposited,
      data.total_tax_deposited,
      tdsSummaryTotal?.total_amt_of_tax_deposited_or_remitted,
    ) ?? 0;

  const taxRegime = readText(data.taxRegime) === "old" || readText(data.taxRegime) === "new"
    ? (readText(data.taxRegime) as "old" | "new")
    : readText(salaryDetails?.whether_opting_for_taxation_us_115bac) === "Yes"
      ? "new"
      : readText(salaryDetails?.whether_opting_for_taxation_us_115bac) === "No"
        ? "old"
        : undefined;

  const warningsRaw = Array.isArray(data.warnings) ? data.warnings : [];
  const warnings = warningsRaw
    .map((warning) => readText(warning))
    .filter(Boolean) as string[];

  const detectedCount = [
    employeeName,
    employeePan,
    employeeEmail,
    employeePhone,
    employerPan,
    tan,
    assessmentYear,
    employerName,
    grossSalary > 0 ? grossSalary : undefined,
    salaryChargeable > 0 ? salaryChargeable : undefined,
    grossTotalIncome > 0 ? grossTotalIncome : undefined,
    taxableIncome > 0 ? taxableIncome : undefined,
    taxOnTotalIncome > 0 ? taxOnTotalIncome : undefined,
    totalTaxDeducted > 0 ? totalTaxDeducted : undefined,
    netTaxPayable > 0 ? netTaxPayable : undefined,
    section80C > 0 ? section80C : undefined,
    section80D > 0 ? section80D : undefined,
    section80CCD1B > 0 ? section80CCD1B : undefined,
  ].filter(Boolean).length;

  if (!rawText && detectedCount === 0) {
    warnings.push(
      "The backend did not return parseable Form 16 data. Please verify the parse_form16 API response mapping.",
    );
  }

  return {
    employeeName,
    employeePan,
    employeeAddress: normalizedEmployeeAddress,
    employerPan,
    tan,
    assessmentYear,
    employerName,
    grossSalary,
    grossTotalIncome,
    salaryChargeable,
    housePropertyIncome,
    standardDeduction,
    otherIncome,
    basicDA,
    hra,
    bonus,
    entertainmentAllowance,
    exemptAllowance10,
    otherAllowance,
    pTax,
    professionalTax16iii,
    taxableIncome,
    taxOnTotalIncome,
    rebateUnderSection87A,
    surcharge,
    healthAndEducationCess,
    taxPayable,
    netTaxPayable,
    totalAmountPaid,
    totalAmountCredited,
    totalTaxDeducted,
    totalTaxDeposited,
    section80C,
    section80D,
    section80CCD1B,
    section80DD,
    section80EE,
    section80EEA,
    section80EEB,
    section80GGA,
    section80GGC,
    section80TTA,
    section80TTB,
    section80U,
    otherDeductions: chapterVIDeductionTotal,
    chapterVIDeductionTotal,
    tdsSalary,
    taxRegime,
    confidence: detectedCount >= 5 ? "high" : detectedCount >= 3 ? "medium" : "low",
    warnings,
    rawText,
  };
}

async function postForm16Pdf(asset: { uri: string; name: string; mimeType?: string | null }) {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    formData.append("file", blob, asset.name);
  } else {
    formData.append("file", {
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? "application/pdf",
    } as any);
  }

  const response = await axios.post(OCR_API_URL, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      accept: "application/json",
    },
  }).catch((error) => {
    const serverMessage = getServerErrorMessage(error);
    if (serverMessage) {
      throw new Error(serverMessage);
    }

    throw error;
  });

  return response.data;
}

export async function extractForm16FromAsset(asset: {
  uri: string;
  name?: string | null;
  mimeType?: string | null;
}) {
  const fileName = asset.name ?? "Form16.pdf";
  const isPdf =
    asset.mimeType?.includes("pdf") || fileName.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error(
      "This Form 16 flow accepts official PDF only. Please upload the employer-issued Form 16 PDF.",
    );
  }

  const response = await postForm16Pdf({
    uri: asset.uri,
    name: fileName,
    mimeType: asset.mimeType ?? "application/pdf",
  });

  const normalized = normalizeApiResponse(response, fileName);

  return {
    fileName,
    source: "pdf" as const,
    importedAt: new Date().toISOString(),
    ...normalized,
  };
}
