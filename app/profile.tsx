import { Redirect } from 'expo-router';

import ProfileScreen from '../src/features/profile/screens/ProfileScreen';
import { useAuthStore } from '../src/store/authStore';

export default function Profile() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <ProfileScreen />;
}
