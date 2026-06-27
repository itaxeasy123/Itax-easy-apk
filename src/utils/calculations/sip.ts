import {
  SipCalculatorInput,
  SipCalculatorResult,
} from '../../features/calculators/investment/types/sip.types';

export function calculateSip(input: SipCalculatorInput): SipCalculatorResult {
  const monthlyInvestment = Number(input.monthlyInvestment) || 0;
  const annualRate = Number(input.annualRate) || 0;
  const timeYears = Number(input.timeYears) || 0;

  const totalMonths = Math.max(timeYears, 0) * 12;
  const monthlyRate = annualRate > 0 ? Math.pow(1 + annualRate / 100, 1 / 12) - 1 : 0;

  let futureValue = 0;

  if (monthlyInvestment > 0 && totalMonths > 0) {
    if (monthlyRate > 0) {
      const power = Math.pow(1 + monthlyRate, totalMonths);
      const sipFactor = (power - 1) / monthlyRate;

      futureValue = monthlyInvestment * sipFactor * (1 + monthlyRate);
    } else {
      futureValue = monthlyInvestment * totalMonths;
    }
  }

  futureValue = Number(futureValue.toFixed(2));

  const totalInvestment = monthlyInvestment * totalMonths;

  const estimatedReturns = Number((futureValue - totalInvestment).toFixed(2));

  return {
    annualRate,
    estimatedReturns,
    futureValue,
    monthlyInvestment,
    timeYears,
    totalInvestment,
  };
}
