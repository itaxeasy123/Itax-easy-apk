import {
  FixedDepositCalculatorInput,
  FixedDepositCalculatorResult,
} from '../../features/calculators/investment/types/fd.types';

export function calculateFd(
  input: FixedDepositCalculatorInput
): FixedDepositCalculatorResult {
  const principal = Number(input.principal) || 0;
  const rate = Number(input.rate) || 0;
  const timeYears = Number(input.timeYears) || 0;

  const maturityAmount =
    principal > 0 && rate > 0 && timeYears > 0
      ? principal * Math.pow(1 + rate / 100, timeYears)
      : principal;

  const interestEarned = Math.max(maturityAmount - principal, 0);

  return {
    interestEarned,
    maturityAmount,
    principal,
    rate,
    timeYears,
  };
}
