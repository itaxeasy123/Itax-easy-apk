import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';

type CreateInvoiceSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const OPTIONS = [
  {
    id: 'sales',
    title: 'Sales',
    icon: 'pricetag' as const,
    route: '/accounting/create-sales',
    color: '#4BB543', 
    bgColor: '#E8F5E9',
  },
  {
    id: 'purchase',
    title: 'Purchase',
    icon: 'cart' as const,
    route: '/accounting/create-purchase',
    color: '#4BB543',
    bgColor: '#E8F5E9',
  },
  {
    id: 'receipt',
    title: 'Receipt',
    icon: 'arrow-down-circle' as const,
    route: '/accounting/receipt',
    color: '#4BB543',
    bgColor: '#E8F5E9',
  },
  {
    id: 'payment',
    title: 'Payment',
    icon: 'arrow-up-circle' as const,
    route: '/accounting/payment-create',
    color: '#4BB543',
    bgColor: '#E8F5E9',
  },
  {
    id: 'debit-note',
    title: 'Debit Note',
    icon: 'add-circle' as const,
    route: '/accounting/debit-note',
    color: '#4BB543',
    bgColor: '#E8F5E9',
  },
  {
    id: 'credit-note',
    title: 'Credit Note',
    icon: 'remove-circle' as const,
    route: '/accounting/credit-note',
    color: '#4BB543',
    bgColor: '#E8F5E9',
  },
];

export default function CreateInvoiceSheet({ visible, onClose }: CreateInvoiceSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleOptionPress = (route: string) => {
    onClose();
    // requestAnimationFrame ensures modal starts closing before heavy navigation happens
    requestAnimationFrame(() => {
      router.navigate(route as any);
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}
          onPress={(e) => e.stopPropagation()} 
        >
          <View style={styles.dragIndicator} />
          
          <Text style={styles.title}>Create Invoice</Text>
          
          <View style={styles.grid}>
            {OPTIONS.map((option) => (
              <Pressable 
                key={option.id} 
                style={styles.gridItem} 
                onPress={() => handleOptionPress(option.route)}
              >
                <View style={[styles.iconBox, { backgroundColor: option.bgColor }]}>
                  <Ionicons name={option.icon} size={32} color={option.color} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dragIndicator: {
    width: 48,
    height: 4,
    backgroundColor: '#D9DFEB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: '#304766',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  optionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: '#4B5E79',
    textAlign: 'center',
  },
});
