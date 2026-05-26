import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../store/authStore';
import { parseInviteCode } from '../lib/deepLinks';

export default function RootLayout() {
  const { token, isLoaded, pendingInvite, loadFromStorage, setPendingInvite } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const url = Linking.useURL();

  useEffect(() => {
    loadFromStorage();
  }, []);

  // Handle incoming deep links: ajotribe://circle/{inviteCode}
  useEffect(() => {
    if (!url || !isLoaded) return;
    const code = parseInviteCode(url);
    if (!code) return;

    if (token) {
      router.push({ pathname: '/circle/join', params: { code } });
    } else {
      // User not logged in — stash the code and send them through auth
      setPendingInvite(code);
    }
  }, [url, isLoaded, token]);

  // Auth guard + pending invite redirect after login
  useEffect(() => {
    if (!isLoaded) return;
    const inAuth = segments[0] === '(auth)';

    if (!token && !inAuth) {
      router.replace('/(auth)/welcome');
    } else if (token && inAuth) {
      router.replace('/(tabs)/home');
    } else if (token && !inAuth && pendingInvite) {
      // User just finished auth with a pending invite waiting
      setPendingInvite(null);
      router.push({ pathname: '/circle/join', params: { code: pendingInvite } });
    }
  }, [token, isLoaded, segments, pendingInvite]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="circle/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="circle/[id]/members" options={{ presentation: 'card' }} />
        <Stack.Screen name="circle/[id]/manage" options={{ presentation: 'card' }} />
        <Stack.Screen name="circle/create" options={{ presentation: 'modal' }} />
        <Stack.Screen name="circle/join" options={{ presentation: 'modal' }} />
        <Stack.Screen name="circle/collected" options={{ presentation: 'modal' }} />
        <Stack.Screen name="contribute/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}
