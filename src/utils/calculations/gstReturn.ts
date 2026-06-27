import {
  GstReturnCalculatorInput,
  GstReturnCalculatorResult,
} from '../../features/calculators/gst-return/types/gstReturn.types';

function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}

export function calculateGstReturn(
  input: GstReturnCalculatorInput
): GstReturnCalculatorResult {
  const taxableSales = Number(input.taxableSales) || 0;
  const outputRate = Number(input.outputRate) || 0;
  const inputTaxCredit = Number(input.inputTaxCredit) || 0;

  const outputGst = taxableSales > 0 && outputRate > 0 ? (taxableSales * outputRate) / 100 : 0;
  const netPayable = Math.max(outputGst - inputTaxCredit, 0);
  const refundableAmount = Math.max(inputTaxCredit - outputGst, 0);

  return {
    inputTaxCredit: roundToTwo(inputTaxCredit),
    netPayable: roundToTwo(netPayable),
    outputGst: roundToTwo(outputGst),
    outputRate: roundToTwo(outputRate),
    taxableSales: roundToTwo(taxableSales),
    refundableAmount: roundToTwo(refundableAmount),
  };
}
