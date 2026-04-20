export type SimpleInterestCalculatorInput = {
  principal: string;
  rate: string;
  time: string;
};

export type SimpleInterestCalculatorResult = {
  finalAmount: number;
  interest: number;
  principal: number;
  rate: number;
  time: number;
};
