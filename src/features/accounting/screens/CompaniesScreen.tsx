import { useCallback, useState } from "react";
import { View, ScrollView, StyleSheet, Text, Pressable, Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, EmptyState, Loading } from "../components";
import AccountingHeader from "../components/AccountingHeader";
import { accountingTheme } from "../../../theme/accounting";
import { companyService } from "../services/companyService";
import { billshieldUiService, FiscalYearInfo } from "../services/billshieldUiService";

interface CompanyRow {
  id: string;
  name: string;
  gstin?: string | null;
  role?: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export default function CompaniesScreen() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fiscalYears, setFiscalYears] = useState<FiscalYearInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentId = await companyService.ensureCompanyId();
      const [list, fys] = await Promise.all([
        companyService.listCompanies(),
        billshieldUiService.listFiscalYears(),
      ]);
      setCompanies(list.data ?? []);
      setActiveId(currentId);
      setFiscalYears(fys.data ?? []);
    } catch {
      setError("Unable to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleSelect = async (company: CompanyRow) => {
    if (company.id === activeId) return;
    await companyService.selectCompany(company.id);
    setActiveId(company.id);
    Alert.alert("Company switched", `"${company.name}" is now your active set of books.`);
    void load();
  };

  const handleCloseFy = (fy: FiscalYearInfo) => {
    Alert.alert(
      `Close ${fy.label}?`,
      "Closing locks the year permanently — no further vouchers can be posted into it. The next fiscal year is created automatically.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close Year",
          style: "destructive",
          onPress: async () => {
            const result = await billshieldUiService.closeFiscalYear(fy.id);
            if (result.success) {
              Alert.alert("Year closed", `${fy.label} is locked. Opening balances carry forward automatically.`);
              void load();
            } else {
              Alert.alert("Could not close year", result.message ?? "Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AccountingHeader title="Companies" subtitle="Your sets of books and fiscal years." />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.actionArea}>
          <Button
            title="Add Company"
            onPress={() => router.navigate("/accounting/company-create")}
            size="large"
            fullWidth
          />
        </View>

        {loading ? (
          <Loading text="Loading companies..." />
        ) : error ? (
          <View style={styles.cardArea}>
            <Card>
              <EmptyState icon="alert-circle" title="Unable to load" description={error} />
            </Card>
          </View>
        ) : (
          <>
            <View style={styles.cardArea}>
              {companies.map((company) => {
                const isActive = company.id === activeId;
                return (
                  <Card key={company.id} pressable onPress={() => handleSelect(company)}>
                    <View style={styles.companyRow}>
                      <View style={[styles.companyIcon, isActive && styles.companyIconActive]}>
                        <Ionicons
                          name="business"
                          size={18}
                          color={isActive ? "#FFFFFF" : accountingTheme.colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.companyName}>{company.name}</Text>
                        <Text style={styles.companyMeta}>
                          {company.gstin ? `GSTIN ${company.gstin}` : "No GSTIN"}
                          {company.role ? ` • ${company.role}` : ""}
                        </Text>
                      </View>
                      {isActive ? (
                        <View style={styles.activePill}>
                          <Text style={styles.activePillText}>ACTIVE</Text>
                        </View>
                      ) : (
                        <Text style={styles.switchText}>Switch</Text>
                      )}
                    </View>
                  </Card>
                );
              })}
            </View>

            <View style={styles.cardArea}>
              <Text style={styles.sectionTitle}>Fiscal Years (active company)</Text>
              {fiscalYears.map((fy) => (
                <Card key={fy.id}>
                  <View style={styles.fyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fyLabel}>{fy.label}</Text>
                      <Text style={styles.companyMeta}>
                        {formatDate(fy.startDate)} – {formatDate(fy.endDate)}
                      </Text>
                    </View>
                    {fy.isClosed ? (
                      <View style={styles.closedPill}>
                        <Ionicons name="lock-closed" size={12} color="#991B1B" />
                        <Text style={styles.closedPillText}>CLOSED</Text>
                      </View>
                    ) : (
                      <Pressable style={styles.closeBtn} onPress={() => handleCloseFy(fy)}>
                        <Text style={styles.closeBtnText}>Close Year</Text>
                      </Pressable>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    paddingBottom: accountingTheme.spacing.xxl,
  },
  actionArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
  },
  cardArea: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: accountingTheme.fontWeights.extraBold,
    color: "#111827",
    marginBottom: 10,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.md,
    flex: 1,
  },
  companyIcon: {
    width: 36,
    height: 36,
    borderRadius: accountingTheme.radius.lg,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  companyIconActive: {
    backgroundColor: accountingTheme.colors.primary,
  },
  companyName: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  companyMeta: {
    fontSize: accountingTheme.fontSizes.sm,
    color: "#6B7280",
    marginTop: 2,
  },
  activePill: {
    backgroundColor: "#DCFCE7",
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activePillText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  switchText: {
    color: accountingTheme.colors.primary,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
  },
  fyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: accountingTheme.spacing.md,
    flex: 1,
  },
  fyLabel: {
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.bold,
    color: "#111827",
  },
  closedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  closedPillText: {
    color: "#991B1B",
    fontSize: 11,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: accountingTheme.colors.error,
    borderRadius: accountingTheme.radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeBtnText: {
    color: accountingTheme.colors.error,
    fontSize: accountingTheme.fontSizes.sm,
    fontWeight: accountingTheme.fontWeights.bold,
  },
});
