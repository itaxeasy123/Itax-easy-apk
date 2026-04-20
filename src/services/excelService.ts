import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";

type SheetData = {
  name: string;
  data: Record<string, any>[];
};

export class ExcelService {

  // ✅ Dynamic headers
  private static getHeaders(data: Record<string, any>[]) {
    const headers = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => headers.add(key));
    });
    return Array.from(headers);
  }

  // ✅ Create sheet
  private static createSheet(data: Record<string, any>[]) {
    const headers = this.getHeaders(data);

    const formattedData = data.map(item => {
      const row: Record<string, any> = {};
      headers.forEach(h => {
        row[h] = item[h] ?? "";
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);

    ws["!cols"] = headers.map(h => ({
      wch: Math.max(h.length, 15),
    }));

    return ws;
  }

  // ✅ MAIN FUNCTION
  static async exportExcel({
    sheets,
    fileName = "Export",
  }: {
    sheets: SheetData[];
    fileName?: string;
  }) {
    try {
      const workbook = XLSX.utils.book_new();

      sheets.forEach(sheet => {
        const ws = this.createSheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, ws, sheet.name);
      });

      const timestamp = Date.now();

      // 🌐 WEB
      if (Platform.OS === "web") {
        const wbout = XLSX.write(workbook, {
          type: "array",
          bookType: "xlsx",
        });

        const blob = new Blob([wbout], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}_${timestamp}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        return "downloaded";
      }

      // 📱 MOBILE (FINAL FIX)
      const wbout = XLSX.write(workbook, {
        type: "base64",
        bookType: "xlsx",
      });

      // ✅ SAFE DIRECTORY (NO CRASH)
const dir =
  (FileSystem as any).documentDirectory ??
  (FileSystem as any).cacheDirectory ??
  "";

      const fileUri = `${dir}${fileName}_${timestamp}.xlsx`;

      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: "base64" as any,
      });

      // ✅ Share popup
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      return fileUri;

    } catch (error) {
      console.error("❌ Excel Export Error:", error);
      throw error;
    }
  }
}

