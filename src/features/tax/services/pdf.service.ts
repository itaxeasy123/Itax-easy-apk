import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

// Currency formatter
const formatINR = (num: number) =>
  `₹${Number(num || 0).toLocaleString("en-IN")}`;

// Web print
const printHtmlOnWeb = (html: string) => {
  if (typeof window === "undefined") {
    throw new Error("Printing is only available in browser");
  }

  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    throw new Error("Unable to open print window");
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

// MAIN FUNCTION
export const generatePDF = async (data: any) => {
  try {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body {
          font-family: Arial;
          padding: 20px;
          color: #333;
        }

        h1 {
          text-align: center;
          color: #2f66eb;
        }

        .card {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 15px;
          margin-top: 15px;
        }

        .title {
          font-weight: bold;
          margin-bottom: 10px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          margin: 6px 0;
        }

        /* ✅ BEST OPTION COLOR */
        .best {
          color: green;
          font-weight: bold;
        }

        /* TABLE */
        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        th, td {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: left;
        }

        td:first-child {
          width: 60%;
        }

        td:last-child {
          width: 40%;
          text-align: right;
        }

        th:last-child {
          text-align: right;
        }

        /* ✅ AMOUNT ALIGNMENT FIX */
       .amount {
  display: inline-block; /* 🔥 flex hatao */
  text-align: right;
  width: 100%;
}

.currency {
  margin-right: 1px; /* small gap */
}

.value {
  text-align: right;
}
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: gray;
        }
      </style>
    </head>

    <body>

      <h1>Advance Tax Calculator</h1>

      <!-- SUMMARY -->
      <div class="card">
        <div class="title">Summary</div>

        <div class="row">
          <span>Total Income</span>
          <span>${formatINR(data.totalIncome)}</span>
        </div>

        <div class="row">
          <span>Taxable Income</span>
          <span>${formatINR(data.taxableIncome)}</span>
        </div>

        <div class="row">
          <span>Total Tax</span>
          <span>${formatINR(data.tax)}</span>
        </div>

        <div class="row">
          <span>Cess (4%)</span>
          <span>${formatINR(data.cess)}</span>
        </div>

        <div class="row">
          <span><b>Total Tax Payable</b></span>
          <span><b>${formatINR(data.totalTax)}</b></span>
        </div>

        <div class="row">
          <span>Net Payable</span>
          <span>${formatINR(data.netPayable)}</span>
        </div>

        <div class="row">
          <span>Refund</span>
          <span>${formatINR(data.refund)}</span>
        </div>
      </div>

      <!-- PAYMENT DETAILS -->
      <div class="card">
        <div class="title">Payment Details</div>

        <div class="row">
          <span>TDS</span>
          <span>${formatINR(data.tds)}</span>
        </div>

        <div class="row">
          <span>Advance Paid</span>
          <span>${formatINR(data.advancePaid)}</span>
        </div>
      </div>

      <!-- REGIME -->
      <div class="card">
        <div class="title">Regime Comparison</div>

        <div class="row">
          <span>Old Regime</span>
          <span>${formatINR(data.oldTax)}</span>
        </div>

        <div class="row">
          <span>New Regime</span>
          <span>${formatINR(data.newTax)}</span>
        </div>

        <div class="row">
          <span><b>Best Option</b></span>
          <span class="best">
            ${data.bestRegime === "new" ? "New" : "Old"}
          </span>
        </div>
      </div>

      <!-- INSTALLMENTS -->
      <div class="card">
        <div class="title">Advance Tax Installments</div>

        <table>
          <tr>
            <th>Due Date</th>
            <th>Amount</th>
          </tr>

          <tr>
            <td>15 June</td>
            <td>
              <div class="amount">
                <span class="currency">₹</span>
                <span class="value">${Number(data.installments?.june || 0).toLocaleString("en-IN")}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td>15 September</td>
            <td>
              <div class="amount">
                <span class="currency">₹</span>
                <span class="value">${Number(data.installments?.september || 0).toLocaleString("en-IN")}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td>15 December</td>
            <td>
              <div class="amount">
                <span class="currency">₹</span>
                <span class="value">${Number(data.installments?.december || 0).toLocaleString("en-IN")}</span>
              </div>
            </td>
          </tr>

          <tr>
            <td>15 March</td>
            <td>
              <div class="amount">
                <span class="currency">₹</span>
                <span class="value">${Number(data.installments?.march || 0).toLocaleString("en-IN")}</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div class="footer">
        Generated by iTaxEasy • Smart Tax Planning Tool
      </div>

    </body>
    </html>
    `;

    if (Platform.OS === "web") {
      printHtmlOnWeb(html);
      return;
    }

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);

  } catch (error) {
    console.error("PDF Error:", error);
    throw new Error("PDF generation failed");
  }
};
