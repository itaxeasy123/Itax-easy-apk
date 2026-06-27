import { Redirect } from 'expo-router';

import EditProfileScreen from '../src/features/profile/screens/EditProfileScreen';
import { useAuthStore } from '../src/store/authStore';

export default function EditProfile() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <EditProfileScreen />;
}
