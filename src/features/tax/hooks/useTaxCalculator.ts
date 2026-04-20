import { useState, useEffect } from "react";
import { calculateAdvanceTax } from "../services/tax.service";
import {
  saveTaxData,
  getTaxData,
} from "../../../services/storageService";

import { generatePDF } from "../services/pdf.service";
import { TaxInput, TaxResult } from "../models/tax.types";

export const useTaxCalculator = () => {
  const [input, setInput] = useState<TaxInput | null>(null);
  const [result, setResult] = useState<TaxResult | null>(null);
  const [loading, setLoading] = useState(false);

  // ============================
  // 🔄 LOAD SAVED DATA (AUTO)
  // ============================
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      setLoading(true);
      const saved = await getTaxData();

      if (saved) {
        setInput(saved.input);
        setResult(saved.result);
      }
    } catch (error) {
      console.log("Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 🧮 CALCULATE TAX
  // ============================
  const calculate = async (data: TaxInput) => {
    try {
      setLoading(true);

      const res = calculateAdvanceTax(data);

      setInput(data);
      setResult(res);

      // 💾 SAVE OFFLINE
      await saveTaxData({
        input: data,
        result: res,
      });

      return res;
    } catch (error) {
      console.log("Calculation Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 📄 EXPORT PDF
  // ============================
  const exportPDF = async () => {
    try {
      if (!result) return;

      const filePath = await generatePDF(result);
      return filePath;
    } catch (error) {
      console.log("PDF Error:", error);
    }
  };

  // ============================
  // 🔁 RESET DATA
  // ============================
  const reset = async () => {
    setInput(null);
    setResult(null);

    await saveTaxData(null);
  };

  return {
    input,
    result,
    loading,

    calculate,
    exportPDF,
    reset,
    reload: loadSavedData,
  };
};