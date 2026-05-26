import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NavItem {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route: Href;
}

interface BottomNavProps {
  activeRoute?: string;
}

const NavItems: NavItem[] = [
  { label: 'Home', icon: 'home', route: '/accounting' },
  { label: 'Parties', icon: 'people', route: '/accounting/parties' },
  { label: 'Items', icon: 'list', route: '/accounting/items' },
  { label: 'Reports', icon: 'bar-chart', route: '/accounting/reports' },
  { label: 'More', icon: 'ellipsis-horizontal', route: '/accounting/more' },
];

export default function BottomNav({ activeRoute = '/accounting' }: BottomNavProps) {
  const router = useRouter();

  const handleNavigation = (route: Href) => {
    router.replace(route);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.navBar}>
        {NavItems.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <Pressable
              key={item.label}
              style={[
                styles.navItem,
                isActive && styles.navItemActive,
              ]}
              onPress={() => handleNavigation(item.route)}
            >
              <View style={styles.itemContent}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={isActive ? '#2563eb' : '#999'}
                />
                <Text
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  navItemActive: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  labelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
