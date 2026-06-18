import { useState } from "react";
import { calculateIncomeTax } from "../services/taxCalculator.service";
import { TaxInput, TaxBreakdown } from "../models/taxCalculator.types";

export const useTaxCalculator = () => {
  const [result, setResult] = useState<TaxBreakdown | null>(null);

  const calculate = (input: TaxInput) => {
    const res = calculateIncomeTax(input);
    setResult(res);
  };

  return { result, calculate };
};