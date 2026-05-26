import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  function formatDisplay(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    return digits;
  }

  async function handleSendOtp() {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 11) {
      Alert.alert('Enter your full phone number', 'E.g. 08012345678');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-otp', { phone_number: phone });
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (err) {
      Alert.alert(
        'E no send',
        err instanceof Error ? err.message : 'Check your number and try again'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Enter your{'\n'}phone number</Text>
        <Text style={styles.subtitle}>We go send you a code to verify</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.flagPill}>
            <Text style={styles.flag}>🇳🇬 +234</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="0801 234 5678"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(v) => setPhone(formatDisplay(v))}
            maxLength={11}
            autoFocus
          />
        </View>

        <Text style={styles.hint}>
          Use the same number your circle members know you by
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (loading || phone.replace(/\D/g,'').length < 11) && styles.buttonDisabled]}
          onPress={handleSendOtp}
          disabled={loading || phone.replace(/\D/g,'').length < 11}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  back: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 8 },
  backText: { fontSize: 16, color: '#006B3C', fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', lineHeight: 40, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#006B3C',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  flagPill: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  flag: { fontSize: 15, fontWeight: '600', color: '#374151' },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: 2,
  },
  hint: { marginTop: 16, fontSize: 13, color: '#9CA3AF', lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingBottom: 48 },
  button: {
    backgroundColor: '#006B3C',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});
