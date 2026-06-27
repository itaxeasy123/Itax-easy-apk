export type GstMode = 'exclusive' | 'inclusive';

export type GstRateOption = 3 | 5 | 12 | 18 | 28;

export type GstCalculatorInput = {
  amount: string;
  mode: GstMode;
  rate: GstRateOption;
};

export type GstCalculationResult = {
  baseAmount: number;
  cgst: number;
  gstAmount: number;
  igst: number;
  sgst: number;
  totalAmount: number;
};
