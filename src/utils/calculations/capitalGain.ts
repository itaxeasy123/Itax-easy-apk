import {
  CapitalGainCalculatorInput,
  CapitalGainCalculatorResult,
} from '../../features/calculators/tax/types/capitalGain.types';

export function calculateCapitalGain(
  input: CapitalGainCalculatorInput
): CapitalGainCalculatorResult {
  const purchasePrice = Number(input.purchasePrice) || 0;
  const salePrice = Number(input.salePrice) || 0;
  const taxRate = Number(input.taxRate) || 0;

  const totalCapitalGain = Math.max(salePrice - purchasePrice, 0);
  const taxOwed = (totalCapitalGain * taxRate) / 100;

  return {
    purchasePrice,
    salePrice,
    taxRate,
    totalCapitalGain,
    taxOwed,
  };
}
