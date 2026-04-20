export type SipCalculatorInput = {
  annualRate: string;
  monthlyInvestment: string;
  timeYears: string;
};

export type SipCalculatorResult = {
  annualRate: number;
  estimatedReturns: number;
  futureValue: number;
  monthlyInvestment: number;
  timeYears: number;
  totalInvestment: number;
};
