export type CapitalGainCalculatorInput = {
  purchasePrice: string;
  salePrice: string;
  assetType: 'equity' | 'property';
  holdingPeriod: 'short' | 'long';
};

export type CapitalGainCalculatorResult = {
  purchasePrice: number;
  salePrice: number;
  taxRate: number;
  totalCapitalGain: number;
  taxOwed: number;
};
