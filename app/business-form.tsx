import { Redirect } from 'expo-router';

import BusinessFormScreen from '../src/features/business/screens/BusinessFormScreen';
import { useAuthStore } from '../src/store/authStore';

export default function BusinessForm() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <BusinessFormScreen />;
}
