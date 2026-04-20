// ==========================
// 🎯 INPUT TYPE
// ==========================
export type TaxInput = {
  // ==========================
  // 💰 INCOME
  // ==========================
  salary: number;
  business: number;

  // 🔥 CAPITAL GAINS (split)
  stcg: number; // Short Term Capital Gain
  ltcg: number; // Long Term Capital Gain

  // 🔁 keep optional (auto calc or legacy support)
  capitalGains?: number;

  otherIncome: number;

  // ==========================
  // 📉 DEDUCTIONS
  // ==========================
  deductions: number;

  // ==========================
  // 🏦 TAX PAID
  // ==========================
  tds: number;
  advancePaid: number;

  // ==========================
  // 👤 USER DETAILS
  // ==========================
  age: "normal" | "senior" | "super_senior";

  gender: "male" | "female" | "other";

  residentialStatus: "resident" | "nri";

  assesseeType: "individual" | "huf" | "company" | "firm" | "llp";

  // ==========================
  // 📅 DYNAMIC FIELDS
  // ==========================
  financialYear: string; // ✅ dynamic (IMPORTANT)
  assessmentYear?: string; // optional (future use)

  quarter: "Q1" | "Q2" | "Q3" | "Q4";

  // ==========================
  // ⚙️ SYSTEM FLAGS
  // ==========================
  // ❌ remove manual regime selection
  // system will auto choose best
};


// ==========================
// 🎯 RESULT TYPE
// ==========================
export type TaxResult = {
  // ==========================
  // 📊 INCOME
  // ==========================
  totalIncome: number;
  taxableIncome: number;

  // ==========================
  // 🧾 TAX
  // ==========================
  tax: number; // selected tax
  cess: number;
  totalTax: number;

  // ==========================
  // 💳 PAYMENT
  // ==========================
  netPayable: number;

   // ✅ ADD THIS
  tds: number;
  advancePaid: number;
  // ==========================
  // 📅 INSTALLMENTS
  // ==========================
  installments: {
    june: number;
    september: number;
    december: number;
    march: number;
  };

  // ==========================
  // 🔥 ADVANCED ANALYTICS
  // ==========================
  oldTax: number;
  newTax: number;
  bestRegime: "old" | "new";

  // ==========================
  // 📊 EXTRA (ENTERPRISE)
  // ==========================
  effectiveTaxRate?: number;
  totalTaxPaid?: number;
  refund?: number;
};