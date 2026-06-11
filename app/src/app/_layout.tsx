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

    if (isAuthenticated && inAuthGroup) {
      // Redirect away from auth screens to app
      router.replace('/(app)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // Redirect unauthenticated users to welcome screen
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, initialized, segments]);

  if (!initialized) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}
