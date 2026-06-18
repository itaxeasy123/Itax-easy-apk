import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

type CSVData = Record<string, any>[];

type ExportPayload = {
  data: CSVData;
  fileName?: string;
};

export class CSVService {
  // ===============================
  // 🔹 JSON → CSV
  // ===============================
  private static convertToCSV(data: CSVData): string {
    if (!data || data.length === 0) {
      throw new Error("No data provided");
    }

    const headers = Object.keys(data[0]);

    const rows = data.map((row) =>
      headers
        .map((field) => {
          const value = row[field] ?? "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    // ✅ Excel friendly (BOM added)
    return "\uFEFF" + [headers.join(","), ...rows].join("\n");
  }

  // ===============================
  // 🔹 SAFE FILE NAME
  // ===============================
  private static sanitizeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9-_]/g, "_");
  }

  // ===============================
  // 🔹 EXPORT CSV (MAIN)
  // ===============================
  static async exportCSV({ data, fileName = "Export" }: ExportPayload) {
    try {
      const csv = this.convertToCSV(data);
      const safeName = this.sanitizeFileName(fileName);
      const timestamp = Date.now();

      // ===============================
      // 🌐 WEB DOWNLOAD
      // ===============================
      if (Platform.OS === "web") {
        const blob = new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${safeName}_${timestamp}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log("✅ CSV downloaded (web)");
        return;
      }

      // ===============================
      // 📱 MOBILE SAVE
      // ===============================
      const dir = FileSystem.documentDirectory;

      if (!dir) {
        throw new Error("Directory not available");
      }

      const fileUri = `${dir}${safeName}_${timestamp}.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: "utf8", // ✅ IMPORTANT FIX
      });

      console.log("✅ CSV saved:", fileUri);

      // ===============================
      // 📤 SHARE FILE
      // ===============================
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      return fileUri;
    } catch (error: any) {
      console.log("❌ CSV Export Error:", error);
      throw error;
    }
  }
}

