/**
 * Shared export helpers for the accounting section.
 *  - Web: triggers a browser download (CSV/Excel) or the print dialog (PDF).
 *  - Native: writes to the app cache and opens the system share sheet.
 */
import { Alert, Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

const webDownload = (filename: string, mime: string, content: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const nativeShare = async (filename: string, mime: string, content: string) => {
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: mime, dialogTitle: filename });
  } else {
    Alert.alert("Saved", `File written to ${uri}`);
  }
};

/** rows: array of arrays; first row = headers. */
export const buildCsv = (rows: (string | number)[][]) =>
  rows
    .map((r) =>
      r
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\n");

/** Simple HTML table — Excel opens .xls HTML files natively. */
export const buildExcelHtml = (title: string, rows: (string | number)[][]) => {
  const [head, ...body] = rows;
  return `<html><head><meta charset="utf-8"><title>${title}</title></head><body>
<h3>${title}</h3>
<table border="1" cellspacing="0" cellpadding="4">
<tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>
${body.map((r) => `<tr>${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("\n")}
</table></body></html>`;
};

export const exportCsv = async (filename: string, rows: (string | number)[][]) => {
  try {
    const csv = buildCsv(rows);
    if (Platform.OS === "web") webDownload(`${filename}.csv`, "text/csv;charset=utf-8", csv);
    else await nativeShare(`${filename}.csv`, "text/csv", csv);
  } catch (e: any) {
    Alert.alert("Export failed", e?.message ?? "Could not export the CSV file.");
  }
};

export const exportExcel = async (filename: string, title: string, rows: (string | number)[][]) => {
  try {
    const html = buildExcelHtml(title, rows);
    if (Platform.OS === "web") webDownload(`${filename}.xls`, "application/vnd.ms-excel", html);
    else await nativeShare(`${filename}.xls`, "application/vnd.ms-excel", html);
  } catch (e: any) {
    Alert.alert("Export failed", e?.message ?? "Could not export the Excel file.");
  }
};

/** PDF: native → share sheet; web → browser print dialog (Save as PDF). */
export const exportPdf = async (filename: string, html: string) => {
  try {
    if (Platform.OS === "web") {
      await Print.printAsync({ html });
      return;
    }
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `${filename}.pdf` });
    } else {
      Alert.alert("Saved", `PDF written to ${uri}`);
    }
  } catch (e: any) {
    Alert.alert("Export failed", e?.message ?? "Could not export the PDF.");
  }
};

/** Wraps a titled table into print-friendly HTML for PDFs. */
export const buildPdfHtml = (title: string, subtitle: string, rows: (string | number)[][]) => {
  const [head, ...body] = rows;
  return `<html><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, Roboto, sans-serif; padding: 24px; color: #0f172a; }
  h2 { margin: 0 0 4px; } .sub { color: #64748b; font-size: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f1f5f9; text-align: left; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; }
  td.num { text-align: right; }
</style></head><body>
<h2>${title}</h2><div class="sub">${subtitle}</div>
<table>
<tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr>
${body
  .map(
    (r) =>
      `<tr>${r
        .map((c, i) => `<td class="${i > 0 && typeof c === "number" ? "num" : ""}">${c ?? ""}</td>`)
        .join("")}</tr>`
  )
  .join("\n")}
</table></body></html>`;
};
