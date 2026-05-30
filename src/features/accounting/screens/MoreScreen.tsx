import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { accountingTheme } from "../../../theme/accounting";
import {
  BottomNav,
  Header,
  Card,
  ListItem,
} from '../components';

type MenuIconName = React.ComponentProps<typeof ListItem>['leftIcon'];

export default function MoreScreen() {
  const router = useRouter();

  const menuItems: {
    id: string;
    title: string;
    subtitle: string;
    icon: NonNullable<MenuIconName>;
  }[] = [
    { id: 'vouchers', title: 'Vouchers', subtitle: 'Record journal entries', icon: 'albums' },
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
    { id: 'settings', title: 'Settings', subtitle: 'Configure accounting settings', icon: 'settings' },
    { id: 'help', title: 'Help & Support', subtitle: 'Get help and support', icon: 'help-circle' },
  ];

  const handleMenuItemPress = (itemId: string) => {
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
});
