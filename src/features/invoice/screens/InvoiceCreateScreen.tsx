import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  FlatList,
} from 'react-native';

import { Button, Card, Header, Loading } from '../../accounting/components';
import { invoiceService } from '../services/invoiceService';
import type { Item, Party, CreateInvoicePayload, InvoiceType, InvoiceStatus, ModeOfPayment } from '../types/invoice.types';
import AccountingHeader from '../../accounting/components/AccountingHeader';

type InvoiceLine = {
  itemId: string;
  quantity: string;
  discount: string;
  taxPercent: string;
};

const invoiceTypes: { label: string; value: InvoiceType }[] = [
  { label: 'Sales', value: 'sales' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Sales Return', value: 'sales_return' },
  { label: 'Purchase Return', value: 'purchase_return' },
];

const paymentModes: { label: string; value: ModeOfPayment }[] = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank', value: 'bank' },
  { label: 'UPI', value: 'upi' },
  { label: 'Credit', value: 'credit' },
];

const statusOptions: { label: string; value: InvoiceStatus }[] = [
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Paid', value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
];

const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/;
const FALLBACK_GST_NUMBER = '22AAAAA0000A1Z5';

function parseDateInput(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export default function InvoiceCreateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [type, setType] = useState<InvoiceType>('sales');
  const [partyId, setPartyId] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [stateOfSupply, setStateOfSupply] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState<ModeOfPayment>('cash');
  const [status, setStatus] = useState<InvoiceStatus>('unpaid');
  const [details, setDetails] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [credit, setCredit] = useState(false);
  const [isInventory, setIsInventory] = useState(false);
  const [isPartyModalVisible, setIsPartyModalVisible] = useState(false);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [lines, setLines] = useState<InvoiceLine[]>([
    { itemId: '', quantity: '1', discount: '0', taxPercent: '0' },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [partyResult, itemResult] = await Promise.all([
          invoiceService.getParties({ limit: 200, page: 1 }),
          invoiceService.getItems({ limit: 200, page: 1 }),
        ]);

        setParties(partyResult.parties ?? []);
        setItems(itemResult.items ?? []);
        const firstParty = partyResult.parties?.[0];
        setPartyId(firstParty?.id ?? '');
        setStateOfSupply(firstParty?.address ?? '');
        setGstNumber(firstParty?.gstin ?? '');
      } catch {
        setError('Unable to load invoice form data.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const selectedParty = parties.find(p => p.id === partyId);
  const filteredParties = parties.filter((party) =>
    party.partyName?.toLowerCase().includes(partySearchQuery.toLowerCase()) ||
    party.type?.toLowerCase().includes(partySearchQuery.toLowerCase())
  );

  const handleLineChange = (index: number, field: keyof InvoiceLine, value: string) => {
    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [field]: value } : line
      )
    );
  };

  const addLine = () => {
    setLines((current) => [
      ...current,
      { itemId: '', quantity: '1', discount: '0', taxPercent: '0' },
    ]);
  };

  const removeLine = (index: number) => {
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index));
  };

  const handleCreate = async () => {
    const trimmedGst = gstNumber.trim();
    const amount = Number(totalAmount);

    if (!partyId) {
      setError('Please select a party.');
      return;
    }

    if (trimmedGst && !gstRegex.test(trimmedGst)) {
      setError('Enter a valid GST number in backend format (e.g., 22AAAAA0000A1Z5), or leave it empty for testing.');
      return;
    }

    if (!stateOfSupply.trim()) {
      setError('State of supply is required.');
      return;
    }

    if (!totalAmount.trim() || Number.isNaN(amount) || amount <= 0) {
      setError('Total amount must be a valid positive number.');
      return;
    }
    
    if (invoiceDate.trim() && !parseDateInput(invoiceDate)) {
      setError('Invoice date must be a valid date (e.g. YYYY-MM-DD).');
      return;
    }
    
    if (dueDate.trim() && !parseDateInput(dueDate)) {
      setError('Due date must be a valid date (e.g. YYYY-MM-DD).');
      return;
    }

    const invoiceItems = lines
      .filter((line) => line.itemId.trim())
      .map((line) => ({
        itemId: line.itemId,
        quantity: Number(line.quantity || '1'),
        discount: Number(line.discount || '0'),
        taxPercent: Number(line.taxPercent || '0'),
      }));
      
    if (invoiceItems.length === 0) {
      setError('Please add at least one valid item to the invoice.');
      return;
    }
    
    // Validate that no item has negative values or NaN
    for (const item of invoiceItems) {
      if (Number.isNaN(item.quantity) || item.quantity <= 0) {
        setError('Item quantities must be valid positive numbers.');
        return;
      }
      if (Number.isNaN(item.discount) || item.discount < 0) {
        setError('Item discount cannot be negative.');
        return;
      }
      if (Number.isNaN(item.taxPercent) || item.taxPercent < 0) {
        setError('Item tax percent cannot be negative.');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      const gstToSend =
        trimmedGst ||
        parties.find((party) => party.id === partyId)?.gstin?.trim() ||
        FALLBACK_GST_NUMBER;

      const payload: CreateInvoicePayload = {
        invoiceNumber: invoiceNumber.trim() || undefined,
        gstNumber: gstToSend,
        type,
        partyId,
        totalAmount: amount,
        stateOfSupply: stateOfSupply.trim(),
        invoiceDate: parseDateInput(invoiceDate),
        dueDate: parseDateInput(dueDate),
        isInventory,
        details: details.trim() || undefined,
        extraDetails: extraDetails.trim() || undefined,
        modeOfPayment,
        credit,
        status,
        invoiceItems,
      };

      await invoiceService.createInvoice(payload);
      router.replace('/invoices');
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Please try again.';

      Alert.alert('Invoice create failed', backendMessage);
      setError(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading invoice form..." fullScreen />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AccountingHeader
        title="Create Invoice"
        subtitle="Save a new invoice."
        showBackButton
        rightContent={
          <Pressable
            onPress={() => router.navigate("/accounting/print")}
            style={styles.headerActionButton}
          >
            <Ionicons name="print-outline" size={18} color="#fff" />
          </Pressable>
        }
      />
      {/* <Header
        title="Create Invoice"
        subtitle="Save a new invoice through backend API."
        showBackButton
      /> */}

      <Card style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>Invoice Number</Text>
          <TextInput value={invoiceNumber} onChangeText={setInvoiceNumber} style={styles.input} placeholder="Optional" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>GST Number</Text>
          <TextInput value={gstNumber} onChangeText={setGstNumber} style={styles.input} placeholder="Enter valid GST number" autoCapitalize="characters" />
          <Text style={styles.helperText}>Optional for testing. If left blank, a safe placeholder GST will be used.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Invoice Type</Text>
          <View style={styles.chipRow}>
            {invoiceTypes.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setType(option.value)}
                style={[styles.chip, type === option.value && styles.chipActive]}
              >
                <Text style={type === option.value ? styles.chipTextActive : styles.chipText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Party *</Text>
          <Pressable 
            style={styles.dropdownSelector} 
            onPress={() => setIsPartyModalVisible(true)}
          >
            <Text style={selectedParty ? styles.dropdownSelectedText : styles.dropdownPlaceholderText}>
              {selectedParty ? selectedParty.partyName : 'Select a Party'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#64748B" />
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>State of Supply *</Text>
          <TextInput value={stateOfSupply} onChangeText={setStateOfSupply} style={styles.input} placeholder="State name" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Total Amount *</Text>
          <TextInput value={totalAmount} onChangeText={setTotalAmount} style={styles.input} keyboardType="numeric" placeholder="0" />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>Invoice Date</Text>
            <TextInput value={invoiceDate} onChangeText={setInvoiceDate} style={styles.input} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={styles.label}>Due Date</Text>
            <TextInput value={dueDate} onChangeText={setDueDate} style={styles.input} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mode of Payment</Text>
          <View style={styles.chipRow}>
            {paymentModes.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setModeOfPayment(option.value)}
                style={[styles.chip, modeOfPayment === option.value && styles.chipActive]}
              >
                <Text style={modeOfPayment === option.value ? styles.chipTextActive : styles.chipText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          {partyId ? (
            <Text style={styles.partyHint}>
              Selected: {parties.find((party) => party.id === partyId)?.partyName || partyId}
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.chipRow}>
            {statusOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setStatus(option.value)}
                style={[styles.chip, status === option.value && styles.chipActive]}
              >
                <Text style={status === option.value ? styles.chipTextActive : styles.chipText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Details</Text>
          <TextInput value={details} onChangeText={setDetails} style={styles.input} placeholder="Optional notes" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Extra Details</Text>
          <TextInput value={extraDetails} onChangeText={setExtraDetails} style={[styles.input, styles.multiline]} multiline numberOfLines={3} placeholder="Optional extra details" />
        </View>

        <View style={styles.toggleRow}>
          <Pressable onPress={() => setCredit((prev) => !prev)} style={[styles.toggleChip, credit && styles.toggleChipActive]}>
            <Text style={credit ? styles.toggleTextActive : styles.toggleText}>Credit: {credit ? 'Yes' : 'No'}</Text>
          </Pressable>
          <Pressable onPress={() => setIsInventory((prev) => !prev)} style={[styles.toggleChip, isInventory && styles.toggleChipActive]}>
            <Text style={isInventory ? styles.toggleTextActive : styles.toggleText}>Inventory: {isInventory ? 'Yes' : 'No'}</Text>
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Invoice Items</Text>
          {lines.map((line, index) => (
            <View key={`line-${index}`} style={styles.lineCard}>
              <Text style={styles.lineTitle}>Item {index + 1}</Text>
              <View style={styles.field}>
                <Text style={styles.smallLabel}>Item</Text>
                <View style={styles.partyGrid}>
                  {items.map((item) => {
                    const active = line.itemId === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => handleLineChange(index, 'itemId', item.id)}
                        style={[styles.itemCard, active && styles.partyCardActive]}
                      >
                        <Text style={styles.partyTitle}>{item.itemName}</Text>
                        <Text style={styles.partyMeta}>{item.unit}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.field, styles.third]}>
                  <Text style={styles.smallLabel}>Qty</Text>
                  <TextInput value={line.quantity} onChangeText={(value) => handleLineChange(index, 'quantity', value)} style={styles.input} keyboardType="numeric" />
                </View>
                <View style={[styles.field, styles.third]}>
                  <Text style={styles.smallLabel}>Discount</Text>
                  <TextInput value={line.discount} onChangeText={(value) => handleLineChange(index, 'discount', value)} style={styles.input} keyboardType="numeric" />
                </View>
                <View style={[styles.field, styles.third]}>
                  <Text style={styles.smallLabel}>Tax %</Text>
                  <TextInput value={line.taxPercent} onChangeText={(value) => handleLineChange(index, 'taxPercent', value)} style={styles.input} keyboardType="numeric" />
                </View>
              </View>
              {lines.length > 1 ? (
                <Pressable onPress={() => removeLine(index)} style={styles.removeLineButton}>
                  <Text style={styles.removeLineText}>Remove item</Text>
                </Pressable>
              ) : null}
            </View>
          ))}

          <Pressable onPress={addLine} style={styles.addLineButton}>
            <Text style={styles.addLineText}>+ Add item line</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button title={saving ? 'Creating...' : 'Create Invoice'} onPress={handleCreate} loading={saving} size="large" fullWidth />
      </Card>

      <Modal visible={isPartyModalVisible} animationType="slide" transparent={true} onRequestClose={() => setIsPartyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Party</Text>
              <Pressable onPress={() => setIsPartyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </Pressable>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or type..."
              value={partySearchQuery}
              onChangeText={setPartySearchQuery}
            />
            <FlatList
              data={filteredParties}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.modalListItem, item.id === partyId && styles.modalListItemActive]}
                  onPress={() => {
                    setPartyId(item.id);
                    setStateOfSupply(item.address ?? stateOfSupply);
                    setGstNumber(item.gstin ?? gstNumber);
                    setIsPartyModalVisible(false);
                    setPartySearchQuery('');
                  }}
                >
                  <Text style={styles.partyTitle}>{item.partyName}</Text>
                  <Text style={styles.partyMeta}>{item.type}</Text>
                  {item.gstin ? <Text style={styles.partyMetaSmall}>GST: {item.gstin}</Text> : null}
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No parties found.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 24,
  },
  headerActionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  card: {
    marginHorizontal: 16,
    paddingTop: 18,
  },
  field: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  third: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#60708A',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  smallLabel: {
    fontSize: 11,
    color: '#60708A',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    padding: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  helperText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#D1E3FF',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#347BE5',
    borderColor: '#347BE5',
  },
  chipText: {
    fontSize: 12,
    color: '#3B4A65',
  },
  chipTextActive: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  partyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  partyCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5EAF3',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#fff',
  },
  partyCardActive: {
    borderColor: '#347BE5',
    backgroundColor: '#EEF4FF',
  },
  partyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  partyMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  partyMetaSmall: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  partyHint: {
    color: '#64748B',
    marginTop: 8,
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  toggleChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  toggleChipActive: {
    backgroundColor: '#EEF4FF',
    borderColor: '#347BE5',
  },
  toggleText: {
    color: '#3B4A65',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#347BE5',
    fontWeight: '700',
  },
  lineCard: {
    borderWidth: 1,
    borderColor: '#E5EAF3',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  lineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  itemCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5EAF3',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#fff',
  },
  removeLineButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  removeLineText: {
    color: '#B91C1C',
    fontWeight: '700',
    fontSize: 12,
  },
  addLineButton: {
    borderWidth: 1,
    borderColor: '#347BE5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
  },
  addLineText: {
    color: '#347BE5',
    fontWeight: '700',
  },
  errorText: {
    color: '#D64A4A',
    marginBottom: 12,
  },
  dropdownSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  dropdownPlaceholderText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    color: '#0F172A',
  },
  modalListItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalListItemActive: {
    backgroundColor: '#EEF4FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 20,
  },
});
