import { TdsSectionKey } from '../data/tdsRules';

export type TdsCalculatorInput = {
  panAvailable: 'Yes' | 'No';
  paymentAmount: string;
  sectionKey: TdsSectionKey;
  variantLabel: string;
};

export type TdsCalculatorResult = {
  effectiveRate: number;
  netPayable: number;
  note: string;
  paymentAmount: number;
  sectionLabel: string;
  sectionRate: number;
  taxableAmount: number;
  threshold: number;
  thresholdLabel: string;
  tdsAmount: number;
  variantLabel: string;
};
