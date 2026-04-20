export type FixedDepositCalculatorInput = {
  principal: string;
  rate: string;
  timeYears: string;
};

export type FixedDepositCalculatorResult = {
  interestEarned: number;
  maturityAmount: number;
  principal: number;
  rate: number;
  timeYears: number;
};
