import {
  GstCalculationResult,
  GstCalculatorInput,
} from '../../features/calculators/gst/types/gst.types';

function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}

export function calculateGst({
  amount,
  mode,
  rate,
}: GstCalculatorInput): GstCalculationResult {
  const numericAmount = Number(amount || 0);

  if (!numericAmount || numericAmount < 0) {
    return {
      baseAmount: 0,
      cgst: 0,
      gstAmount: 0,
      igst: 0,
      sgst: 0,
      totalAmount: 0,
    };
  }

  if (mode === 'inclusive') {
    const baseAmount = numericAmount / (1 + rate / 100);
    const gstAmount = numericAmount - baseAmount;

    return {
      baseAmount: roundToTwo(baseAmount),
      cgst: roundToTwo(gstAmount / 2),
      gstAmount: roundToTwo(gstAmount),
      igst: roundToTwo(gstAmount),
      sgst: roundToTwo(gstAmount / 2),
      totalAmount: roundToTwo(numericAmount),
    };
  }

  const gstAmount = (numericAmount * rate) / 100;

  return {
    baseAmount: roundToTwo(numericAmount),
    cgst: roundToTwo(gstAmount / 2),
    gstAmount: roundToTwo(gstAmount),
    igst: roundToTwo(gstAmount),
    sgst: roundToTwo(gstAmount / 2),
    totalAmount: roundToTwo(numericAmount + gstAmount),
  };
}
