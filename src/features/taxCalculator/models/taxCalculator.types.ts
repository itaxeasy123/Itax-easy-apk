export type TaxRegime = "old" | "new";

export interface TaxInput {
  salary: number;
  otherIncome: number;
  deductions: number;
  exemptions?: number;
  tdsSalary?: number;
  tdsNonSalary?: number;
  tdsOther?: number;
  advanceTax: number;
  regime: TaxRegime;
}

export interface TaxBreakdown {
  grossIncome: number;
  taxableIncome: number;

  tax: number;
  rebate: number;
  surcharge: number;
  cess: number;

  totalTax: number;

  totalPaid: number;
  netPayable: number;
  refund: number;
}