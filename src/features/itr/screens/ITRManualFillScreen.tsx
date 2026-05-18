import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useITRStore } from "../../../store/itrStore";
import {
  itrColors,
  itrShadows,
  itrSpacing
} from "../../../theme/itr";
import { calculateIncomeTax } from "../../taxCalculator/services/taxCalculator.service";
import { ITRBottomNav, ITRHeader, ITRSaveButton } from "../components";
import { exportITRData } from "../services/itrExport.service";

type SectionCardProps = {
  title: string;
  amount?: string;
  onPress?: () => void;
  titleStyle?: object;
  amountStyle?: object;
};

function SectionCard({ title, amount = "0.0", onPress, titleStyle, amountStyle }: SectionCardProps) {
  return (
    <Pressable style={styles.sectionCard} onPress={onPress}>
      <View style={styles.sectionCardRow}>
        <Text style={[styles.sectionCardTitle, titleStyle]} numberOfLines={1}>{title}</Text>
        <View style={styles.sectionCardRight}>
          <Text style={[styles.amountText, amountStyle]}>{amount}</Text>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={styles.chevron} />
        </View>
      </View>
    </Pressable>
  );
}

export default function ITRManualFillScreen() {
  const router = useRouter();
  const { 
    salary, houseProperty, otherSources, 
    businessProfession, capitalGains, deductions, 
    taxesPaid, interests, regime, setRegime, form16 
  } = useITRStore();

  const currentAY = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); 
    if (month >= 3) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  }, []);

  const [showRegimeModal, setShowRegimeModal] = useState(false);
  const selectedYearLabel = currentAY;

  const taxResults = useMemo(() => {
    const commonInputs = {
        salary: salary.netSalary + houseProperty.incomeFromHP + businessProfession.totalIncome + capitalGains.totalGains,
        otherIncome: otherSources.totalOtherIncome,
        deductions: deductions.totalDeductions,
        exemptions: deductions.totalExemptions,
        advanceTax: taxesPaid.advanceTax,
        tdsSalary: taxesPaid.tdsSalary,
        tdsNonSalary: taxesPaid.tdsNonSalary,
        tdsOther: taxesPaid.tdsOther,
    };

    const currentResult = calculateIncomeTax({ ...commonInputs, regime });
    const oldResult = calculateIncomeTax({ ...commonInputs, regime: "old" });
    const newResult = calculateIncomeTax({ ...commonInputs, regime: "new" });

    const totalInt = interests.totalInterests || 0;
    const grossTax = currentResult.totalTax + totalInt;
    const netLiability = grossTax - currentResult.totalPaid;

    return {
      grossTax,
      totalPaid: currentResult.totalPaid,
      net: netLiability,
      comparison: {
        old: oldResult.totalTax + totalInt,
        new: newResult.totalTax + totalInt,
      }
    };
  }, [salary, houseProperty, otherSources, businessProfession, capitalGains, deductions, taxesPaid, interests, regime]);

  const handleDownload = async () => {
    const fullData = {
      assessmentYear: selectedYearLabel,
      salary, houseProperty, otherSources, businessProfession, capitalGains, deductions, taxesPaid, interests, regime,
      timestamp: new Date().toISOString(),
    };
    await exportITRData(fullData);
  };

  return (
    <View style={styles.screen}>
      <ITRHeader
        title="Manually Fill ITR"
        rightContent={<Text style={styles.headerYear}>{`(${selectedYearLabel})`}</Text>}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.controlsGrid}>
          <View style={styles.controlsRow}>
            <View style={styles.pickerBtn}>
              <Ionicons name="calendar-outline" size={14} color={itrColors.primary} />
              <Text style={styles.pickerBtnText}>{selectedYearLabel}</Text>
            </View>

            <Pressable style={[styles.pickerBtn, styles.regimeBtn]} onPress={() => setShowRegimeModal(true)}>
              <Text style={styles.pickerBtnText}>{regime.toUpperCase()} Regime</Text>
              <Ionicons name="chevron-down" size={12} color="#64748B" />
            </Pressable>
          </View>

        <Pressable
          style={styles.profileBtnFull}
          onPress={() => router.push("/itr/profile")}
        >
          <Text style={styles.profileBtnText}>Profile Section</Text>
          <Ionicons name="person-circle-outline" size={18} color="#64748B" />
        </Pressable>

        {form16 ? (
          <Pressable style={styles.form16Banner} onPress={() => router.push("/itr/form-16")}>
            <View style={styles.form16BannerLeft}>
              <Ionicons name="document-text-outline" size={18} color={itrColors.primary} />
              <View>
                <Text style={styles.form16BannerTitle}>Form 16 Imported</Text>
                <Text style={styles.form16BannerSub}>
                  {form16.fileName}
                  {form16.assessmentYear ? ` · ${form16.assessmentYear}` : ""}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </Pressable>
        ) : null}
      </View>

        <SectionCard title="Salary Less SD & P Tax" amount={`₹ ${salary.netSalary.toLocaleString()}`} onPress={() => router.push("/itr/salary-less-sd-p-tax")} />
        <SectionCard title="Income from House Property" amount={`₹ ${houseProperty.incomeFromHP.toLocaleString()}`} onPress={() => router.push("/itr/house-property")} />
        <SectionCard title="Capital Gain" amount={`₹ ${capitalGains.totalGains.toLocaleString()}`} onPress={() => router.push("/itr/capital-gains")} />
        <SectionCard title="Other Source" amount={`₹ ${otherSources.totalOtherIncome.toLocaleString()}`} onPress={() => router.push("/itr/other-sources")} />
        <SectionCard title="Business & Profession" amount={`₹ ${businessProfession.totalIncome.toLocaleString()}`} onPress={() => router.push("/itr/business-profession")} />
        <SectionCard title="Exemption & Deduction" amount={`₹ ${deductions.totalDeductions.toLocaleString()}`} onPress={() => router.push("/itr/exemptions-deductions")} />
        
        <Text style={styles.sectionTitle}>Regime Comparison</Text>
        <SectionCard title="Old Tax Regime Liability" amount={`₹ ${taxResults.comparison.old.toLocaleString()}`} amountStyle={{color: '#64748B'}} />
        <SectionCard title="New Tax Regime Liability" amount={`₹ ${taxResults.comparison.new.toLocaleString()}`} amountStyle={{color: '#64748B'}} />

        <Text style={styles.sectionTitle}>Final Tax Computation</Text>
        <View style={styles.calcContainer}>
            <SectionCard 
                title="Total Tax Payable (Gross)" 
                amount={`₹ ${taxResults.grossTax.toLocaleString()}`} 
                onPress={() => router.push("/itr/tax-payable")}
                titleStyle={{color: '#475569'}}
            />

            <SectionCard 
                title="Taxes Paid & TDS" 
                amount={`₹ ${taxResults.totalPaid.toLocaleString()}`} 
                onPress={() => router.push("/itr/income-tax-calculator")}
                amountStyle={{color: '#059669'}}
            />

            <View style={styles.finalResultBox}>
                <View style={styles.finalRow}>
                    <Text style={styles.finalLabel}>{taxResults.net > 0 ? "Final Tax Payable" : "Tax Refund Amount"}</Text>
                    <Text style={[styles.finalValue, taxResults.net > 0 ? styles.payableColor : styles.refundColor]}>
                        ₹ {Math.abs(taxResults.net).toLocaleString()}
                    </Text>
                </View>
            </View>
        </View>

        <ITRSaveButton title="Download JSON" onPress={handleDownload} />
      </ScrollView>

      <ITRBottomNav activeRoute="/itr" />

      {/* Regime Picker Modal */}
      <Modal visible={showRegimeModal} transparent animationType="fade" onRequestClose={() => setShowRegimeModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowRegimeModal(false)} />
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Tax Regime</Text>
          {[{ label: "New Regime", value: "new" }, { label: "Old Regime", value: "old" }].map((opt) => (
            <Pressable key={opt.value} onPress={() => { setRegime(opt.value as "old" | "new"); setShowRegimeModal(false); }} style={[styles.modalOption, regime === opt.value && styles.modalOptionActive]}>
              <Text style={[styles.modalOptionText, regime === opt.value && styles.modalOptionTextActive]}>{opt.label}</Text>
              {regime === opt.value && <Ionicons name="checkmark-circle" size={20} color={itrColors.primary} />}
            </Pressable>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: itrColors.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 112 },
  headerYear: { color: "#fff", fontSize: 12, fontWeight: "700" },
  controlsGrid: { marginBottom: 16, gap: 10 },
  controlsRow: { flexDirection: "row", gap: 10 },
  pickerBtn: { flex: 1, alignItems: "center", backgroundColor: "#fff", borderColor: "#E2E8F0", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", height: 42, ...itrShadows.card },
  regimeBtn: { backgroundColor: "#F8FAFC" },
  pickerBtnText: { color: "#475569", fontSize: 13, fontWeight: "700" },
  profileBtnFull: { width: '100%', backgroundColor: "#fff", borderColor: "#E2E8F0", borderRadius: 10, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 46, ...itrShadows.card },
  profileBtnText: { color: "#334155", fontSize: 14, fontWeight: "600" },
  form16Banner: {
    width: "100%",
    backgroundColor: "#F8FBFF",
    borderColor: "#CFE0FF",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  form16BannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  form16BannerTitle: {
    color: "#1E293B",
    fontSize: 13,
    fontWeight: "800",
  },
  form16BannerSub: {
    color: "#64748B",
    fontSize: 11.5,
    marginTop: 2,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: 12, marginTop: 12, marginLeft: 4 },
  sectionCard: { backgroundColor: "#fff", borderColor: "#E2E8F0", borderRadius: 12, borderWidth: 1, marginBottom: 10, paddingHorizontal: 16, paddingVertical: 14, ...itrShadows.card },
  sectionCardRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionCardTitle: { color: "#334155", fontSize: 14, fontWeight: "600", flex: 1 },
  sectionCardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  amountText: { color: "#475569", fontSize: 13, fontWeight: "700" },
  chevron: { marginLeft: 2 },
  calcContainer: { marginTop: 0, marginBottom: 20 },
  finalResultBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#E2E8F0', ...itrShadows.card },
  finalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  finalLabel: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  finalValue: { fontSize: 14, fontWeight: '700' },
  payableColor: { color: '#EF4444' },
  refundColor: { color: '#059669' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 23, 42, 0.4)" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, bottom: 0, left: 0, paddingHorizontal: 20, paddingVertical: 24, position: "absolute", right: 0 },
  modalTitle: { color: "#1E293B", fontSize: 18, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  modalOption: { borderColor: "#F1F5F9", borderRadius: 16, borderWidth: 1, marginBottom: 12, padding: 16, backgroundColor: "#F8FAFC", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalOptionActive: { backgroundColor: "#EEF2FF", borderColor: itrColors.primary },
  modalOptionText: { color: "#475569", fontSize: 15, fontWeight: "700" },
  modalOptionTextActive: { color: itrColors.primary },
});
