import DashboardScreen from "../src/features/dashboard/screens/DashboardScreen";
import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <DashboardScreen />;
}
