import { TAX_CONFIG } from "../constants/taxSlabs";
import { TaxInput, TaxBreakdown } from "../models/taxCalculator.types";

// ✅ slab calculation
const calculateSlabTax = (income: number, slabs: any[]) => {
  let tax = 0;
  let prev = 0;

  for (const slab of slabs) {
    if (income > prev) {
      const taxable = Math.min(income, slab.upto) - prev;
      tax += taxable * slab.rate;
      prev = slab.upto;
    } else break;
  }

  return tax;
};

// ✅ surcharge
const calculateSurcharge = (tax: number, income: number) => {
  const slab = TAX_CONFIG.surcharge.find((s) => income <= s.upto);
  return tax * (slab?.rate || 0);
};

export const calculateIncomeTax = (input: TaxInput): TaxBreakdown => {
  const {
    salary,
    otherIncome,
    deductions,
    exemptions,
    tdsSalary,
    tdsNonSalary,
    tdsOther,
    advanceTax,
    regime,
  } = input;

  const grossIncome = salary + otherIncome;

  // ✅ taxable income
  const taxableIncome =
    regime === "old"
      ? Math.max(grossIncome - (deductions + (exemptions || 0)), 0)
      : Math.max(grossIncome, 0);

  const slabs = TAX_CONFIG[regime];

  // ✅ slab tax
  let tax = calculateSlabTax(taxableIncome, slabs);

  // =========================
  // ✅ REBATE 87A (CORRECT)
  // =========================
  let rebate = 0;

  const rebateLimit = regime === "old" ? 500000 : 700000;

  if (taxableIncome <= rebateLimit) {
    rebate = tax;
    tax = 0;
  }

  // =========================
  // ✅ SURCHARGE
  // =========================
  const surcharge = calculateSurcharge(tax, taxableIncome);

  // =========================
  // ✅ CESS (4%)
  // =========================
  const cess = (tax + surcharge) * 0.04;

  const totalTax = tax + surcharge + cess;

  // =========================
  // ✅ PAID
  // =========================
  const totalPaid = (tdsSalary || 0) + (tdsNonSalary || 0) + (tdsOther || 0) + (advanceTax || 0);

  const net = totalTax - totalPaid;

  return {
    grossIncome,
    taxableIncome,
    tax,
    rebate,
    surcharge,
    cess,
    totalTax,
    totalPaid,
    netPayable: net > 0 ? net : 0,
    refund: net < 0 ? Math.abs(net) : 0,
  };
};