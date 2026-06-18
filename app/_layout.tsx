import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';

// ... existing ignore warnings ...
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.map(String).join(' ');
    if (
      message.includes('shadow*') ||
      message.includes('TouchableMixin') ||
      message.includes('useNativeDriver') ||
      message.includes('Blocked aria-hidden on an element')
    ) {
      return; // Suppress known harmless warnings
    }
    originalWarn(...args);
  };
  
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.map(String).join(' ');
    if (
      message.includes('Blocked aria-hidden on an element') ||
      message.includes("The action 'GO_BACK' was not handled") ||
      message.includes('Invalid DOM property') ||
      message.includes('Unknown event handler property')
    ) {
      return; // Suppress known harmless errors
    }
    originalError(...args);
  };
}

LogBox.ignoreLogs([
  '"shadow*" style props are deprecated',
  'Animated: `useNativeDriver` is not supported',
  'TouchableMixin is deprecated',
  "The action 'GO_BACK' was not handled",
]);

export default function RootLayout() {
  const loadAuth = useAuthStore((state) => state.loadAuth);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const segments = useSegments();

  // App start hote hi pehle auth data load karo
  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  // Global Auth Guard
  useEffect(() => {
    if (!isHydrated) return;

    const segment = segments[0] as string | undefined;
    const inAuthGroup =
      segment === 'login' ||
      segment === 'signup' ||
      segment === 'otp' ||
      segment === 'otp-success' ||
      segment === 'forgot-password';

    if (!token && !inAuthGroup && segments[0] !== undefined) {
      // We use a small timeout to let navigation mount fully
      setTimeout(() => {
        router.replace('/login');
      }, 0);
    }
  }, [token, isHydrated, segments]);

  // Jab tak storage se data load nahi hota, kuch mat dikhao (blank ya splash)
  if (!isHydrated) {
    return null; 
  }

  // Ek baar load ho gaya, tabhi screens render karo
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <Stack screenOptions={{ headerShown: false }} />
    </ApplicationProvider>
  );
}
