export type CompoundInterestCalculatorInput = {
  frequency: string;
  principal: string;
  rate: string;
  time: string;
};

export type CompoundInterestCalculatorResult = {
  finalAmount: number;
  frequency: number;
  interest: number;
  principal: number;
  rate: number;
  time: number;
};
