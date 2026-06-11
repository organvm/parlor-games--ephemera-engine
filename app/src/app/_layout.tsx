import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';

export default function RootLayout() {
  const { initialized, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isSandbox = segments[0] === 'sandbox';

    if (isAuthenticated && inAuthGroup) {
      // Redirect away from auth screens to app
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup && !isSandbox) {
      // Redirect unauthenticated users to welcome screen
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, initialized, segments]);

  if (!initialized) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="sandbox" options={{ title: 'Sandbox', presentation: 'modal' }} />
    </Stack>
  );
}
