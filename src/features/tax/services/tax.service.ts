import { TaxInput, TaxResult } from "../models/tax.types";

// ===============================
// 🧮 NEW REGIME SLABS (FY 2023-24+)
// ===============================
const calculateNewRegimeTax = (income: number): number => {
  if (income <= 300000) return 0;
  if (income <= 600000) return (income - 300000) * 0.05;
  if (income <= 900000) return 15000 + (income - 600000) * 0.1;
  if (income <= 1200000) return 45000 + (income - 900000) * 0.15;
  if (income <= 1500000) return 90000 + (income - 1200000) * 0.2;

  return 150000 + (income - 1500000) * 0.3;
};

// ===============================
// 🧮 OLD REGIME SLABS
// ===============================
const calculateOldRegimeTax = (
  income: number,
  age: string
): number => {
  let exemption = 250000;

  if (age === "senior") exemption = 300000;
  if (age === "super_senior") exemption = 500000;

  if (income <= exemption) return 0;

  if (income <= 500000)
    return (income - exemption) * 0.05;

  if (income <= 1000000)
    return 12500 + (income - 500000) * 0.2;

  return 112500 + (income - 1000000) * 0.3;
};

// ===============================
// 💰 CAPITAL GAIN ENGINE
// ===============================
const calculateCapitalGainTax = (stcg: number, ltcg: number) => {
  // STCG 15%
  const stcgTax = stcg * 0.15;

  // LTCG 10% after ₹1L exemption
  const taxableLTCG = Math.max(0, ltcg - 100000);
  const ltcgTax = taxableLTCG * 0.1;

  return {
    stcgTax,
    ltcgTax,
    totalCapitalGainTax: stcgTax + ltcgTax,
  };
};

// ===============================
// 🎯 MAIN TAX ENGINE
// ===============================
export const calculateAdvanceTax = (
  data: TaxInput
): TaxResult => {
  try {
    // ===============================
    // TOTAL INCOME
    // ===============================
    const totalIncome =
      data.salary +
      data.business +
      data.otherIncome +
      data.stcg +
      data.ltcg;

    // ===============================
    // NORMAL INCOME (SLAB ONLY)
    // ===============================
    const normalIncome =
      data.salary +
      data.business +
      data.otherIncome;

    const taxableNormalIncome = Math.max(
      0,
      normalIncome - data.deductions
    );

    // ===============================
    // SLAB TAX
    // ===============================
    let newTax = calculateNewRegimeTax(
      taxableNormalIncome
    );

    let oldTax = calculateOldRegimeTax(
      taxableNormalIncome,
      data.age
    );

    // ===============================
    // CAPITAL GAIN TAX
    // ===============================
    const { totalCapitalGainTax } = calculateCapitalGainTax(
      data.stcg,
      data.ltcg
    );

    // ===============================
    // TOTAL TAX (BOTH REGIME)
    // ===============================
    newTax += totalCapitalGainTax;
    oldTax += totalCapitalGainTax;

    // ===============================
    // REBATE 87A
    // ===============================
    if (taxableNormalIncome <= 700000) newTax = 0;
    if (taxableNormalIncome <= 500000) oldTax = 0;

    // ===============================
    // BEST REGIME
    // ===============================
    const bestRegime =
      oldTax < newTax ? "old" : "new";

    const selectedTax =
      bestRegime === "new" ? newTax : oldTax;

    // ===============================
    // CESS
    // ===============================
    const cess = Math.round(selectedTax * 0.04);

    const totalTax = Math.round(selectedTax + cess);

    // ===============================
    // NET PAYABLE
const totalPaid = data.tds + data.advancePaid;

const netPayable = totalTax > totalPaid
  ? totalTax - totalPaid
  : 0;

const refund = totalPaid > totalTax
  ? totalPaid - totalTax
  : 0;

    // ===============================
    // ADVANCE TAX INSTALLMENTS
    // ===============================
    const installments =
      netPayable < 10000
        ? {
            june: 0,
            september: 0,
            december: 0,
            march: 0,
          }
        : {
            june: Math.round(netPayable * 0.15),
            september: Math.round(netPayable * 0.45),
            december: Math.round(netPayable * 0.75),
            march: Math.round(netPayable),
          };

    // ===============================
    // FINAL RETURN
    // ===============================
    return {
      totalIncome,
      taxableIncome: taxableNormalIncome,

      tax: Math.round(selectedTax),
      cess,
      totalTax,
      netPayable,
   refund, // ✅ ADD THIS
      installments,
// ✅ ADD THESE (VERY IMPORTANT)
     tds: data.tds,
     advancePaid: data.advancePaid,
      // ADVANCED DATA
      oldTax: Math.round(oldTax),
      newTax: Math.round(newTax),
      bestRegime,
    };
  } catch (error) {
    console.error("Tax Calculation Error:", error);

    throw new Error("Tax calculation failed");
  }
};
