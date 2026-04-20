import {
  EmiCalculatorInput,
  EmiCalculatorResult,
} from '../../features/calculators/bank/types/emi.types';

export function calculateEmi(input: EmiCalculatorInput): EmiCalculatorResult {
  const principal = Number(input.principal) || 0;
  const rate = Number(input.annualRate) || 0;
  const tenureYears = Number(input.tenureYears) || 0;

  const monthlyRate = rate / 12 / 100;
  const totalMonths = tenureYears * 12;

  const emi =
    principal > 0 && monthlyRate > 0 && totalMonths > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : 0;

  const totalPayment = emi * totalMonths;
  const totalInterest = Math.max(totalPayment - principal, 0);

  return {
    emi,
    principal,
    rate,
    tenureYears,
    totalInterest,
    totalPayment,
  };
}
