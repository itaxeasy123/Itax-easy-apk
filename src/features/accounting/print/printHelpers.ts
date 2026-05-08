import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export const formatINR = (value: number) => `Rs ${currencyFormatter.format(Number(value || 0))}`;

export const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export function buildA4Html(title: string, body: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { size: A4; margin: 16mm; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            background: #fff;
          }
          .sheet {
            width: 100%;
            min-height: 100%;
          }
          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 18px;
            padding-bottom: 12px;
            border-bottom: 2px solid #2563eb;
          }
          .title {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
          }
          .subtitle {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
          }
          .badge {
            font-size: 11px;
            font-weight: 700;
            color: #2563eb;
            border: 1px solid #bfdbfe;
            border-radius: 999px;
            padding: 6px 10px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
            background: #fff;
          }
          .cardTitle {
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: .4px;
            margin-bottom: 8px;
            font-weight: 700;
          }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 7px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          .row:last-child { border-bottom: 0; }
          .label { font-size: 11px; color: #64748b; }
          .value { font-size: 11px; font-weight: 700; color: #0f172a; text-align: right; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            font-size: 11px;
            text-align: left;
          }
          th { background: #f8fafc; }
          .totals {
            margin-top: 12px;
            display: flex;
            justify-content: flex-end;
          }
          .totalsBox {
            width: 250px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
          }
          .totalsRow {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 6px;
          }
          .totalsRow:last-child { margin-bottom: 0; }
          .totalsLabel { font-size: 11px; color: #64748b; }
          .totalsValue { font-size: 11px; font-weight: 700; }
          .footer {
            margin-top: 20px;
            font-size: 10px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="topbar">
            <div>
              <div class="title">${escapeHtml(title)}</div>
              <div class="subtitle">A4 print-ready form</div>
            </div>
            <div class="badge">ITaxEasy</div>
          </div>
          ${body}
        </div>
      </body>
    </html>
  `;
}

export async function exportHtmlToPdf(html: string, fileName = "document") {
  if (Platform.OS === "web") {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      throw new Error("Unable to open print window.");
    }
    popup.document.open();
    popup.document.write(html);
    popup.document.close();
    popup.onload = () => {
      popup.focus();
      popup.print();
    };
    return null;
  }

  const result = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: "application/pdf",
      dialogTitle: `${fileName}.pdf`,
    });
  }

  return result.uri;
}
