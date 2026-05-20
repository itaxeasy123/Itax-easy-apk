export const TAX_CONFIG = {
  old: [
    { upto: 250000, rate: 0 },
    { upto: 500000, rate: 0.05 },
    { upto: 1000000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ],
  new: [
    { upto: 300000, rate: 0 },
    { upto: 700000, rate: 0.05 },
    { upto: 1000000, rate: 0.1 },
    { upto: 1200000, rate: 0.15 },
    { upto: 1500000, rate: 0.2 },
    { upto: Infinity, rate: 0.3 },
  ],

  surcharge: [
    { upto: 5000000, rate: 0 },
    { upto: 10000000, rate: 0.1 },
    { upto: 20000000, rate: 0.15 },
    { upto: 50000000, rate: 0.25 },
    { upto: Infinity, rate: 0.37 },
  ],
};