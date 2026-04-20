import {
  SimpleInterestCalculatorInput,
  SimpleInterestCalculatorResult,
} from '../../features/calculators/bank/types/simpleInterest.types';

export function calculateSimpleInterest(
  input: SimpleInterestCalculatorInput
): SimpleInterestCalculatorResult {
  const principal = Number(input.principal) || 0;
  const rate = Number(input.rate) || 0;
  const time = Number(input.time) || 0;

  const interest = (principal * rate * time) / 100;
  const finalAmount = principal + interest;

  return {
    finalAmount,
    interest,
    principal,
    rate,
    time,
  };
}
