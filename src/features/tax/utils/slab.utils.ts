
export const calculateNewTax = (income: number) => {
  if (income <= 300000) return 0;
  if (income <= 600000) return (income - 300000) * 0.05;
  if (income <= 900000) return 15000 + (income - 600000) * 0.1;
  if (income <= 1200000) return 45000 + (income - 900000) * 0.15;
  if (income <= 1500000) return 90000 + (income - 1200000) * 0.2;
  return 150000 + (income - 1500000) * 0.3;
};

export const calculateOldTax = (
  income: number,
  age: string
) => {
  let basicExemption = 250000;
  if (age === "senior") basicExemption = 300000;
  if (age === "super_senior") basicExemption = 500000;

  if (income <= basicExemption) return 0;
  if (income <= 500000) return (income - basicExemption) * 0.05;
  if (income <= 1000000)
    return 12500 + (income - 500000) * 0.2;

  return 112500 + (income - 1000000) * 0.3;
};