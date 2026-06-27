import * as yup from "yup";

// ❌ REMOVE direct ObjectSchema<TaxInput>
// let Yup infer type

export const taxSchema = yup.object({
  // ==========================
  // 💰 INCOME
  // ==========================
  salary: yup
    .number()
    .typeError("Enter valid salary")
    .min(0)
    .required(),

  business: yup
    .number()
    .typeError("Enter valid business income")
    .min(0)
    .required(),

  capitalGains: yup
    .number()
    .typeError("Enter valid capital gains")
    .min(0)
    .required(),

  stcg: yup
    .number()
    .typeError("Enter valid STCG")
    .min(0)
    .required(),

  ltcg: yup
    .number()
    .typeError("Enter valid LTCG")
    .min(0)
    .required(),

  otherIncome: yup
    .number()
    .typeError("Enter valid other income")
    .min(0)
    .required(),

  // ==========================
  // 📉 DEDUCTIONS
  // ==========================
  deductions: yup
    .number()
    .typeError("Enter valid deductions")
    .min(0)
    .required(),

  // ==========================
  // 🏦 TAX PAID
  // ==========================
  tds: yup
    .number()
    .typeError("Enter valid TDS")
    .min(0)
    .required(),

  advancePaid: yup
    .number()
    .typeError("Enter valid advance tax")
    .min(0)
    .required(),

  // ==========================
  // 👤 USER DETAILS
  // ==========================
  age: yup
    .string()
    .oneOf(["normal", "senior", "super_senior"])
    .required(),

  // ❌ REMOVE regime (as per your requirement)
  // regime: ❌

  // ==========================
  // ⚙️ EXTRA FIELDS
  // ==========================
  financialYear: yup.string().required(),

  assesseeType: yup
    .string()
    .oneOf(["individual", "huf", "company", "firm", "llp"])
    .required(),

  residentialStatus: yup
    .string()
    .oneOf(["resident", "nri"])
    .required(),

  gender: yup
    .string()
    .oneOf(["male", "female", "other"])
    .required(),

  quarter: yup
    .string()
    .oneOf(["Q1", "Q2", "Q3", "Q4"])
    .required(),
});