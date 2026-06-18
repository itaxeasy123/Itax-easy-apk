import {
  getTdsSectionRuleByKey,
  getTdsVariantRule,
  TdsSectionKey,
} from '../../features/calculators/tds/data/tdsRules';
import {
  TdsCalculatorInput,
  TdsCalculatorResult,
} from '../../features/calculators/tds/types/tds.types';

function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}

function formatThreshold(value: number) {
  if (value >= 10000000) {
    return `Rs ${(value / 10000000).toFixed(value % 10000000 === 0 ? 0 : 2)} crore`;
  }

  if (value >= 100000) {
    return `Rs ${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 2)} lakh`;
  }

  return `Rs ${value.toLocaleString('en-IN')}`;
}

function calculateNSection(amount: number, panAvailable: boolean, isNonFiler: boolean) {
  if (amount <= 0) {
    return 0;
  }

  if (!isNonFiler) {
    if (amount <= 10000000) {
      return 0;
    }

    const taxableAmount = amount - 10000000;
    const baseTax = taxableAmount * 0.02;
    return panAvailable ? baseTax : taxableAmount * 0.2;
  }

  if (amount <= 2000000) {
    return 0;
  }

  const taxFrom20LTo1Cr = Math.min(Math.max(amount - 2000000, 0), 8000000) * 0.02;
  const taxAbove1Cr = Math.max(amount - 10000000, 0) * 0.05;
  const rawTax = taxFrom20LTo1Cr + taxAbove1Cr;
  return panAvailable ? rawTax : rawTax > 0 ? Math.max(rawTax, amount * 0.2) : 0;
}

export function calculateTds(input: TdsCalculatorInput): TdsCalculatorResult {
  const paymentAmount = Number(input.paymentAmount) || 0;
  const panAvailable = input.panAvailable === 'Yes';

  const section = getTdsSectionRuleByKey(input.sectionKey as TdsSectionKey);

  if (!section) {
    return {
      effectiveRate: 0,
      netPayable: roundToTwo(paymentAmount),
      note: '',
      paymentAmount: roundToTwo(paymentAmount),
      sectionLabel: 'Unknown',
      sectionRate: 0,
      taxableAmount: 0,
      threshold: 0,
      thresholdLabel: 'Rs 0',
      tdsAmount: 0,
      variantLabel: '',
    };
  }

  const variant = getTdsVariantRule(section.key, input.variantLabel);
  const selectedRate = variant?.rate ?? section.rate;
  const selectedThreshold = variant?.threshold ?? section.threshold;
  const selectedThresholdMode = variant?.thresholdMode ?? section.thresholdMode;
  const selectedLabel = variant?.label ?? 'Default';
  const selectedNote = variant?.note ?? section.note;

  let taxableAmount = 0;
  let tdsAmount = 0;

  if (section.key === '194N') {
    const isNonFiler = (variant?.key ?? '') === 'nonFiler';
    tdsAmount = calculateNSection(paymentAmount, panAvailable, isNonFiler);
    taxableAmount = isNonFiler
      ? Math.max(paymentAmount - 2000000, 0)
      : Math.max(paymentAmount - 10000000, 0);
  } else if (paymentAmount > selectedThreshold) {
    if (selectedThresholdMode === 'excess') {
      taxableAmount = paymentAmount - selectedThreshold;
    } else {
      taxableAmount = paymentAmount;
    }

    tdsAmount = taxableAmount * selectedRate / 100;
  }

  if (!panAvailable && section.key !== '194N') {
    tdsAmount = Math.max(tdsAmount, taxableAmount * 0.2);
  }

  const roundedTds = roundToTwo(tdsAmount);
  const roundedTaxable = roundToTwo(taxableAmount);
  const effectiveRate = paymentAmount > 0 ? roundToTwo((roundedTds / paymentAmount) * 100) : 0;
  const netPayable = roundToTwo(Math.max(paymentAmount - roundedTds, 0));

  return {
    effectiveRate,
    netPayable,
    note: selectedNote,
    paymentAmount: roundToTwo(paymentAmount),
    sectionLabel: section.label,
    sectionRate: selectedRate,
    taxableAmount: roundedTaxable,
    threshold: selectedThreshold,
    thresholdLabel: formatThreshold(selectedThreshold),
    tdsAmount: roundedTds,
    variantLabel: selectedLabel,
  };
}
