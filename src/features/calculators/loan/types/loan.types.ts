export type LoanCalculatorInput = {
  annualRate: string;
  loanAmount: string;
  tenureYears: string;
};

export type LoanCalculatorResult = {
  annualRate: number;
  loanAmount: number;
  monthlyEmi: number;
  tenureYears: number;
  totalInterest: number;
  totalPayment: number;
};

export type LoanCalculatorFields = {
  loanAmount: string;
  annualRate: string;
  tenureYears: string;
};

export type LoanCalculatorScreenConfig = {
  amountLabel: string;
  rateLabel: string;
  tenureLabel: string;
  title: string;
};
