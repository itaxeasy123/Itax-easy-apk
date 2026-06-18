import {
  DepreciationCalculatorInput,
  DepreciationCalculatorResult,
} from '../../features/calculators/tax/types/depreciation.types';

export function calculateDepreciation(
  input: DepreciationCalculatorInput
): DepreciationCalculatorResult {
  const purchasePrice = Number(input.purchasePrice) || 0;
  const scrapValue = Number(input.scrapValue) || 0;
  const usefulLife = Number(input.usefulLife) || 0;

  const depreciableAmount = Math.max(purchasePrice - scrapValue, 0);
  const annualDepreciation =
    usefulLife > 0 ? depreciableAmount / usefulLife : 0;
  const monthlyDepreciation = annualDepreciation / 12;
  const remainingValue = Math.max(purchasePrice - annualDepreciation, 0);

  return {
    depreciableAmount,
    annualDepreciation,
    monthlyDepreciation,
    remainingValue,
  };
}
