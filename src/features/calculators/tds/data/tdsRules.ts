export type TdsSectionKey =
  | '194A'
  | '194B'
  | '194C'
  | '194D'
  | '194DA'
  | '194G'
  | '194H'
  | '194I'
  | '194IA'
  | '194J'
  | '194K'
  | '194LA'
  | '194M'
  | '194N'
  | '194O'
  | '194Q'
  | '194R'
  | '194S'
  | '194T'
  | '194LD'
  | '195';

export type TdsVariantKey =
  | 'default'
  | 'individualHufSingle'
  | 'individualHufAnnual'
  | 'otherSingle'
  | 'otherAnnual'
  | 'plantMachinery'
  | 'otherRent'
  | 'professional'
  | 'technical'
  | 'royaltyFilm'
  | 'callCenter'
  | 'regularFiler'
  | 'nonFiler'
  | 'specifiedPerson'
  | 'regularPerson';

export type TdsVariantRule = {
  key: TdsVariantKey;
  label: string;
  rate: number;
  threshold?: number;
  thresholdMode?: 'full' | 'excess';
  note?: string;
};

export type TdsRule = {
  key: TdsSectionKey;
  label: string;
  note: string;
  rate: number;
  threshold: number;
  thresholdMode: 'full' | 'excess';
  variants?: TdsVariantRule[];
};

export const tdsSectionRules: TdsRule[] = [
  {
    key: '194A',
    label: '194A - Interest other than securities',
    note: 'Threshold: Rs 10,000 in a financial year for most payers. Tax is on the full interest amount once the limit is crossed.',
    rate: 10,
    threshold: 10000,
    thresholdMode: 'full',
  },
  {
    key: '194B',
    label: '194B - Lottery / game winnings',
    note: 'Threshold: Rs 10,000 per transaction. TDS applies to the full winnings amount once crossed.',
    rate: 30,
    threshold: 10000,
    thresholdMode: 'full',
  },
  {
    key: '194C',
    label: '194C - Contractor / sub-contractor',
    note: 'Thresholds: Rs 30,000 per payment or Rs 1,00,000 aggregate in a financial year.',
    rate: 1,
    threshold: 30000,
    thresholdMode: 'full',
    variants: [
      {
        key: 'individualHufSingle',
        label: 'Individual/HUF - Single payment',
        rate: 1,
        threshold: 30000,
        thresholdMode: 'full',
      },
      {
        key: 'individualHufAnnual',
        label: 'Individual/HUF - Annual aggregate',
        rate: 1,
        threshold: 100000,
        thresholdMode: 'full',
      },
      {
        key: 'otherSingle',
        label: 'Others - Single payment',
        rate: 2,
        threshold: 30000,
        thresholdMode: 'full',
      },
      {
        key: 'otherAnnual',
        label: 'Others - Annual aggregate',
        rate: 2,
        threshold: 100000,
        thresholdMode: 'full',
      },
    ],
  },
  {
    key: '194D',
    label: '194D - Insurance commission',
    note: 'Threshold: Rs 20,000 in a financial year. TDS applies to the full commission amount once crossed.',
    rate: 5,
    threshold: 20000,
    thresholdMode: 'full',
  },
  {
    key: '194DA',
    label: '194DA - Life insurance payout',
    note: 'Threshold: Rs 1,00,000. This is an estimate because the taxable income element can vary.',
    rate: 2,
    threshold: 100000,
    thresholdMode: 'full',
  },
  {
    key: '194G',
    label: '194G - Commission on lottery tickets',
    note: 'Threshold: Rs 20,000 in a financial year. TDS applies to the full commission amount once crossed.',
    rate: 2,
    threshold: 20000,
    thresholdMode: 'full',
  },
  {
    key: '194H',
    label: '194H - Commission / brokerage',
    note: 'Threshold: Rs 20,000 in a financial year. TDS applies to the full commission amount once crossed.',
    rate: 2,
    threshold: 20000,
    thresholdMode: 'full',
  },
  {
    key: '194I',
    label: '194I - Rent',
    note: 'Threshold: Rs 50,000 per month. The calculator assumes the entered amount is the payment subject to deduction.',
    rate: 2,
    threshold: 50000,
    thresholdMode: 'full',
    variants: [
      {
        key: 'plantMachinery',
        label: 'Plant & Machinery',
        rate: 2,
        threshold: 50000,
        thresholdMode: 'full',
      },
      {
        key: 'otherRent',
        label: 'Land / building / furniture / fittings',
        rate: 10,
        threshold: 50000,
        thresholdMode: 'full',
      },
    ],
  },
  {
    key: '194IA',
    label: '194IA - Immovable property',
    note: 'Threshold: Rs 50,00,000 for consideration of property transfer. TDS applies to the full consideration once crossed.',
    rate: 1,
    threshold: 5000000,
    thresholdMode: 'full',
  },
  {
    key: '194J',
    label: '194J - Professional / technical services',
    note: 'Threshold: Rs 50,000 in a financial year. Rates vary by subtype.',
    rate: 10,
    threshold: 50000,
    thresholdMode: 'full',
    variants: [
      {
        key: 'professional',
        label: 'Professional services',
        rate: 10,
        threshold: 50000,
        thresholdMode: 'full',
      },
      {
        key: 'technical',
        label: 'Technical services',
        rate: 2,
        threshold: 50000,
        thresholdMode: 'full',
      },
      {
        key: 'royaltyFilm',
        label: 'Royalty / cinematographic film',
        rate: 2,
        threshold: 50000,
        thresholdMode: 'full',
      },
      {
        key: 'callCenter',
        label: 'Call center',
        rate: 2,
        threshold: 50000,
        thresholdMode: 'full',
      },
    ],
  },
  {
    key: '194K',
    label: '194K - Units',
    note: 'Threshold: Rs 10,000 in a financial year. TDS applies to the full income amount once crossed.',
    rate: 10,
    threshold: 10000,
    thresholdMode: 'full',
  },
  {
    key: '194LA',
    label: '194LA - Compensation on acquisition',
    note: 'Threshold: Rs 5,00,000 in a financial year. TDS applies to the full compensation once crossed.',
    rate: 10,
    threshold: 500000,
    thresholdMode: 'full',
  },
  {
    key: '194M',
    label: '194M - Commission / professional fee',
    note: 'Threshold: Rs 50 lakh in a financial year. TDS applies to the full amount once crossed.',
    rate: 2,
    threshold: 5000000,
    thresholdMode: 'full',
  },
  {
    key: '194N',
    label: '194N - Cash withdrawal',
    note: 'Regular filers: 2% above Rs 1 crore. Non-filers: 2% above Rs 20 lakh and 5% above Rs 1 crore.',
    rate: 2,
    threshold: 10000000,
    thresholdMode: 'excess',
    variants: [
      {
        key: 'regularFiler',
        label: 'ITR filed',
        rate: 2,
        threshold: 10000000,
        thresholdMode: 'excess',
      },
      {
        key: 'nonFiler',
        label: 'ITR not filed',
        rate: 2,
        threshold: 2000000,
        thresholdMode: 'excess',
        note: 'Non-filer rule: 2% from Rs 20 lakh to Rs 1 crore and 5% above Rs 1 crore.',
      },
    ],
  },
  {
    key: '194O',
    label: '194O - E-commerce payments',
    note: 'Threshold: Rs 5 lakh in a financial year for eligible participants. TDS applies to the excess amount.',
    rate: 0.1,
    threshold: 500000,
    thresholdMode: 'excess',
  },
  {
    key: '194Q',
    label: '194Q - Purchase of goods',
    note: 'Threshold: Rs 50 lakh in a financial year. TDS applies on the amount exceeding the threshold.',
    rate: 0.1,
    threshold: 5000000,
    thresholdMode: 'excess',
  },
  {
    key: '194R',
    label: '194R - Benefit / perquisite',
    note: 'Threshold: Rs 20,000 in a financial year. TDS applies to the full benefit amount once crossed.',
    rate: 10,
    threshold: 20000,
    thresholdMode: 'full',
  },
  {
    key: '194S',
    label: '194S - Virtual digital asset',
    note: 'Threshold depends on the recipient: Rs 10,000 for most persons and Rs 50,000 for specified persons. TDS applies on the excess amount.',
    rate: 1,
    threshold: 10000,
    thresholdMode: 'excess',
    variants: [
      {
        key: 'regularPerson',
        label: 'Regular person',
        rate: 1,
        threshold: 10000,
        thresholdMode: 'excess',
      },
      {
        key: 'specifiedPerson',
        label: 'Specified person',
        rate: 1,
        threshold: 50000,
        thresholdMode: 'excess',
      },
    ],
  },
  {
    key: '194T',
    label: '194T - Partner remuneration',
    note: 'Threshold: Rs 20,000 in a financial year. TDS applies to the full amount once crossed.',
    rate: 10,
    threshold: 20000,
    thresholdMode: 'full',
  },
  {
    key: '194LD',
    label: '194LD - Interest on rupee bonds',
    note: 'Common rate used for FII/QFI interest on rupee denominated bonds.',
    rate: 5,
    threshold: 0,
    thresholdMode: 'full',
  },
  {
    key: '195',
    label: '195 - Non-resident income',
    note: 'This is an estimate for the common default rate. Actual TDS under section 195 varies by income category and DTAA.',
    rate: 20,
    threshold: 0,
    thresholdMode: 'full',
  },
];

export const tdsSectionOptions = tdsSectionRules.map((rule) => rule.label);

export function getTdsSectionRule(label: string) {
  return tdsSectionRules.find((rule) => rule.label === label) ?? tdsSectionRules[0];
}

export function getTdsVariantOptions(sectionKey: TdsSectionKey) {
  return getTdsSectionRuleByKey(sectionKey)?.variants?.map((variant) => variant.label) ?? [];
}

export function getTdsSectionRuleByKey(sectionKey: TdsSectionKey) {
  return tdsSectionRules.find((rule) => rule.key === sectionKey) ?? null;
}

export function getTdsVariantRule(
  sectionKey: TdsSectionKey,
  variantLabel?: string
): TdsVariantRule | null {
  const section = getTdsSectionRuleByKey(sectionKey);

  if (!section?.variants?.length) {
    return null;
  }

  if (!variantLabel) {
    return section.variants[0] ?? null;
  }

  return section.variants.find((variant) => variant.label === variantLabel) ?? section.variants[0] ?? null;
}
