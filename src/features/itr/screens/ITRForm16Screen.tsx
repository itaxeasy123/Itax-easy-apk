import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Sharing from "expo-sharing";
import * as IntentLauncher from "expo-intent-launcher";
import * as FileSystem from "expo-file-system/legacy";

import { useITRStore } from "../../../store/itrStore";
import { itrColors, itrRadius, itrShadows, itrSpacing, itrTypography } from "../../../theme/itr";
import { ITRBottomNav, ITRHeader } from "../components";
import { extractForm16FromAsset } from "../services/form16Extraction.service";
import { exportITRData } from "../services/itrExport.service";

type ResultRowProps = {
  label: string;
  value?: string | number | null;
};

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

function ResultRow({ label, value }: ResultRowProps) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value?.toString() || "—"}</Text>
    </View>
  );
}

export default function ITRForm16Screen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] =
    useState<Awaited<ReturnType<typeof extractForm16FromAsset>> | null>(null);

  const {
    salary,
    houseProperty,
    otherSources,
    deductions,
    taxesPaid,
    interests,
    regime,
    form16,
    setForm16,
    setSalary,
    setHouseProperty,
    setOtherSources,
    setDeductions,
    setTaxesPaid,
    resetITR,
    setAssessmentYear,
  } = useITRStore();

  useEffect(() => {
    if (!form16) {
      setParseResult(null);
      setSelectedFileName(null);
      return;
    }

    setParseResult({
      fileName: form16.fileName,
      source: form16.source as "pdf",
      importedAt: form16.importedAt,
      rawText: form16.rawText,
      employeeName: form16.employeeName,
      employeePan: form16.employeePan,
      employerPan: form16.employerPan,
      tan: form16.tan,
      assessmentYear: form16.assessmentYear,
      employerName: form16.employerName,
      grossSalary: form16.grossSalary,
      grossTotalIncome: form16.grossTotalIncome,
      salaryChargeable: form16.salaryChargeable,
      housePropertyIncome: form16.housePropertyIncome,
      standardDeduction: form16.standardDeduction,
      otherIncome: form16.otherIncome,
      taxableIncome: form16.taxableIncome,
      taxOnTotalIncome: form16.taxOnTotalIncome,
      rebateUnderSection87A: form16.rebateUnderSection87A,
      surcharge: form16.surcharge,
      healthAndEducationCess: form16.healthAndEducationCess,
      taxPayable: form16.taxPayable,
      netTaxPayable: form16.netTaxPayable,
      totalAmountPaid: form16.totalAmountPaid,
      totalAmountCredited: form16.totalAmountCredited,
      totalTaxDeducted: form16.totalTaxDeducted,
      totalTaxDeposited: form16.totalTaxDeposited,
      section80C: form16.section80C,
      section80D: form16.section80D,
      section80CCD1B: form16.section80CCD1B,
      chapterVIDeductionTotal: form16.chapterVIDeductionTotal,
      tdsSalary: form16.tdsSalary,
      taxRegime: form16.taxRegime,
      confidence: form16.employeePan || form16.assessmentYear ? "medium" : "low",
      warnings: [],
    });

    setSelectedFileName(form16.fileName);
  }, [form16]);

  const parsedSummary = useMemo(() => {
    if (!parseResult) return null;

    return {
      employeeName: parseResult.employeeName || "—",
      pan: parseResult.employeePan || "—",
      employerPan: parseResult.employerPan || "—",
      tan: parseResult.tan || "—",
      ay: parseResult.assessmentYear || "—",
      employer: parseResult.employerName || "—",
      grossSalary: parseResult.grossSalary || 0,
      grossTotalIncome: parseResult.grossTotalIncome || 0,
      chargeableSalary: parseResult.salaryChargeable || 0,
      standardDeduction: parseResult.standardDeduction || 0,
      otherIncome: parseResult.otherIncome || 0,
      taxableIncome: parseResult.taxableIncome || 0,
      taxOnTotalIncome: parseResult.taxOnTotalIncome || 0,
      rebateUnderSection87A: parseResult.rebateUnderSection87A || 0,
      surcharge: parseResult.surcharge || 0,
      healthAndEducationCess: parseResult.healthAndEducationCess || 0,
      taxPayable: parseResult.taxPayable || 0,
      netTaxPayable: parseResult.netTaxPayable || 0,
      totalAmountPaid: parseResult.totalAmountPaid || 0,
      totalAmountCredited: parseResult.totalAmountCredited || 0,
      totalTaxDeducted: parseResult.totalTaxDeducted || 0,
      totalTaxDeposited: parseResult.totalTaxDeposited || 0,
      section80C: parseResult.section80C || 0,
      section80D: parseResult.section80D || 0,
      section80CCD1B: parseResult.section80CCD1B || 0,
      chapterVIDeductionTotal: parseResult.chapterVIDeductionTotal || 0,
      taxRegime: parseResult.taxRegime || "—",
      confidence: parseResult.confidence,
    };
  }, [parseResult]);

  const importParsedResult = (
    parsed: Awaited<ReturnType<typeof extractForm16FromAsset>>,
    fileName?: string,
    fileUri?: string,
  ) => {
    setParseResult(parsed);

    setForm16({
      fileName: fileName ?? parsed.fileName,
      fileUri: fileUri,
      source: parsed.source,
      rawText: parsed.rawText,
      employeeName: parsed.employeeName,
      employeePan: parsed.employeePan,
      employerPan: parsed.employerPan,
      tan: parsed.tan,
      assessmentYear: parsed.assessmentYear,
      grossSalary: parsed.grossSalary,
      grossTotalIncome: parsed.grossTotalIncome,
      salaryChargeable: parsed.salaryChargeable,
      standardDeduction: parsed.standardDeduction,
      otherIncome: parsed.otherIncome,
      taxableIncome: parsed.taxableIncome,
      taxOnTotalIncome: parsed.taxOnTotalIncome,
      rebateUnderSection87A: parsed.rebateUnderSection87A,
      surcharge: parsed.surcharge,
      healthAndEducationCess: parsed.healthAndEducationCess,
      taxPayable: parsed.taxPayable,
      netTaxPayable: parsed.netTaxPayable,
      totalAmountPaid: parsed.totalAmountPaid,
      totalAmountCredited: parsed.totalAmountCredited,
      totalTaxDeducted: parsed.totalTaxDeducted,
      totalTaxDeposited: parsed.totalTaxDeposited,
      section80C: parsed.section80C,
      section80D: parsed.section80D,
      section80CCD1B: parsed.section80CCD1B,
      chapterVIDeductionTotal: parsed.chapterVIDeductionTotal,
      tdsSalary: parsed.totalTaxDeducted || 0,
      employerName: parsed.employerName,
      taxRegime: parsed.taxRegime,
      importedAt: new Date().toISOString(),
    });

    if (parsed.grossSalary || parsed.salaryChargeable) {
      setSalary({
        grossTotal: parsed.grossSalary || 0,
        netSalary: parsed.salaryChargeable || 0,
      });
    }

    if (parsed.housePropertyIncome) {
      setHouseProperty({ incomeFromHP: parsed.housePropertyIncome });
    }

    if (parsed.otherIncome) {
      setOtherSources({ totalOtherIncome: parsed.otherIncome });
    }

    setDeductions({
      section80C: parsed.section80C ? String(parsed.section80C) : "",
      section80D: parsed.section80D ? String(parsed.section80D) : "",
      section80CCD1B: parsed.section80CCD1B ? String(parsed.section80CCD1B) : "",
      totalDeductions: parsed.chapterVIDeductionTotal || 0,
    });

    setTaxesPaid({
      tdsSalary: parsed.totalTaxDeducted || 0,
    });

    if (parsed.assessmentYear) {
      setAssessmentYear(parsed.assessmentYear);
    }
  };

  const pickFile = async () => {
    try {
      setLoading(true);
      setParseResult(null);
      setSelectedFileName(null);

      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: "*/*",
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const isPdf = asset.mimeType?.includes("pdf") || asset.name?.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        Alert.alert(
          "PDF required",
          "This Form 16 import endpoint accepts only the official Form 16 PDF. Please upload the PDF issued by your employer.",
        );
        return;
      }

      setSelectedFileName(asset.name ?? "Form16.pdf");

      const parsed = await extractForm16FromAsset({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
      });

      if (parsed.assessmentYear && parsed.assessmentYear !== "2025-26") {
        Alert.alert(
          "Unsupported Assessment Year",
          `This Form 16 appears to be for AY ${parsed.assessmentYear}. Our system currently only supports AY 2025-26. The import has been rejected.`,
          [{ text: "OK" }],
        );
        return;
      }

      importParsedResult(parsed, asset.name, asset.uri);
    } catch (err: any) {
      console.error("FORM16 IMPORT ERROR:", err);
      Alert.alert(
        "Import failed",
        err instanceof Error
          ? err.message
          : "Unable to read this file. Please upload the official Form 16 PDF.",
      );
    } finally {
      setLoading(false);
    }
  };

  const applyToItr = () => {
    if (!parseResult) return;
    Alert.alert("Form 16 imported", "The extracted values were saved to your ITR draft.");
    router.navigate("/itr/manual");
  };

  const handleDownloadJson = async () => {
    const payload = {
      form16,
      salary,
      houseProperty,
      otherSources,
      deductions,
      taxesPaid,
      interests,
      regime,
    };

    await exportITRData(payload);
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Form 16 data",
      "This will clear the imported Form 16 data from the app. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetITR();
            setParseResult(null);
            setSelectedFileName(null);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <ITRHeader title="Form 16 Import" titleVariant="plain" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Ionicons name="document-text-outline" size={42} color={itrColors.primary} />
          <Text style={styles.heroTitle}>Upload Form 16</Text>
          <Text style={styles.heroSubtext}>
            Upload the official employer-issued Form 16 PDF. This API does not accept images.
          </Text>

          <Pressable style={styles.uploadButton} onPress={pickFile}>
            <Text style={styles.uploadButtonText}>Choose PDF</Text>
          </Pressable>

          {selectedFileName ? <Text style={styles.selectedFile}>{selectedFileName}</Text> : null}
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={itrColors.primary} />
            <Text style={styles.loadingText}>Reading Form 16...</Text>
          </View>
        ) : null}

        {parseResult ? (
          <View style={styles.resultCard}>
            <Text style={styles.sectionTitle}>Form 16 Extracted</Text>
            
            <Pressable 
              style={styles.pdfPreviewCard} 
              onPress={async () => {
                try {
                  if (form16?.fileUri) {
                    let opened = false;
                    try {
                      if (Platform.OS === 'android') {
                        let targetUri = form16.fileUri;
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
                          // Try Linking as fallback for contentUri
                          const supported = await Linking.canOpenURL(targetUri);
                          if (supported) {
                            await Linking.openURL(targetUri);
                            opened = true;
                          } else {
                            throw intentErr;
                          }
                        }
                      } else {
                        // iOS / Web
                        const supported = await Linking.canOpenURL(form16.fileUri);
                        if (supported) {
                          await Linking.openURL(form16.fileUri);
                          opened = true;
                        }
                      }
                    } catch (e: any) {
                      Alert.alert("View Failed", `Could not view directly: ${e?.message || String(e)}. Falling back to Share.`);
                    }

                    if (!opened) {
                      // Fallback: If unable to view directly, use share dialog
                      const isAvailable = await Sharing.isAvailableAsync();
                      if (isAvailable) {
                        await Sharing.shareAsync(form16.fileUri, { dialogTitle: "Open PDF with..." });
                      } else {
                        Alert.alert("Error", "No PDF viewer or sharing option is available on this device.");
                      }
                    }
                  } else {
                    Alert.alert("File not found", "Could not locate the PDF file to open.");
                  }
                } catch (e) {
                  Alert.alert("Error", "Failed to open PDF file.");
                }
              }}
            >
              <View style={styles.pdfIconWrapper}>
                <Ionicons name="document-text" size={32} color="#EF4444" />
              </View>
              <View style={styles.pdfPreviewInfo}>
                <Text style={styles.pdfPreviewName} numberOfLines={1}>{form16?.fileName}</Text>
                <Text style={styles.pdfPreviewSub}>Tap to view PDF</Text>
              </View>
              <Ionicons name="open-outline" size={22} color="#64748B" />
            </Pressable>

              <View style={styles.actionRow}>
                <Pressable style={styles.secondaryActionButton} onPress={handleDownloadJson}>
                  <Text style={styles.secondaryActionText}>Download JSON</Text>
                </Pressable>
                <Pressable style={styles.resetActionButton} onPress={handleReset}>
                  <Text style={styles.resetActionText}>Reset</Text>
                </Pressable>
              </View>


            {parseResult.warnings.length ? (
              <View style={styles.warningBox}>
                {parseResult.warnings.map((warning) => (
                  <Text key={warning} style={styles.warningText}>
                    • {warning}
                  </Text>
                ))}
              </View>
            ) : null}

            <Pressable style={styles.applyButton} onPress={applyToItr}>
              <Text style={styles.applyButtonText}>Apply to ITR</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>What gets filled later</Text>
          <Text style={styles.noteText}>
            This flow can prefill salary, tax deducted, house property, other income and Chapter VI-A
            deductions from Form 16. You can still review and edit everything in Manual Fill ITR.
          </Text>
        </View>
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: itrColors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: itrSpacing.md + 4,
    paddingTop: itrSpacing.lg,
    paddingBottom: 112,
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: itrColors.surface,
    borderColor: itrColors.borderSoft,
    borderRadius: itrRadius.xl,
    borderWidth: 1,
    paddingHorizontal: itrSpacing.lg,
    paddingVertical: itrSpacing.xl,
    ...itrShadows.card,
  },
  heroTitle: {
    color: itrColors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: itrSpacing.sm,
  },
  heroSubtext: {
    color: itrColors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: itrSpacing.sm,
    textAlign: "center",
  },
  uploadButton: {
    alignItems: "center",
    backgroundColor: itrColors.primary,
    borderRadius: itrRadius.pill,
    marginTop: itrSpacing.lg,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: itrSpacing.xl,
    width: "100%",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: itrTypography.button.fontSize,
    fontWeight: itrTypography.button.fontWeight,
  },
  selectedFile: {
    color: itrColors.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: itrSpacing.md,
  },
  loadingCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: itrColors.borderSoft,
    borderRadius: itrRadius.xl,
    borderWidth: 1,
    marginTop: itrSpacing.md,
    paddingVertical: itrSpacing.xl,
    ...itrShadows.card,
  },
  loadingText: {
    color: itrColors.textSecondary,
    fontSize: 14,
    marginTop: itrSpacing.sm,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderColor: itrColors.borderSoft,
    borderRadius: itrRadius.xl,
    borderWidth: 1,
    marginTop: itrSpacing.lg,
    padding: itrSpacing.lg,
    ...itrShadows.card,
  },
  sectionTitle: {
    color: itrColors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: itrSpacing.sm,
  },
  subSectionTitle: {
    color: itrColors.text,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: itrSpacing.sm,
  },
  pdfPreviewCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 6,
  },
  pdfIconWrapper: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 10,
    marginRight: 14,
  },
  pdfPreviewInfo: {
    flex: 1,
    marginRight: 10,
  },
  pdfPreviewName: {
    color: "#1E293B",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  pdfPreviewSub: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  summaryMetaRow: {
    flexDirection: "row",
    gap: itrSpacing.sm,
    marginBottom: itrSpacing.md,
  },
  summaryMetaChip: {
    backgroundColor: "#F8FBFF",
    borderColor: "#D8E4F8",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryMetaLabel: {
    color: itrColors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  summaryMetaValue: {
    color: itrColors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  sectionBlock: {
    backgroundColor: "#FCFDFF",
    borderColor: "#E6EEF9",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: itrSpacing.md,
    padding: itrSpacing.md,
  },

  finalCard: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: itrSpacing.md,
    padding: itrSpacing.md,
  },
  finalValue: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 2,
  },
  finalValuePositive: {
    color: "#16A34A",
  },
  finalValueNegative: {
    color: "#DC2626",
  },
  actionRow: {
    flexDirection: "row",
    gap: itrSpacing.sm,
    marginTop: itrSpacing.md,
  },
  secondaryActionButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: itrRadius.md,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: itrSpacing.md,
  },
  secondaryActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  resetActionButton: {
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderRadius: itrRadius.md,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: itrSpacing.md,
  },
  resetActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  resultRow: {
    borderBottomColor: "#EEF2F7",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  resultLabel: {
    color: "#475569",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    paddingRight: itrSpacing.md,
  },
  resultValue: {
    color: itrColors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  warningBox: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: itrSpacing.md,
    padding: itrSpacing.md,
  },
  warningText: {
    color: "#9A3412",
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 4,
  },
  applyButton: {
    alignItems: "center",
    backgroundColor: "#10B981",
    borderRadius: itrRadius.md,
    marginTop: itrSpacing.lg,
    minHeight: 48,
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  noteCard: {
    backgroundColor: "#F8FBFF",
    borderColor: "#D5E3FA",
    borderRadius: itrRadius.xl,
    borderWidth: 1,
    marginTop: itrSpacing.lg,
    padding: itrSpacing.lg,
  },
  noteTitle: {
    color: itrColors.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  noteText: {
    color: itrColors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
