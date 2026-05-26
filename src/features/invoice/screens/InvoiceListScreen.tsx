import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import type {
  Invoice,
  InvoiceStatus,
  InvoiceType,
  Pagination,
} from '../types/invoice.types';

type InvoiceListTypeFilter = 'all' | InvoiceType;
type InvoiceListStatusFilter = 'all' | InvoiceStatus;

type ListInvoice = Invoice & {
  partyName: string;
};

const PARTY_PAGE_LIMIT = 100;
const PAGE_SIZE = 10;

const TYPE_OPTIONS: { label: string; value: InvoiceListTypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Sales', value: 'sales' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Sales Return', value: 'sales_return' },
  { label: 'Purchase Return', value: 'purchase_return' },
];

const STATUS_OPTIONS: { label: string; value: InvoiceListStatusFilter }[] = [
  { label: 'All Status', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Overdue', value: 'overdue' },
];

const EMPTY_PAGINATION: Pagination = {
  currentPage: 1,
  limit: PAGE_SIZE,
  pages: 1,
  totalItems: 0,
};

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

function formatType(type: InvoiceType) {
  switch (type) {
    case 'sales':
      return 'Sales';
    case 'purchase':
      return 'Purchase';
    case 'sales_return':
      return 'Sales Return';
    case 'purchase_return':
      return 'Purchase Return';
    default:
      return type;
  }
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

function getTypeTone(type: InvoiceType) {
  switch (type) {
    case 'sales':
      return {
        backgroundColor: '#EAF4FF',
        textColor: colors.primary,
      };
    case 'purchase':
      return {
        backgroundColor: '#EEF8F0',
        textColor: colors.success,
      };
    case 'sales_return':
      return {
        backgroundColor: '#FFF1F1',
        textColor: colors.danger,
      };
    case 'purchase_return':
    default:
      return {
        backgroundColor: '#F4EEFF',
        textColor: '#7A59D1',
      };
  }
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

export default function InvoiceListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchInput, setSearchInput] = useState('');
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [typeFilter, setTypeFilter] = useState<InvoiceListTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<InvoiceListStatusFilter>('all');
  const [invoices, setInvoices] = useState<ListInvoice[]>([]);
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const loadInvoices = useCallback(
    async (
      mode: 'replace' | 'append' | 'refresh' = 'replace',
      targetPage = 1
    ) => {
      try {
        if (mode === 'replace') {
          setLoading(true);
        } else if (mode === 'refresh') {
          setRefreshing(true);
        } else {
          setLoadingMore(true);
        }

        if (mode !== 'append') {
          setError('');
        }

        const response = await invoiceService.getInvoices({
          limit: PAGE_SIZE,
          page: targetPage,
          search: deferredSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          type: typeFilter === 'all' ? undefined : typeFilter,
        });

        const partyMap = await buildPartyNameMap(response.invoices);
        const mappedInvoices = response.invoices.map((invoice) => ({
          ...invoice,
          partyName: partyMap.get(invoice.partyId) || invoice.party?.partyName || 'Party linked',
        }));

        setInvoices((current) =>
          mode === 'append' ? [...current, ...mappedInvoices] : mappedInvoices
        );
        setPagination(response.pagination);
      } catch (listError: unknown) {
        setError(
          getApiErrorMessage(
            listError,
            'Invoice list load nahi ho paayi. Please try again.'
          )
        );
      } finally {
        if (mode === 'replace') {
          setLoading(false);
        } else if (mode === 'refresh') {
          setRefreshing(false);
        } else {
          setLoadingMore(false);
        }
      }
    },
    [deferredSearch, statusFilter, typeFilter]
  );

  useEffect(() => {
    void loadInvoices('replace');

    if (typeof document === 'undefined') {
      return;
    }

    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
    document.body?.focus?.();
  }, [loadInvoices]);

  const resultLabel = useMemo(() => {
    if (loading) {
      return 'Loading invoices...';
    }

    return `${pagination.totalItems} ${pagination.totalItems === 1 ? 'invoice' : 'invoices'}`;
  }, [loading, pagination.totalItems]);

  const hasMore = pagination.currentPage < pagination.pages;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerIconButton}>
            <Ionicons color={colors.text} name="chevron-back" size={18} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Invoice List</Text>
            <Text style={styles.headerSubtitle}>{resultLabel}</Text>
          </View>

          <Pressable onPress={() => void loadInvoices('refresh')} style={styles.headerIconButton}>
            <Ionicons color={colors.textMuted} name="refresh-outline" size={18} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 104 + Math.max(insets.bottom, spacing.sm) },
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void loadInvoices('refresh')} />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchBox}>
            <Ionicons color={colors.textLight} name="search-outline" size={18} />
            <TextInput
              autoCapitalize="characters"
              onChangeText={setSearchInput}
              placeholder="Search invoice no. or GST"
              placeholderTextColor={colors.textLight}
              style={styles.searchInput}
              value={searchInput}
            />
          </View>

          <Text style={styles.filterLabel}>Type</Text>
          <ScrollView
            contentContainerStyle={styles.filterScrollContent}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {TYPE_OPTIONS.map((option) => {
              const active = typeFilter === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setTypeFilter(option.value)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={[styles.filterLabel, styles.statusLabel]}>Status</Text>
          <ScrollView
            contentContainerStyle={styles.filterScrollContent}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {STATUS_OPTIONS.map((option) => {
              const active = statusFilter === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setStatusFilter(option.value)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {error ? (
            <View style={styles.errorCard}>
              <View style={styles.errorRow}>
                <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
                <Text style={styles.errorTitle}>Unable to load invoices</Text>
              </View>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {invoices.length > 0 ? (
            <View style={styles.invoiceStack}>
              {invoices.map((invoice) => {
                const statusTone = getStatusTone(invoice.status);
                const typeTone = getTypeTone(invoice.type);

                return (
                  <View key={invoice.id} style={styles.invoiceCard}>
                    <View style={styles.invoiceTopRow}>
                      <View style={styles.invoiceTitleWrap}>
                        <Text style={styles.invoiceNumber}>
                          {invoice.invoiceNumber || 'INV-DRAFT'}
                        </Text>
                        <Text style={styles.invoiceParty}>{invoice.partyName}</Text>
                      </View>

                      <View style={styles.amountWrap}>
                        <Text style={styles.amountValue}>{formatAmount(invoice.totalAmount)}</Text>
                        <Text style={styles.amountDate}>{formatDate(invoice.invoiceDate)}</Text>
                        <Pressable
                          onPress={() =>
                            router.navigate({
                              pathname: "/accounting/print/invoice",
                              params: { id: invoice.id },
                            })
                          }
                          style={styles.printActionButton}
                        >
                          <Ionicons color={colors.primary} name="print-outline" size={14} />
                          <Text style={styles.printActionText}>Print</Text>
                        </Pressable>
                      </View>
                    </View>

                    <View style={styles.metaRow}>
                      <View style={[styles.metaChip, { backgroundColor: typeTone.backgroundColor }]}>
                        <Text style={[styles.metaChipText, { color: typeTone.textColor }]}>
                          {formatType(invoice.type)}
                        </Text>
                      </View>

                      <View
                        style={[styles.metaChip, { backgroundColor: statusTone.backgroundColor }]}
                      >
                        <Text style={[styles.metaChipText, { color: statusTone.textColor }]}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.invoiceBottomRow}>
                      <View style={styles.inlineMeta}>
                        <Ionicons color={colors.textLight} name="document-text-outline" size={14} />
                        <Text style={styles.inlineMetaText}>
                          {invoice.gstNumber || 'No GST linked'}
                        </Text>
                      </View>

                      <View style={styles.inlineMeta}>
                        <Ionicons color={colors.textLight} name="cube-outline" size={14} />
                        <Text style={styles.inlineMetaText}>
                          {invoice.invoiceItems.length}{' '}
                          {invoice.invoiceItems.length === 1 ? 'item' : 'items'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : !loading ? (
            <View style={styles.emptyCard}>
              <Ionicons color={colors.textLight} name="file-tray-outline" size={28} />
              <Text style={styles.emptyTitle}>No invoices found</Text>
              <Text style={styles.emptyText}>
                Search, filter, ya status change karke dubara check karo.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons color={colors.textLight} name="time-outline" size={28} />
              <Text style={styles.emptyTitle}>Loading invoices</Text>
              <Text style={styles.emptyText}>Backend se latest invoice records aa rahe hain.</Text>
            </View>
          )}

          {hasMore ? (
            <Pressable
              disabled={loadingMore}
              onPress={() => void loadInvoices('append', pagination.currentPage + 1)}
              style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]}
            >
              <Text style={styles.loadMoreText}>
                {loadingMore ? 'Loading more...' : 'Load More'}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>

        <View style={[styles.bottomDock, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <Pressable style={styles.primaryButton} onPress={() => router.navigate('/invoice-create')}>
            <Ionicons color={colors.white} name="add" size={18} />
            <Text style={styles.primaryButtonText}>Create Invoice</Text>
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
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerTextWrap: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    color: '#304766',
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: fontSizes.md,
    padding: 0,
  },
  filterLabel: {
    color: '#586C87',
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  statusLabel: {
    marginTop: spacing.sm,
  },
  filterScrollContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: '#E8EDF8',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 1,
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
  errorCard: {
    backgroundColor: '#FFF2F2',
    borderRadius: radius.lg,
    marginTop: spacing.md,
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
  invoiceStack: {
    gap: spacing.sm,
    marginTop: spacing.md,
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
  invoiceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceTitleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  invoiceNumber: {
    color: '#354D72',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  invoiceParty: {
    color: '#61748E',
    fontSize: fontSizes.md,
    marginTop: 4,
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amountValue: {
    color: '#405474',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
  },
  amountDate: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
    marginTop: 4,
  },
  printActionButton: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#CFE0FF",
    backgroundColor: "#EEF4FF",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-end",
  },
  printActionText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  metaChip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
  metaChipText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
  },
  invoiceBottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  inlineMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  inlineMetaText: {
    color: colors.textMuted,
    fontSize: fontSizes.sm,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginTop: spacing.md,
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
  loadMoreButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  loadMoreButtonDisabled: {
    opacity: 0.65,
  },
  loadMoreText: {
    color: colors.primary,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
});
