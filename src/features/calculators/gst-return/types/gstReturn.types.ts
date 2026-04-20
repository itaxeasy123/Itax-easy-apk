export type GstReturnCalculatorInput = {
  inputTaxCredit: string;
  outputRate: string;
  taxableSales: string;
};

export type GstReturnCalculatorResult = {
  inputTaxCredit: number;
  netPayable: number;
  outputGst: number;
  outputRate: number;
  taxableSales: number;
  refundableAmount: number;
};
