import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BottomNav,
  Header,
  Card,
  ListItem,
} from '../components';

type MenuIconName = React.ComponentProps<typeof ListItem>['leftIcon'];

export default function MoreScreen() {
  const router = useRouter();

  const menuItems: Array<{
    id: string;
    title: string;
    subtitle: string;
    icon: NonNullable<MenuIconName>;
  }> = [
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
      router.push('/accounting/daybook');
      return;
    }

    if (itemId === 'vouchers') {
      router.push('/accounting/vouchers');
      return;
    }

    // if (itemId === 'print-views') {
    //   router.push('/accounting/print');
    //   return;
    // }

    if (itemId === 'trial-balance') {
      router.push('/accounting/trial-balance');
      return;
    }

    if (itemId === 'payments') {
      router.push('/accounting/payments');
      return;
    }

    if (itemId === 'bank-tools') {
      router.push('/accounting/bank');
      return;
    }
    if (itemId === 'bank-statement') {
  router.push('/accounting/bank-statement');
  return;
}
    if (itemId === 'driving-licence') {
      router.push('/accounting/driving-licence');
      return;
    }

    if (itemId === 'invoice-ocr') {
      router.push('/accounting/invoice');
      return;
    }
    if (itemId === 'gst-ocr') {
      router.push('/accounting/gst-ocr');
      return;
    }
    if (itemId === 'company-create') {
      router.push('/accounting/company-create');
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
