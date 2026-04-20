import {
  CompoundInterestCalculatorInput,
  CompoundInterestCalculatorResult,
} from '../../features/calculators/bank/types/compoundInterest.types';

export function calculateCompoundInterest(
  input: CompoundInterestCalculatorInput
): CompoundInterestCalculatorResult {
  const principal = Number(input.principal) || 0;
  const rate = Number(input.rate) || 0;
  const time = Number(input.time) || 0;
  const frequency = Number(input.frequency) || 0;

  const finalAmount =
    principal > 0 && rate > 0 && time > 0 && frequency > 0
      ? principal * Math.pow(1 + rate / (100 * frequency), frequency * time)
      : principal;

  const interest = Math.max(finalAmount - principal, 0);

  return {
    finalAmount,
    frequency,
    interest,
    principal,
    rate,
    time,
  };
}
