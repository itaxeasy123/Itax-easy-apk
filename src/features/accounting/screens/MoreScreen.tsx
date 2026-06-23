import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { accountingTheme } from "../../../theme/accounting";
import {
  BottomNav,
  Header,
  Card,
  ListItem,
} from '../components';
import { billshieldBackup } from '../local';
import { useAuthStore } from '../../../store/authStore';
import { accountingService } from '../services/accountingService';
import { notify } from '../../../utils/notify';

type MenuIconName = React.ComponentProps<typeof ListItem>['leftIcon'];

export default function MoreScreen() {
  const router = useRouter();
  const currentUserId = useAuthStore((state) => state.user?.id);

  // "Inventory" is a per-user feature flag. When ON, the user can maintain an
  // item/stock list and add items to invoices. When OFF, item creation is
  // blocked by the backend (403) and the user bills with manual line items.
  const [inventoryEnabled, setInventoryEnabled] = useState<boolean | null>(null);
  const [inventoryFirstName, setInventoryFirstName] = useState('');
  const [savingInventory, setSavingInventory] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await accountingService.getCurrentUserProfile();
        if (!active) return;
        setInventoryEnabled(Boolean(res.data?.inventory));
        setInventoryFirstName(res.data?.firstName ?? '');
      } catch {
        // getApiErrorMessage/global handler already surfaces the failure;
        // leave the toggle hidden (null) if we couldn't read the profile.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleToggleInventory = async (next: boolean) => {
    if (savingInventory) return;

    if (!inventoryFirstName.trim()) {
      Alert.alert(
        'Profile incomplete',
        'Please set your first name in your profile before changing this setting.'
      );
      return;
    }

    const previous = inventoryEnabled;
    setInventoryEnabled(next); // optimistic
    setSavingInventory(true);
    try {
      await accountingService.setInventoryEnabled(next, inventoryFirstName.trim());
      notify(next ? 'Inventory enabled.' : 'Inventory disabled.');
    } catch {
      setInventoryEnabled(previous); // revert on failure (toast shown globally)
    } finally {
      setSavingInventory(false);
    }
  };

  const menuItems: {
    id: string;
    title: string;
    subtitle: string;
    icon: NonNullable<MenuIconName>;
  }[] = [
    { id: 'vouchers', title: 'Vouchers', subtitle: 'Record journal entries', icon: 'albums' },
    { id: 'companies', title: 'Companies & Fiscal Years', subtitle: 'Switch books, close the year', icon: 'briefcase' },
    { id: 'chart-of-accounts', title: 'Chart of Accounts', subtitle: 'Groups, sub-groups and ledgers tree', icon: 'git-branch' },
    { id: 'bankbook', title: 'Bankbook & Reconciliation', subtitle: 'Bank entries, cheque clearing', icon: 'business' },
    { id: 'payments', title: 'Payments', subtitle: 'View payment transactions', icon: 'card' },
    { id: 'bank-tools', title: 'Bank Tools', subtitle: 'IFSC lookup and account verify', icon: 'business' },
    {
  id: 'bank-statement',
  title: 'Bank Statement OCR',
  subtitle: 'Upload and extract bank statement data',
  icon: 'document-text',
},
    {
  id: 'driving-licence',
  title: 'Driving Licence OCR',
  subtitle: 'Upload and extract driving licence data',
  icon: 'document-text',
},
    {
  id: 'invoice-ocr',
  title: 'Invoice OCR',
  subtitle: 'Upload and extract invoice data',
  icon: 'document-text',
},

   {
  id: 'gst-ocr',
  title: 'GST OCR',
  subtitle: 'Upload and extract GST data',
  icon: 'document-text',
},
    { id: 'company-create', title: 'Add Company', subtitle: 'Create a new company profile', icon: 'briefcase' },
    { id: 'export-db', title: 'Export / Back up Data', subtitle: 'Save billshield.db to Files, Drive or email', icon: 'cloud-upload' },
    { id: 'import-db', title: 'Import / Restore Data', subtitle: 'Replace local data from a backup file', icon: 'cloud-download' },
    { id: 'settings', title: 'Settings', subtitle: 'Configure accounting settings', icon: 'settings' },
    { id: 'help', title: 'Help & Support', subtitle: 'Get help and support', icon: 'help-circle' },
  ];

  const handleMenuItemPress = async (itemId: string) => {
    if (itemId === 'export-db') {
      const res = await billshieldBackup.exportToFile();
      if (!res.success) {
        Alert.alert('Export failed', res.message ?? 'Could not export the database.');
      }
      // On success the OS share-sheet opens — pick "Save to Files" → Downloads
      // to get a copy of billshield.db you can browse in the Files app.
      return;
    }

    if (itemId === 'import-db') {
      Alert.alert(
        'Restore data?',
        'This replaces ALL current BillShield data on this device with the backup file you choose. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Choose file',
            style: 'destructive',
            onPress: async () => {
              const res = await billshieldBackup.importFromFile(currentUserId);
              Alert.alert(
                res.success ? 'Restored' : 'Import failed',
                res.success
                  ? 'Data restored from the backup under your account. Reopen the accounting screens to see it.'
                  : res.message ?? 'Could not import the file.'
              );
            },
          },
        ]
      );
      return;
    }

    if (itemId === 'daybook') {
      router.navigate('/accounting/daybook');
      return;
    }

    if (itemId === 'vouchers') {
      router.navigate('/accounting/vouchers');
      return;
    }

    // if (itemId === 'print-views') {
    //   router.navigate('/accounting/print');
    //   return;
    // }

    if (itemId === 'trial-balance') {
      router.navigate('/accounting/trial-balance');
      return;
    }

    if (itemId === 'payments') {
      router.navigate('/accounting/payments');
      return;
    }

    if (itemId === 'bank-tools') {
      router.navigate('/accounting/bank');
      return;
    }
    if (itemId === 'bank-statement') {
  router.navigate('/accounting/bank-statement');
  return;
}
    if (itemId === 'driving-licence') {
      router.navigate('/accounting/driving-licence');
      return;
    }

    if (itemId === 'invoice-ocr') {
      router.navigate('/accounting/invoice');
      return;
    }
    if (itemId === 'gst-ocr') {
      router.navigate('/accounting/gst-ocr');
      return;
    }
    if (itemId === 'company-create') {
      router.navigate('/accounting/company-create');
      return;
    }
    if (itemId === 'companies') {
      router.navigate('/accounting/companies');
      return;
    }
    if (itemId === 'chart-of-accounts') {
      router.navigate('/accounting/chart-of-accounts');
      return;
    }
    if (itemId === 'bankbook') {
      router.navigate('/accounting/bankbook');
      return;
    }

    Alert.alert('Coming soon', `${itemId} screen is not wired yet.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Header
          title="More"
          subtitle="Additional accounting features"
          showBackButton={false}
        />

        <View style={styles.menuContainer}>
          <Card>
            <View style={styles.inventoryRow}>
              <View style={styles.inventoryTextWrap}>
                <Text style={styles.inventoryTitle}>Inventory</Text>
                <Text style={styles.inventorySubtitle}>
                  {inventoryEnabled === null
                    ? 'Loading your inventory setting…'
                    : inventoryEnabled
                      ? 'On — you can maintain items & stock and add them to invoices.'
                      : 'Off — bill with manual line items; item/stock list is disabled.'}
                </Text>
              </View>
              {savingInventory || inventoryEnabled === null ? (
                <ActivityIndicator color={accountingTheme.colors.primary} />
              ) : (
                <Switch
                  value={inventoryEnabled}
                  onValueChange={handleToggleInventory}
                />
              )}
            </View>
          </Card>

          {menuItems.map((item) => (
            <Card key={item.id}>
              <ListItem
                title={item.title}
                subtitle={item.subtitle}
                leftIcon={item.icon}
                onPress={() => handleMenuItemPress(item.id)}
                disabled={false}
              />
            </Card>
          ))}
        </View>
      </ScrollView>

      <BottomNav activeRoute="/accounting/more" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  menuContainer: {
    paddingHorizontal: accountingTheme.spacing.lg,
    paddingTop: accountingTheme.spacing.lg,
  },
  inventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  inventoryTextWrap: {
    flex: 1,
  },
  inventoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2940',
  },
  inventorySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
});
