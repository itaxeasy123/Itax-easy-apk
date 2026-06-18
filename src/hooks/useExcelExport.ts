import { useState } from "react";
import { ExcelService } from "../services/excelService";

 export const useExcelExport = () => {
  const [loading, setLoading] = useState(false);

  const exportExcel = async (sheets: any[], fileName?: string) => {
    try {
      setLoading(true);
      const file = await ExcelService.exportExcel({
        sheets,
        fileName,
      });
      return file;
    } catch (e) {
      console.log("Export Error:", e);
    } finally {
      setLoading(false);
    }
  };

  return { exportExcel, loading };
};
