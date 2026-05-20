import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useITRStore } from "../../../store/itrStore";
import { itrColors, itrRadius, itrShadows, itrSpacing, itrTypography } from "../../../theme/itr";
import { ITRBottomNav, ITRHeader } from "../components";
import { extractForm16FromAsset } from "../services/form16Extraction.service";

type ResultRowProps = {
  label: string;
  value?: string | number | null;
};

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

  const { setForm16, setSalary, setHouseProperty, setOtherSources, setDeductions, setTaxesPaid } =
    useITRStore();

  const parsedSummary = useMemo(() => {
    if (!parseResult) return null;

    return {
      pan: parseResult.employeePan || "—",
      ay: parseResult.assessmentYear || "—",
      employer: parseResult.employerName || "—",
      grossSalary: parseResult.grossSalary || 0,
      chargeableSalary: parseResult.salaryChargeable || 0,
      tdsSalary: parseResult.tdsSalary || 0,
      confidence: parseResult.confidence,
    };
  }, [parseResult]);

  const importParsedResult = (
    parsed: Awaited<ReturnType<typeof extractForm16FromAsset>>,
    fileName?: string,
  ) => {
    setParseResult(parsed);

    setForm16({
      fileName: fileName ?? parsed.fileName,
      source: parsed.source,
      rawText: parsed.rawText,
      employeePan: parsed.employeePan,
      assessmentYear: parsed.assessmentYear,
      grossSalary: parsed.grossSalary,
      salaryChargeable: parsed.salaryChargeable,
      standardDeduction: parsed.standardDeduction,
      otherIncome: parsed.otherIncome,
      section80C: parsed.section80C,
      section80D: parsed.section80D,
      section80CCD1B: parsed.section80CCD1B,
      tdsSalary: parsed.tdsSalary,
      employerName: parsed.employerName,
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
    });

    setTaxesPaid({
      tdsSalary: parsed.tdsSalary || 0,
    });
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

      importParsedResult(parsed, asset.name ?? undefined);
    } catch (error) {
      console.error("FORM16 IMPORT ERROR:", error);
      Alert.alert(
        "Import failed",
        error instanceof Error
          ? error.message
          : "Unable to read this file. Please upload the official Form 16 PDF.",
      );
    } finally {
      setLoading(false);
    }
  };

  const applyToItr = () => {
    if (!parseResult) return;
    Alert.alert("Form 16 imported", "The extracted values were saved to your ITR draft.");
    router.push("/itr/manual");
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
            <Text style={styles.sectionTitle}>Extracted Summary</Text>
            <ResultRow label="PAN" value={parsedSummary?.pan} />
            <ResultRow label="Assessment Year" value={parsedSummary?.ay} />
            <ResultRow label="Employer" value={parsedSummary?.employer} />
            <ResultRow label="Gross Salary" value={parsedSummary?.grossSalary} />
            <ResultRow label="Chargeable Salary" value={parsedSummary?.chargeableSalary} />
            <ResultRow label="TDS Salary" value={parsedSummary?.tdsSalary} />
            <ResultRow label="Confidence" value={parsedSummary?.confidence} />

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
    fontSize: 16,
    fontWeight: "800",
    marginBottom: itrSpacing.sm,
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
