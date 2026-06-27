import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Alert, Platform, Linking } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";

type PdfSummary = Record<string, any>;

type BuildPdfInput = {
  form: any;
  summary: PdfSummary;
  assessmentYear?: string;
  storeData?: any;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatINR = (value: unknown) => `&#8377;${currencyFormatter.format(Number(value || 0))}`;

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getAssessmentYear = (input: BuildPdfInput) => "2025-26";

const getFinancialYearLabel = (assessmentYear: string) => {
  const match = assessmentYear.match(/^(\d{4})-(\d{2})$/);
  if (!match) return "";

  const startYear = Number(match[1]);
  if (!Number.isFinite(startYear)) return "";

  const endYear = String(startYear).slice(-2);
  return `FY ${startYear - 1}-${endYear}`;
};

const toAmount = (value: unknown) => Math.round(Number(value || 0));

const printHtmlOnWeb = (html: string) => {
  if (typeof window === "undefined") {
    throw new Error("Printing is only available in the browser.");
  }

  const printWindow = window.open("", "_blank", "width=1024,height=768");

  if (!printWindow) {
    throw new Error("Unable to open the print window.");
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

export function buildItrReturnPdfHtml(input: BuildPdfInput) {
  const assessmentYear = getAssessmentYear(input);
  const financialYear = getFinancialYearLabel(assessmentYear);
  const { form, summary } = input;

  const name = escapeHtml(form?.personalInfo?.name || [form?.personalInfo?.firstName, form?.personalInfo?.middleName, form?.personalInfo?.lastName].filter(Boolean).join(" "));
  const pan = escapeHtml(form?.personalInfo?.pan || "");
  const aadhaar = escapeHtml(form?.personalInfo?.aadhaar || "");
  const regime = escapeHtml(form?.personalInfo?.regime === 'old' ? 'Old Regime' : '115BAC');
  const addressParts = [
    form?.contactDetails?.flatDoorBlockNo,
    form?.contactDetails?.addressLine1,
    form?.contactDetails?.buildingVillage,
    form?.contactDetails?.addressLine2,
    form?.contactDetails?.roadStreetPostOffice,
    form?.contactDetails?.areaLocality,
    form?.contactDetails?.cityTownDistrict || form?.contactDetails?.townCityDistrict,
    form?.contactDetails?.state,
    form?.contactDetails?.pincode || form?.contactDetails?.pinCode,
  ].filter(Boolean);

  const address = escapeHtml([...new Set(addressParts)].join(", "));
  const dob = escapeHtml(form?.personalInfo?.dob || "-");
  const fatherName = escapeHtml(form?.personalInfo?.fatherName || "-");

  const salaryIncome = toAmount(form?.income?.salary);
  const housePropertyIncome = toAmount(form?.income?.houseProperty);
  const businessIncome = toAmount(form?.income?.businessProfession);
  const capitalGainsIncome = toAmount(form?.income?.capitalGains);
  const otherSourcesIncome = toAmount(form?.income?.otherSources);
  const grossTotalIncome = toAmount(summary?.grossTotalIncome ?? form?.income?.grossTotalIncome);
  const totalDeductions = toAmount(form?.deductions?.totalDeductions);
  const totalIncome = toAmount(summary?.taxableIncome ?? form?.income?.taxableIncome);
  
  const taxOnTotalIncome = toAmount(summary?.taxPayableOnTotalIncome ?? summary?.tax);
  const rebate = toAmount(summary?.rebate);
  const taxAfterRebate = toAmount(summary?.taxAfterRebate ?? (taxOnTotalIncome - rebate > 0 ? taxOnTotalIncome - rebate : 0));
  const surcharge = toAmount(summary?.surcharge);
  const cess = toAmount(summary?.cess);
  const taxWithCess = toAmount(summary?.taxOnTotalIncome ?? (taxAfterRebate + surcharge + cess));
  const totalPaid = toAmount(summary?.totalPaid ?? form?.taxesPaid?.totalPaid);
  
  // Directly compute refund/payable from the exact values displayed in the PDF
  const refundDue = Math.max(totalPaid - taxWithCess, 0);
  const taxPayable = Math.max(taxWithCess - totalPaid, 0);

  const renderRow = (label: string, inner?: number | string | null, outer?: number | string | null, isBold = false, isIndent = false) => {
    if (!inner && !outer && inner !== 0 && outer !== 0) return '';
    return `
      <div class="item-row ${isBold ? 'bold' : ''}">
        <div style="flex: 1" class="${isIndent ? 'indent-1' : ''}">${escapeHtml(label)}</div>
        <div class="inner-amount">${inner || inner === 0 ? currencyFormatter.format(Number(inner)) : ''}</div>
        <div class="outer-amount">${outer || outer === 0 ? currencyFormatter.format(Number(outer)) : ''}</div>
      </div>
    `;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ITR Computation</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
    }
    .sheet { max-width: 100%; padding: 10px; }
    .text-center { text-align: center; }
    .bold { font-weight: bold; }
    h2 { font-size: 14px; margin: 5px 0; text-align: center; }
    .header-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px; }
    .row { display: flex; margin-bottom: 4px; }
    .col-label { width: 100px; font-weight: bold; }
    .col-colon { width: 10px; }
    .col-value { flex: 1; }
    .main-heading { border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; margin: 15px 0 5px 0; font-size: 12px; }
    .amount-header { display: flex; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 5px; }
    .head-blue { color: #000080; font-weight: bold; text-decoration: underline; margin-top: 15px; margin-bottom: 8px; display: block; }
    .head-blue::before { content: "■ "; font-size: 9px; vertical-align: middle; text-decoration: none; display: inline-block; }
    .item-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .inner-amount { width: 100px; text-align: right; padding-right: 10px; }
    .outer-amount { width: 100px; text-align: right; }
    .indent-1 { padding-left: 15px; }
    .indent-2 { padding-left: 30px; }
    .line-bottom { border-bottom: 1px solid #000; padding-bottom: 4px; }
    .line-top { border-top: 1px solid #000; padding-top: 4px; }
    .line-double { border-bottom: 3px double #000; padding-bottom: 4px; }
    .mt-2 { margin-top: 12px; }
    .footer { margin-top: 60px; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="sheet">
    <h2>A.Y. ${escapeHtml(assessmentYear)}</h2>
    
    <div class="header-grid">
      <div>
        <div class="row"><div class="col-label">Name</div><div class="col-colon">:</div><div class="col-value">${name}</div></div>
        <div class="row"><div class="col-label">Father's Name</div><div class="col-colon">:</div><div class="col-value">${fatherName}</div></div>
        <div class="row"><div class="col-label">Address</div><div class="col-colon">:</div><div class="col-value">${address || '-'}</div></div>
      </div>
      <div>
        <div class="row"><div class="col-label">Previous Year</div><div class="col-colon">:</div><div class="col-value">${escapeHtml(financialYear ? financialYear.replace('FY ', '') : '')}</div></div>
        <div class="row"><div class="col-label">PAN</div><div class="col-colon">:</div><div class="col-value">${pan}</div></div>
        <div class="row"><div class="col-label">Aadhaar No.</div><div class="col-colon">:</div><div class="col-value">${aadhaar || '-'}</div></div>
        <div class="row"><div class="col-label">Date of Birth</div><div class="col-colon">:</div><div class="col-value">${dob}</div></div>
        <div class="row"><div class="col-label">Status</div><div class="col-colon">:</div><div class="col-value">Individual</div></div>
        <div class="row"><div class="col-label">Tax u/s</div><div class="col-colon">:</div><div class="col-value">${regime}</div></div>
      </div>
    </div>

    <div class="main-heading">Statement of Income</div>
    
    <div class="amount-header">
      <div style="flex: 1"></div>
      <div class="inner-amount">Rs.</div>
      <div class="outer-amount">Rs.</div>
    </div>

    ${salaryIncome ? `
      <span class="head-blue">Income from Salary</span>
      ${renderRow('Income from Salary', null, salaryIncome)}
    ` : ''}

    ${housePropertyIncome ? `
      <span class="head-blue">Income from House Property</span>
      ${renderRow('Income from House Property', null, housePropertyIncome)}
    ` : ''}

    ${businessIncome ? `
      <span class="head-blue">Profits and gains of Business or Profession</span>
      ${renderRow('Net Profit as per P&L a/c', businessIncome, null, false, true)}
      ${renderRow('Total Income of Business and Profession', null, businessIncome, false, true)}
    ` : ''}

    ${capitalGainsIncome ? `
      <span class="head-blue">Capital Gains</span>
      ${renderRow('Income from Capital Gains', null, capitalGainsIncome)}
    ` : ''}

    ${otherSourcesIncome ? `
      <span class="head-blue">Income from other sources</span>
      ${renderRow('Income from other sources', null, otherSourcesIncome)}
    ` : ''}

    <div class="mt-2"></div>
    ${renderRow('Gross Total Income', null, grossTotalIncome, true)}
    ${renderRow('Less: Chapter VI-A Deductions', null, totalDeductions)}
    
    <div class="item-row bold line-top line-bottom mt-2">
      <div style="flex: 1">Total Income</div>
      <div class="inner-amount"></div>
      <div class="outer-amount">${currencyFormatter.format(totalIncome)}</div>
    </div>

    <div class="mt-2"></div>
    ${renderRow('Tax on total income', null, taxOnTotalIncome)}
    ${rebate > 0 ? renderRow('Less: Rebate u/s 87A', null, rebate) : ''}
    ${surcharge > 0 ? renderRow('Add: Surcharge', null, surcharge) : ''}
    ${renderRow('Add: Cess', null, cess)}
    
    <div class="item-row line-bottom">
      <div style="flex: 1">Tax with cess</div>
      <div class="inner-amount"></div>
      <div class="outer-amount">${currencyFormatter.format(taxWithCess)}</div>
    </div>
    
    ${renderRow('TDS / TCS / Advance Tax', null, totalPaid)}
    
    ${refundDue > 0 ? `
    <div class="item-row bold line-bottom line-double mt-2">
      <div style="flex: 1"><span class="head-blue" style="margin:0; text-decoration:none;">Refund Due</span></div>
      <div class="inner-amount"></div>
      <div class="outer-amount">${currencyFormatter.format(refundDue)}</div>
    </div>
    ` : `
    <div class="item-row bold line-bottom line-double mt-2">
      <div style="flex: 1"><span class="head-blue" style="margin:0; text-decoration:none;">Tax Payable</span></div>
      <div class="inner-amount"></div>
      <div class="outer-amount">${currencyFormatter.format(taxPayable)}</div>
    </div>
    `}

    <!-- Detailed Schedules -->
    ${form?.otherSourcesDetails?.savingBankInterest || form?.otherSourcesDetails?.fixedDepositInterest ? `
    <div style="page-break-before: always;"></div>
    <div class="bold mt-2" style="font-size:12px;">Schedule 1</div>
    <div class="bold" style="text-decoration: underline; margin-bottom: 8px;">Interest income (other than NSC/KVP interest)</div>
    <div style="border-bottom: 1px solid #000; border-top: 1px solid #000; display: flex; padding: 4px 0; font-weight: bold;">
      <div style="flex: 2;">Name of the Bank / Source</div>
      <div style="flex: 1; text-align: right;">Interest</div>
    </div>
    ${form.otherSourcesDetails.fixedDepositInterest ? `
    <div style="display: flex; padding: 4px 0; border-bottom: 1px solid #ccc;">
      <div style="flex: 2;">Interest on Time Deposits</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(form.otherSourcesDetails.fixedDepositInterest))}</div>
    </div>` : ''}
    ${form.otherSourcesDetails.savingBankInterest ? `
    <div style="display: flex; padding: 4px 0; border-bottom: 1px solid #ccc;">
      <div style="flex: 2;">Interest on Savings A/c</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(form.otherSourcesDetails.savingBankInterest))}</div>
    </div>` : ''}
    ` : ''}

    ${form?.otherSourcesDetails?.row1Amount || form?.otherSourcesDetails?.row2Amount ? `
    <div class="bold mt-2" style="font-size:12px;">Schedule 2</div>
    <div class="bold" style="text-decoration: underline; margin-bottom: 8px;">Income from plant & machinery etc. / Other</div>
    <div style="border-bottom: 1px solid #000; border-top: 1px solid #000; display: flex; padding: 4px 0; font-weight: bold;">
      <div style="flex: 2;">Income details</div>
      <div style="flex: 1; text-align: right;">Amount</div>
    </div>
    ${form.otherSourcesDetails.row1Amount ? `
    <div style="display: flex; padding: 4px 0; border-bottom: 1px solid #ccc;">
      <div style="flex: 2;">${escapeHtml(form.otherSourcesDetails.row1Nature || 'Other')}</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(form.otherSourcesDetails.row1Amount))}</div>
    </div>` : ''}
    ${form.otherSourcesDetails.row2Amount ? `
    <div style="display: flex; padding: 4px 0; border-bottom: 1px solid #ccc;">
      <div style="flex: 2;">${escapeHtml(form.otherSourcesDetails.row2Nature || 'Other')}</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(form.otherSourcesDetails.row2Amount))}</div>
    </div>` : ''}
    ` : ''}

    ${input.storeData?.taxesPaid?.tdsNonSalaryEntries?.length > 0 || input.storeData?.taxesPaid?.tdsSalaryEntries?.length > 0 ? `
    <div style="page-break-before: always;"></div>
    <div class="bold mt-2" style="font-size:12px;">Schedule 3</div>
    <div class="bold" style="text-decoration: underline; margin-bottom: 8px;">TDS as per Form 16/16A/27D</div>
    <div style="border-bottom: 1px solid #000; border-top: 1px solid #000; display: flex; padding: 4px 0; font-weight: bold; text-align: center;">
      <div style="flex: 2; text-align: left;">Deductor TAN & Name</div>
      <div style="flex: 1;">TDS deducted</div>
      <div style="flex: 1;">TDS claimed</div>
      <div style="flex: 1;">Gross receipt offered</div>
    </div>
    ${(input.storeData.taxesPaid.tdsSalaryEntries || []).map((entry: any) => `
    <div style="display: flex; padding: 4px 0; border-bottom: 1px solid #ccc;">
      <div style="flex: 2;">${escapeHtml(entry.employerName)}, TAN: ${escapeHtml(entry.tan)}</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(entry.taxAmount || 0))}</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(entry.taxAmount || 0))}</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(entry.salaryIncome || 0))}</div>
    </div>`).join('')}
    ${(input.storeData.taxesPaid.tdsNonSalaryEntries || []).map((entry: any) => `
    <div style="display: flex; padding: 4px 0; border-bottom: 1px solid #ccc;">
      <div style="flex: 2;">${escapeHtml(entry.name)}, TAN: ${escapeHtml(entry.tanPan)}</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(entry.taxAmount || 0))}</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(entry.taxAmount || 0))}</div>
      <div style="flex: 1; text-align: right;">${currencyFormatter.format(Number(entry.amountPaid || 0))}</div>
    </div>`).join('')}
    ` : ''}

    ${form?.bankDetails ? `
    <div class="bold mt-2" style="font-size:12px;">Bank A/cs</div>
    <div class="bold" style="text-decoration: underline; margin-bottom: 8px;">Bank Accounts in India</div>
    <div style="border-bottom: 1px solid #000; border-top: 1px solid #000; display: flex; padding: 4px 0; font-weight: bold;">
      <div style="flex: 2;">Bank Name and Account No.</div>
      <div style="flex: 1;">IFSC Code</div>
      <div style="flex: 1; text-align:center;">Type of Account</div>
      <div style="flex: 1; text-align:center;">For refund?</div>
    </div>
    <div style="display: flex; padding: 4px 0; border-bottom: 1px solid #ccc;">
      <div style="flex: 2;">${escapeHtml(form.bankDetails.bankName)} : ${escapeHtml(form.bankDetails.accountNumber)}</div>
      <div style="flex: 1;">${escapeHtml(form.bankDetails.ifsc)}</div>
      <div style="flex: 1; text-align:center;">${escapeHtml(form.bankDetails.accountType)}</div>
      <div style="flex: 1; text-align:center;">Yes</div>
    </div>
    ` : ''}

    <div class="footer">
      <div>
        <div style="margin-bottom: 4px;">Date : </div>
        <div>Place : </div>
      </div>
      <div class="bold">[ ${name.toUpperCase()} ]</div>
    </div>
  </div>
</body>
</html>`;
}

export const previewITRPdf = async (input: BuildPdfInput) => {
  try {
    const html = buildItrReturnPdfHtml(input);

    if (Platform.OS === "web") {
      printHtmlOnWeb(html);
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
        await Sharing.shareAsync(fileUri, { dialogTitle: "View ITR PDF" });
      } else {
        await Print.printAsync({ html });
      }
    }
  } catch (error) {
    console.error("Error previewing PDF:", error);
    Alert.alert("Error", "Failed to open PDF preview. Please try again.");
  }
};

export const downloadITRPdf = async (input: BuildPdfInput) => {
  try {
    const html = buildItrReturnPdfHtml(input);
    const assessmentYear = getAssessmentYear(input);
    const fileName = `ITR_Return_${assessmentYear}.pdf`;

    if (Platform.OS === "web") {
      printHtmlOnWeb(html);
      Alert.alert(
        "Download hint",
        "Use the browser print dialog to save the PDF as a file.",
      );
      return null;
    }

    const result = await Print.printToFileAsync({ html });
    const pdfBase64 = await FileSystem.readAsStringAsync(result.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (Platform.OS === "android") {
      try {
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permission.granted && permission.directoryUri) {
          const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permission.directoryUri,
            fileName.replace(/\.pdf$/i, ""),
            "application/pdf",
          );

          await FileSystem.writeAsStringAsync(targetUri, pdfBase64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          Alert.alert("PDF saved", "The file was downloaded to your selected folder.");
          return targetUri;
        }
      } catch (permissionError) {
        console.warn("Android PDF save via SAF failed, falling back to share:", permissionError);
      }
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        mimeType: "application/pdf",
        dialogTitle: fileName,
      });
    } else {
      Alert.alert("PDF ready", `Saved at: ${result.uri}`);
    }

    return result.uri;
  } catch (error) {
    console.error("Error downloading PDF:", error);
    Alert.alert("Error", "Failed to generate the PDF file. Please try again.");
    throw error;
  }
};

export const generateITRPdf = previewITRPdf;
