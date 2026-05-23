import {
  CapitalGainCalculatorInput,
  CapitalGainCalculatorResult,
} from '../../features/calculators/tax/types/capitalGain.types';

export function calculateCapitalGain(
  input: CapitalGainCalculatorInput
): CapitalGainCalculatorResult {
  const purchasePrice = Number(input.purchasePrice) || 0;
  const salePrice = Number(input.salePrice) || 0;
  
  let taxRate = 0;
  if (input.assetType === 'equity') {
    taxRate = input.holdingPeriod === 'short' ? 15 : 12.5;
  } else {
    taxRate = input.holdingPeriod === 'short' ? 30 : 12.5;
  }

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
