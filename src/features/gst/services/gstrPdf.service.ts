import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Alert, Platform, Linking } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";

type BuildPdfInput = {
  type: "summary" | "details";
  title: string;
  data: any[];
  gstin?: string;
  financialYear?: string;
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildGSTRPdfHtml(input: BuildPdfInput) {
  const { title, data, type, gstin, financialYear } = input;

  let tableHtml = "";

  if (type === "summary") {
    // Generate Summary Table HTML
    tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #3574E2; color: #FFF;">
            <th style="padding: 10px; border: 1px solid #D1D5DB; text-align: left;">Sr. No</th>
            <th style="padding: 10px; border: 1px solid #D1D5DB; text-align: left;">Nature of Supplies</th>
            <th style="padding: 10px; border: 1px solid #D1D5DB; text-align: center;">GSTR-2B Table</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr style="background-color: ${row.isHeader ? '#F3F6F8' : '#FFF'}; font-weight: ${row.isHeader ? 'bold' : 'normal'};">
              <td style="padding: 10px; border: 1px solid #D1D5DB;">${escapeHtml(row.sr)}</td>
              <td style="padding: 10px; border: 1px solid #D1D5DB;">${escapeHtml(row.nature)}</td>
              <td style="padding: 10px; border: 1px solid #D1D5DB; text-align: center;">${escapeHtml(row.table || '-')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (type === "details") {
    // Generate Details Table HTML
    tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #3574E2; color: #FFF;">
            <th style="padding: 10px; border: 1px solid #D1D5DB; text-align: left;">Sr. No</th>
            <th style="padding: 10px; border: 1px solid #D1D5DB; text-align: left;">Supplies</th>
            <th style="padding: 10px; border: 1px solid #D1D5DB; text-align: right;">Value (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td style="padding: 10px; border: 1px solid #D1D5DB;">${escapeHtml(row.id)}.</td>
              <td style="padding: 10px; border: 1px solid #D1D5DB;">${escapeHtml(row.label)}</td>
              <td style="padding: 10px; border: 1px solid #D1D5DB; text-align: right; font-weight: bold;">${escapeHtml(row.value || '0')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12px;
    }
    .header { text-align: center; margin-bottom: 20px; }
    .header h2 { color: #3574E2; margin: 5px 0; font-size: 18px; }
    .header-details { display: flex; justify-content: space-between; margin-top: 15px; border-bottom: 2px solid #3574E2; padding-bottom: 10px; }
    .header-details div { font-size: 13px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h2>${escapeHtml(title)}</h2>
  </div>
  <div class="header-details">
    <div>GSTIN: ${escapeHtml(gstin || 'N/A')}</div>
    <div>Financial Year: ${escapeHtml(financialYear || 'N/A')}</div>
  </div>
  ${tableHtml}
  <div style="margin-top: 40px; text-align: right; font-size: 11px; color: #666;">
    Generated securely by ITaxEasy App
  </div>
</body>
</html>`;
}

export const previewGSTRPdf = async (input: BuildPdfInput) => {
  try {
    const html = buildGSTRPdfHtml(input);

    if (Platform.OS === "web") {
      const printWindow = window.open("", "_blank", "width=1024,height=768");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };
      }
      return;
    }

    const result = await Print.printToFileAsync({ html });
    const fileUri = result.uri;

    let opened = false;
    try {
      if (Platform.OS === 'android') {
        let targetUri = fileUri;
        if (targetUri.startsWith('file://')) {
          targetUri = await FileSystem.getContentUriAsync(targetUri);
        }
        try {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: targetUri,
            flags: 1,
            type: 'application/pdf',
          });
          opened = true;
        } catch (intentErr) {
          const supported = await Linking.canOpenURL(targetUri);
          if (supported) {
            await Linking.openURL(targetUri);
            opened = true;
          } else {
            throw intentErr;
          }
        }
      } else {
        const supported = await Linking.canOpenURL(fileUri);
        if (supported) {
          await Linking.openURL(fileUri);
          opened = true;
        }
      }
    } catch (e: any) {
      console.warn("Direct view failed, falling back to Share:", e);
    }

    if (!opened) {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { dialogTitle: "View GSTR PDF" });
      } else {
        await Print.printAsync({ html });
      }
    }
  } catch (error) {
    console.error("Error previewing PDF:", error);
    Alert.alert("Error", "Failed to open PDF preview. Please try again.");
  }
};
