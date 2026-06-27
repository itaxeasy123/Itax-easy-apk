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
import { accountingTheme } from "../../../theme/accounting";

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
              style={styles.bottomItem}
              onPress={() => handleNavigation(item.route)}
            >
              <View
                style={[
                  styles.bottomIconWrap,
                  isActive && styles.bottomIconWrapActive,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={isActive ? "#347BE5" : "#94A3B8"}
                />
              </View>
              <Text
                style={[
                  styles.bottomText,
                  isActive && styles.bottomTextActive,
                ]}
              >
                {item.label}
              </Text>
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
    backgroundColor: '#fff',
    paddingTop: 6,
    paddingBottom: 6,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  bottomIconWrap: {
    width: 34,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIconWrapActive: {
    backgroundColor: '#f0f9ff',
  },
  bottomText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    fontWeight: '500',
  },
  bottomTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
});
