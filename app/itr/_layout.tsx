import { Stack, Redirect } from "expo-router";
import { useAuthStore } from "../../src/store/authStore";
import { useEffect } from "react";

export default function ITRLayout() {
  const { token, isHydrated, loadAuth } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) {
      loadAuth();
    }
  }, [isHydrated]);

  if (!isHydrated) {
    // Optionally return a loading screen here
    return null; 
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
