export type EmiCalculatorInput = {
  annualRate: string;
  principal: string;
  tenureYears: string;
};

export type EmiCalculatorResult = {
  emi: number;
  principal: number;
  rate: number;
  tenureYears: number;
  totalInterest: number;
  totalPayment: number;
};
