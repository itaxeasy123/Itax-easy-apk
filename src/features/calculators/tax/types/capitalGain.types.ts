export type CapitalGainCalculatorInput = {
  purchasePrice: string;
  salePrice: string;
  taxRate: string;
};

export type CapitalGainCalculatorResult = {
  purchasePrice: number;
  salePrice: number;
  taxRate: number;
  totalCapitalGain: number;
  taxOwed: number;
};
