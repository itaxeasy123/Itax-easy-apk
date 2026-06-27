import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { accountingService as invoiceService } from '../services/accountingService';
import type { Invoice, InvoiceSummary } from '../types/accountingTypes';
import CreateInvoiceSheet from '../components/CreateInvoiceSheet';
import { AccountingHeader, BottomNav, Button, Card, EmptyState, Loading } from '../components';
import { accountingTheme } from '../../../theme/accounting';

type HomeFilter = 'all' | 'sales' | 'purchase' | 'returns';

type DashboardInvoice = Invoice & {
  partyName: string;
};

const PARTY_PAGE_LIMIT = 100;
const RECENT_PREVIEW_LIMIT = 12;
const RECENT_FETCH_LIMIT = 24;

const EMPTY_SUMMARY: InvoiceSummary = {
  total_sales: 0,
  total_purchases: 0,
  number_of_parties: 0,
  number_of_items: 0,
};

const FILTER_OPTIONS: { label: string; value: HomeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Sales', value: 'sales' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Returns', value: 'returns' },
];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

function formatAmount(value: number) {
  return `Rs ${currencyFormatter.format(Number(value || 0))}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function matchesFilter(invoice: Invoice, filter: HomeFilter) {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'returns') {
    return invoice.type === 'sales_return' || invoice.type === 'purchase_return';
  }

  return invoice.type === filter;
}

function getStatusTone(status: Invoice['status']) {
  switch (status) {
    case 'paid':
      return {
        backgroundColor: '#E8F8EE',
        textColor: colors.success,
      };
    case 'overdue':
      return {
        backgroundColor: '#FFE8E8',
        textColor: colors.danger,
      };
    case 'unpaid':
    default:
      return {
        backgroundColor: '#FFF4DA',
        textColor: '#CC8A00',
      };
  }
}

function getInvoiceMetaLabel(invoice: Invoice) {
  const itemCount = invoice.invoiceItems?.length ?? 0;
  return `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
}

async function fetchInvoiceDocumentCount(type: Invoice['type']) {
  const response = await invoiceService.getInvoices({ limit: 1, page: 1, type });
  return response.pagination.totalItems;
}

async function buildPartyNameMap(invoices: Invoice[]) {
  const unresolvedIds = new Set(
    invoices.map((invoice) => invoice.partyId).filter(Boolean)
  );
  const partyNameMap = new Map<string, string>();

  try {
    const response = await invoiceService.getParties();
    const parties = response.data || [];

    parties.forEach((party: any) => {
      if (unresolvedIds.has(party.id)) {
        partyNameMap.set(party.id, party.partyName);
        unresolvedIds.delete(party.id);
      }
    });
  } catch (error) {
    console.error(error);
  }

  return partyNameMap;
}

export default function InvoiceHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [summary, setSummary] = useState<InvoiceSummary>(EMPTY_SUMMARY);
  const [salesCount, setSalesCount] = useState(0);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<DashboardInvoice[]>([]);
  const [activeFilter, setActiveFilter] = useState<HomeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const loadDashboard = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError('');

      const [
        summaryData,
        invoiceData,
        salesInvoicesCount,
        salesReturnsCount,
        purchaseInvoicesCount,
        purchaseReturnsCount,
      ] = await Promise.all([
        invoiceService.getInvoiceSummary(),
        invoiceService.getInvoices({ limit: RECENT_FETCH_LIMIT, page: 1 }),
        fetchInvoiceDocumentCount('sales'),
        fetchInvoiceDocumentCount('sales_return'),
        fetchInvoiceDocumentCount('purchase'),
        fetchInvoiceDocumentCount('purchase_return'),
      ]);

      const sortedInvoices = [...invoiceData.invoices]
        .sort((first, second) => {
          const firstTime = first.invoiceDate ? new Date(first.invoiceDate).getTime() : 0;
          const secondTime = second.invoiceDate ? new Date(second.invoiceDate).getTime() : 0;
          return secondTime - firstTime;
        })
        .slice(0, RECENT_PREVIEW_LIMIT);
      const partyMap = await buildPartyNameMap(sortedInvoices);

      const recent = sortedInvoices.map((invoice) => ({
        ...invoice,
        partyName: partyMap.get(invoice.partyId) || invoice.party?.partyName || 'Party linked',
      }));

      setSummary(summaryData.data || EMPTY_SUMMARY);
      setRecentInvoices(recent);
      setSalesCount(salesInvoicesCount + salesReturnsCount);
      setPurchaseCount(purchaseInvoicesCount + purchaseReturnsCount);
    } catch (dashboardError: unknown) {
      setError(
        getApiErrorMessage(
          dashboardError,
          'Invoice dashboard load nahi ho paaya. Please try again.'
        )
      );
    } finally {
      if (mode === 'initial') {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadDashboard();

    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
    document.body?.focus?.();
  }, [loadDashboard]);

  const filteredInvoices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return recentInvoices.filter((invoice) => {
      const filterMatch = matchesFilter(invoice, activeFilter);
      const searchMatch = !normalizedQuery
        ? true
        : `${invoice.invoiceNumber || ''} ${invoice.partyName} ${invoice.status}`
          .toLowerCase()
          .includes(normalizedQuery);

      return filterMatch && searchMatch;
    });
  }, [activeFilter, recentInvoices, searchQuery]);

  const shortcuts = [
    {
      id: 'create',
      icon: 'document-text-outline' as const,
      label: 'Create Invoice',
      subtitle: 'New entry',
      backgroundColor: '#EEF4FF',
      iconColor: colors.primary,
    },
    {
      id: 'parties',
      icon: 'people-outline' as const,
      label: 'Parties',
      subtitle: `${summary.number_of_parties} linked`,
      backgroundColor: '#EAF8F0',
      iconColor: '#3FB982',
    },
    {
      id: 'items',
      icon: 'cube-outline' as const,
      label: 'Items',
      subtitle: `${summary.number_of_items} saved`,
      backgroundColor: '#EEF4FF',
      iconColor: colors.primary,
    },
    {
      id: 'einvoice',
      icon: 'shield-checkmark-outline' as const,
      label: 'E-Invoice',
      subtitle: 'IRN workflow',
      backgroundColor: '#F4EEFF',
      iconColor: '#7A59D1',
    },
  ];

  function handleShortcutPress(id: string) {
    if (id === 'create') {
      setIsSheetVisible(true);
      return;
    }

    if (id === 'parties') {
      router.navigate('/accounting/parties');
      return;
    }

    if (id === 'items') {
      router.navigate('/accounting/items');
      return;
    }

    if (id === 'einvoice') {
      router.navigate('/accounting/more');
    }
  }

  return (
    <View style={styles.container}>
      <AccountingHeader
        title="Invoices"
        showBackButton
        rightContent={
          <Pressable onPress={() => void loadDashboard('refresh')} style={{ padding: 4 }}>
            <Ionicons name="refresh" size={20} color={accountingTheme.colors.card} />
          </Pressable>
        }
        headerContent={(
          <View style={styles.headerTabsWrap}>
            <View style={styles.balanceRow}>
              <View style={styles.balanceColumn}>
                <Text style={styles.balanceValue}>{loading ? '...' : formatAmount(summary.total_sales)}</Text>
                <Text style={styles.balanceLabel}>Total Sales ({salesCount})</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.balanceColumn}>
                <Text style={styles.balanceValue}>{loading ? '...' : formatAmount(summary.total_purchases)}</Text>
                <Text style={styles.balanceLabel}>Total Purchases ({purchaseCount})</Text>
              </View>
            </View>
          </View>
        )}
      />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 120 },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void loadDashboard('refresh')} />
          }
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickRow}>
              {shortcuts.map((shortcut) => (
                <Pressable
                  key={shortcut.id}
                  onPress={() => handleShortcutPress(shortcut.id)}
                  style={styles.quickCard}
                >
                  <Ionicons color={shortcut.iconColor} name={shortcut.icon} size={20} />
                  <Text style={styles.quickText}>{shortcut.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            {FILTER_OPTIONS.map((filter) => {
              const active = activeFilter === filter.value;

              return (
                <Pressable
                  key={filter.value}
                  onPress={() => setActiveFilter(filter.value)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.searchBox}>
            <Ionicons color={colors.textLight} name="search-outline" size={18} />
            <TextInput
              onChangeText={setSearchQuery}
              placeholder="Search..."
              placeholderTextColor={colors.textLight}
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <Pressable onPress={() => router.navigate('/invoices')}>
              <Text style={styles.sectionAction}>View All</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorCard}>
              <View style={styles.errorRow}>
                <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
                <Text style={styles.errorTitle}>Unable to load invoices</Text>
              </View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {filteredInvoices.length > 0 ? (
            <View style={styles.invoiceList}>
              {filteredInvoices.map((invoice) => {
                const statusTone = getStatusTone(invoice.status);

                return (
                  <View key={invoice.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceCardTop}>
                      <View style={styles.invoiceTextWrap}>
                        <Text style={styles.invoiceNumber}>
                          {invoice.invoiceNumber || 'INV-DRAFT'}
                        </Text>
                        <Text style={styles.invoiceParty}>{invoice.partyName}</Text>
                      </View>

                      <View style={styles.invoiceAmountWrap}>
                        <Text style={styles.invoiceAmount}>{formatAmount(invoice.totalAmount)}</Text>
                        <Text style={styles.invoiceDate}>{formatDate(invoice.invoiceDate)}</Text>
                      </View>
                    </View>

                    <View style={styles.invoiceCardBottom}>
                      <View style={styles.invoiceMetaWrap}>
                        <Ionicons color={colors.textLight} name="document-text-outline" size={14} />
                        <Text style={styles.invoiceMeta}>{getInvoiceMetaLabel(invoice)}</Text>
                      </View>

                      <View
                        style={[
                          styles.statusChip,
                          { backgroundColor: statusTone.backgroundColor },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: statusTone.textColor }]}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons color={colors.textLight} name="file-tray-outline" size={28} />
              <Text style={styles.emptyTitle}>No invoices found</Text>
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? 'Search ya filter clear karke dubara check karo.'
                  : 'Abhi tak koi invoice available nahi hai.'}
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 0) + 16 }]}>
          <Button
            title="Create Invoice"
            onPress={() => setIsSheetVisible(true)}
            icon={<Ionicons name="add" size={20} color={accountingTheme.colors.card} />}
            size="large"
            fullWidth
          />
        </View>
        <CreateInvoiceSheet visible={isSheetVisible} onClose={() => setIsSheetVisible(false)} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: accountingTheme.colors.card,
  },
  headerTabsWrap: {
    alignItems: 'center',
    marginTop: accountingTheme.spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: accountingTheme.spacing.md,
    paddingBottom: accountingTheme.spacing.xs,
    width: '100%',
  },
  balanceColumn: {
    flex: 1,
    alignItems: 'center',
  },
  balanceValue: {
    color: accountingTheme.colors.card,
    fontSize: accountingTheme.fontSizes.lg,
    fontWeight: accountingTheme.fontWeights.extraBold,
  },
  balanceLabel: {
    color: '#EAFDFC',
    fontSize: accountingTheme.fontSizes.xs,
    marginTop: 2,
    fontWeight: accountingTheme.fontWeights.medium,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  safeArea: {
    backgroundColor: '#F5F9FF',
    flex: 1,
  },
  screen: {
    backgroundColor: '#F5F9FF',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    marginRight: 4,
    padding: 4,
    marginLeft: -4,
  },
  eyebrow: {
    fontSize: 15,
    color: "#121213ff",
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    padding: 10,
  },
  summaryLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#0F172A",
  },
  statSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  section: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickText: {
    fontSize: 10,
    marginTop: 4,
    color: "#0F172A",
    fontWeight: "600",
    textAlign: "center",
  },

  filterRow: {
    backgroundColor: '#E8EDF8',
    borderRadius: radius.pill,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: 4,
  },
  filterChip: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    paddingVertical: 10,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: '#6A7D99',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  searchBox: {
      backgroundColor: accountingTheme.colors.card,
      borderRadius: accountingTheme.radius.full,
      borderWidth: 1,
      borderColor: accountingTheme.colors.borderMedium,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: accountingTheme.spacing.md,
      height: 38,
      marginTop: accountingTheme.spacing.sm,
      marginBottom: accountingTheme.spacing.xs,
    },
  invoiceList: {
    gap: spacing.sm,
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    elevation: 1,
    padding: 10,
    shadowColor: '#B5C2D7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  invoiceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceTextWrap: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  invoiceNumber: {
    color: '#354D72',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  invoiceParty: {
    color: '#61748E',
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  invoiceAmountWrap: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    color: '#405474',
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
  },
  invoiceDate: {
    color: colors.textMuted,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  invoiceCardBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  invoiceMetaWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  invoiceMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  statusChip: {
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginTop: spacing.sm,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: accountingTheme.colors.card,
    padding: accountingTheme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: accountingTheme.colors.border,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  fabText: {
    color: accountingTheme.colors.card,
    fontWeight: accountingTheme.fontWeights.bold,
    fontSize: accountingTheme.fontSizes.lg,
  },
  searchInput: {
      color: accountingTheme.colors.text,
      flex: 1,
      fontSize: accountingTheme.fontSizes.md,
      padding: 0,
      marginLeft: 6,
      outlineStyle: 'none' as any,
    },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionAction: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  errorCard: {
    backgroundColor: '#FFF2F2',
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  errorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  },
  errorText: {
    color: colors.text,
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});

