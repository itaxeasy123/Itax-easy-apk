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
import { invoiceService } from '../services/invoiceService';
import type { Invoice, InvoiceSummary } from '../types/invoice.types';

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
  let currentPage = 1;
  let hasMore = true;

  while (hasMore && unresolvedIds.size > 0) {
    const response = await invoiceService.getParties({
      limit: PARTY_PAGE_LIMIT,
      page: currentPage,
    });

    response.parties.forEach((party) => {
      if (unresolvedIds.has(party.id)) {
        partyNameMap.set(party.id, party.partyName);
        unresolvedIds.delete(party.id);
      }
    });

    hasMore = response.parties.length === PARTY_PAGE_LIMIT;
    currentPage += 1;
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
        invoiceService.getSummary(),
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

      setSummary(summaryData);
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
      router.push('/invoice-create');
      return;
    }

    if (id === 'parties') {
      router.push('/accounting/parties');
      return;
    }

    if (id === 'items') {
      router.push('/accounting/items');
      return;
    }

    if (id === 'einvoice') {
      router.push('/accounting/more');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 96 + Math.max(insets.bottom, spacing.sm) },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void loadDashboard('refresh')} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <View style={styles.titleIconBox}>
                <Ionicons color={colors.white} name="receipt-outline" size={16} />
              </View>
              <Text style={styles.headerTitle}>Invoices</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable onPress={() => void loadDashboard('refresh')} style={styles.headerIconButton}>
                <Ionicons color={colors.textMuted} name="refresh-outline" size={20} />
              </Pressable>
            </View>
          </View>

          <View style={styles.dashboardCard}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryBlock, styles.summaryBlockDivider]}>
                <View style={styles.summaryLabelRow}>
                  <Ionicons color={colors.primary} name="bar-chart-outline" size={14} />
                  <Text style={styles.summaryLabel}>Total Sales</Text>
                </View>
                <Text style={styles.summaryValue}>
                  {loading ? '...' : formatAmount(summary.total_sales)}
                </Text>
                <Text style={styles.summaryMeta}>
                  {loading
                    ? 'Loading...'
                    : `${salesCount} ${salesCount === 1 ? 'document' : 'documents'}`}
                </Text>
              </View>

              <View style={styles.summaryBlock}>
                <Text style={styles.summaryLabel}>Total Purchases</Text>
                <Text style={styles.summaryValue}>
                  {loading ? '...' : formatAmount(summary.total_purchases)}
                </Text>
                <Text style={styles.summaryMeta}>
                  {loading
                    ? 'Loading...'
                    : `${purchaseCount} ${purchaseCount === 1 ? 'document' : 'documents'}`}
                </Text>
              </View>
            </View>

            <View style={styles.panelDivider} />

            <View style={styles.shortcutRow}>
              {shortcuts.map((shortcut) => (
                <Pressable
                  key={shortcut.id}
                  onPress={() => handleShortcutPress(shortcut.id)}
                  style={styles.shortcutItem}
                >
                  <View
                    style={[
                      styles.shortcutIconBox,
                      { backgroundColor: shortcut.backgroundColor },
                    ]}
                  >
                    <Ionicons color={shortcut.iconColor} name={shortcut.icon} size={18} />
                  </View>
                  <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
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
            <Pressable onPress={() => router.push('/invoices')}>
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

        <View style={[styles.bottomDock, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <Pressable style={styles.createButton} onPress={() => router.push('/invoice-create')}>
            <Ionicons color={colors.white} name="add" size={18} />
            <Text style={styles.createButtonText}>Create Invoice</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#EEF3FB',
    flex: 1,
  },
  screen: {
    backgroundColor: '#EEF3FB',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  titleIconBox: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  headerTitle: {
    color: '#304766',
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: '#E3EBF8',
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  dashboardCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    elevation: 3,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: '#9FB2CF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryBlock: {
    flex: 1,
  },
  summaryBlockDivider: {
    borderRightColor: '#E6ECF7',
    borderRightWidth: 1,
    marginRight: spacing.md,
    paddingRight: spacing.md,
  },
  summaryLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  summaryLabel: {
    color: '#586C87',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: fontWeights.bold,
    marginTop: spacing.xs,
  },
  summaryMeta: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  panelDivider: {
    backgroundColor: '#E8EDF8',
    height: 1,
    marginVertical: spacing.md,
  },
  shortcutRow: {
    gap: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shortcutItem: {
    alignItems: 'center',
    flex: 1,
  },
  shortcutIconBox: {
    alignItems: 'center',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    marginBottom: 6,
    width: 44,
  },
  shortcutLabel: {
    color: '#4B5E79',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
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
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.md,
    padding: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: '#486288',
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
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
  invoiceList: {
    gap: spacing.sm,
  },
  invoiceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    elevation: 2,
    padding: spacing.md,
    shadowColor: '#B5C2D7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  invoiceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceTextWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  invoiceNumber: {
    color: '#354D72',
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  invoiceParty: {
    color: '#61748E',
    fontSize: fontSizes.md,
    marginTop: 4,
  },
  invoiceAmountWrap: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    color: '#405474',
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  invoiceDate: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginTop: 4,
  },
  invoiceCardBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
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
  bottomDock: {
    backgroundColor: '#EEF3FB',
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    right: 0,
    paddingTop: spacing.xs,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  createButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
});
