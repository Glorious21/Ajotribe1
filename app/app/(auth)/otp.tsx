import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { getOrCreateKeypair } from '../../nostr/identity';

export default function OtpScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { setAuth } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  function handleDigit(value: string, index: number) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== '') && next.join('').length === 6) {
      verify(next.join(''));
    }
  }

  function handleBackspace(index: number) {
    if (code[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function verify(fullCode: string) {
    setLoading(true);
    try {
      const result = await api.post<{ token: string; userId: string; isNewUser: boolean }>(
        '/auth/verify-otp',
        { phone_number: phone, code: fullCode }
      );

      // Generate Nostr keypair silently on device
      const { npub } = await getOrCreateKeypair();

      // Register npub with backend (no nsec ever sent)
      await api.post('/auth/profile', { nostr_pubkey: npub });

      setAuth(result.token, result.userId, result.isNewUser);

      if (result.isNewUser) {
        router.replace('/(auth)/name');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      Alert.alert('Wrong code', err instanceof Error ? err.message : 'Try again');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    try {
      await api.post('/auth/send-otp', { phone_number: phone });
      setResendTimer(60);
    } catch (err) {
      Alert.alert('E no send', 'Try again');
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Enter code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              style={[styles.codeBox, digit && styles.codeBoxFilled]}
              value={digit}
              onChangeText={(v) => handleDigit(v, i)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') handleBackspace(i);
              }}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </View>

        {loading && <Text style={styles.verifying}>Checking code...</Text>}

        <View style={styles.resendRow}>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={resendOtp}>
              <Text style={styles.resendLink}>Send new code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  back: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
  backText: { fontSize: 16, color: '#006B3C', fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24, marginBottom: 40 },
  phone: { fontWeight: '700', color: '#111827' },
  codeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  codeBox: {
    flex: 1,
    aspectRatio: 0.9,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  codeBoxFilled: { borderColor: '#006B3C' },
  verifying: { textAlign: 'center', color: '#6B7280', fontSize: 14 },
  resendRow: { alignItems: 'center', marginTop: 8 },
  resendTimer: { color: '#9CA3AF', fontSize: 14 },
  resendLink: { color: '#006B3C', fontSize: 14, fontWeight: '600' },
});
