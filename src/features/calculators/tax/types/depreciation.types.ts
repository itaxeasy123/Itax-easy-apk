export type DepreciationCalculatorInput = {
  purchasePrice: string;
  scrapValue: string;
  usefulLife: string;
};

export type DepreciationCalculatorResult = {
  depreciableAmount: number;
  annualDepreciation: number;
  monthlyDepreciation: number;
  remainingValue: number;
};
