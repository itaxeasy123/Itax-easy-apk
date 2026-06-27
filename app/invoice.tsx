import InvoicesScreen from '../src/features/accounting/screens/InvoicesScreen';
// import { Redirect } from 'expo-router';
// import { useAuthStore } from '../src/store/authStore';

export default function Invoice() {
  // TEMP: bypass auth for local UI testing.
  // const token = useAuthStore((state) => state.token);
  // if (!token) {
  //   return <Redirect href="/login" />;
  // }
  return <InvoicesScreen />;
}
