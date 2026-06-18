import {
  LoanCalculatorInput,
  LoanCalculatorResult,
} from '../../features/calculators/loan/types/loan.types';

export function calculateLoan(input: LoanCalculatorInput): LoanCalculatorResult {
  const loanAmount = Number(input.loanAmount) || 0;
  const annualRate = Number(input.annualRate) || 0;
  const tenureYears = Number(input.tenureYears) || 0;

  const months = Math.max(tenureYears, 0) * 12;
  const monthlyRate = annualRate > 0 ? annualRate / 12 / 100 : 0;

  let monthlyEmi = 0;

  if (loanAmount > 0 && months > 0) {
    if (monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, months);
      monthlyEmi = (loanAmount * monthlyRate * factor) / (factor - 1);
    } else {
      monthlyEmi = loanAmount / months;
    }
  }

  const totalPayment = monthlyEmi * months;
  const totalInterest = Math.max(totalPayment - loanAmount, 0);

  return {
    annualRate,
    loanAmount,
    monthlyEmi,
    tenureYears,
    totalInterest,
    totalPayment,
  };
}

