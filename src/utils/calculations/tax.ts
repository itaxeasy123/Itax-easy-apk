export function calculateTax(input: {
  income: string;
  deductions: string;
  taxpayerType: string;
}) {
  const income = parseFloat(input.income) || 0;
  const deductions = parseFloat(input.deductions) || 0;

  const taxableIncome = Math.max(income - deductions, 0);

  let tax = 0;

  // OLD REGIME (basic slabs)
  if (taxableIncome <= 250000) {
    tax = 0;
  } else if (taxableIncome <= 500000) {
    tax = (taxableIncome - 250000) * 0.05;
  } else if (taxableIncome <= 1000000) {
    tax =
      (250000 * 0.05) +
      (taxableIncome - 500000) * 0.2;
  } else {
    tax =
      (250000 * 0.05) +
      (500000 * 0.2) +
      (taxableIncome - 1000000) * 0.3;
  }

  const cess = tax * 0.04;
  const totalTax = tax + cess;

  return {
    income,
    deductions,
    taxableIncome,
    tax,
    cess,
    totalTax,
  };
}