import InvoiceListScreen from '../src/features/invoice/screens/InvoiceListScreen';
// import { Redirect } from 'expo-router';
// import { useAuthStore } from '../src/store/authStore';

export default function Invoices() {
  // TEMP: bypass auth for local UI testing.
  // const token = useAuthStore((state) => state.token);
  // if (!token) {
  //   return <Redirect href="/login" />;
  // }
  return <InvoiceListScreen />;
}
