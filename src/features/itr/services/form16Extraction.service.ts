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
  const rawText = normalizeText(
    readText(data.rawText) ??
      readText(data.raw_text) ??
      readText(data.text) ??
      readText(data.extractedText) ??
      readText(data.extracted_text) ??
      readText(data.form16Text) ??
      readText(data.form16_text) ??
      "",
  );

  const employeePan =
    readText(data.employeePan) ??
    readText(data.employee_pan) ??
    readText(data.pan) ??
    readText(data.employee_pAN) ??
    readText(data.panNumber) ??
    readText(data.pan_number);

  const assessmentYear =
    readText(data.assessmentYear) ??
    readText(data.assessment_year) ??
    readText(data.ay) ??
    readText(data.financialYear) ??
    readText(data.financial_year);

  const employerName =
    readText(data.employerName) ??
    readText(data.employer_name) ??
    readText(data.employer) ??
    readText(data.companyName) ??
    readText(data.company_name);

  const grossSalary =
    toNumber(data.grossSalary) ??
    toNumber(data.gross_salary) ??
    toNumber(data.total_salary) ??
    toNumber(data.salary_gross) ??
    toNumber(data.salary) ??
    toNumber(data.gross_income) ??
    0;

  const salaryChargeable =
    toNumber(data.salaryChargeable) ??
    toNumber(data.salary_chargeable) ??
    toNumber(data.income_chargeable) ??
    toNumber(data.chargeable_salary) ??
    toNumber(data.income_from_salary) ??
    0;

  const housePropertyIncome =
    toNumber(data.housePropertyIncome) ??
    toNumber(data.house_property_income) ??
    toNumber(data.income_from_house_property) ??
    0;

  const standardDeduction =
    toNumber(data.standardDeduction) ??
    toNumber(data.standard_deduction) ??
    toNumber(data.deduction_standard) ??
    0;

  const otherIncome =
    toNumber(data.otherIncome) ??
    toNumber(data.other_income) ??
    toNumber(data.income_from_other_sources) ??
    0;

  const section80C =
    toNumber(data.section80C) ?? toNumber(data.section_80c) ?? toNumber(data.deduction80C) ?? 0;

  const section80D =
    toNumber(data.section80D) ?? toNumber(data.section_80d) ?? toNumber(data.deduction80D) ?? 0;

  const section80CCD1B =
    toNumber(data.section80CCD1B) ??
    toNumber(data.section_80ccd1b) ??
    toNumber(data.deduction80CCD1B) ??
    0;

  const tdsSalary =
    toNumber(data.tdsSalary) ??
    toNumber(data.tds_salary) ??
    toNumber(data.salary_tds) ??
    toNumber(data.tds) ??
    0;

  const warningsRaw = Array.isArray(data.warnings) ? data.warnings : [];
  const warnings = warningsRaw
    .map((warning) => readText(warning))
    .filter(Boolean) as string[];

  const detectedCount = [
    employeePan,
    assessmentYear,
    employerName,
    grossSalary > 0 ? grossSalary : undefined,
    salaryChargeable > 0 ? salaryChargeable : undefined,
    tdsSalary > 0 ? tdsSalary : undefined,
  ].filter(Boolean).length;

  if (!rawText) {
    warnings.push(
      "The backend did not return raw text. Please verify the parse_form16 API response mapping.",
    );
  }

  return {
    employeePan,
    assessmentYear,
    employerName,
    grossSalary,
    salaryChargeable,
    housePropertyIncome,
    standardDeduction,
    otherIncome,
    section80C,
    section80D,
    section80CCD1B,
    tdsSalary,
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
    rawText: normalized.rawText,
    importedAt: new Date().toISOString(),
    ...normalized,
  };
}
