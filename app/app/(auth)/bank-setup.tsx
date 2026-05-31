import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';

const NIGERIAN_BANKS = [
  { name: 'GTBank', code: '058' },
  { name: 'Access Bank', code: '044' },
  { name: 'First Bank', code: '011' },
  { name: 'Zenith Bank', code: '057' },
  { name: 'UBA', code: '033' },
  { name: 'Opay', code: '100' },
  { name: 'Kuda Bank', code: '090267' },
  { name: 'Palmpay', code: '100033' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Sterling Bank', code: '232' },
];

export default function BankSetupScreen() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState<typeof NIGERIAN_BANKS[0] | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const canContinue = selectedBank && accountNumber.length === 10;

  async function handleSave() {
    if (!canContinue) return;
    setLoading(true);
    try {
      await api.post('/auth/profile', {
        bank_name: selectedBank.name,
        bank_code: selectedBank.code,
        bank_account: accountNumber,
      });
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('E no save', 'Check your details and try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your bank account</Text>
        <Text style={styles.subtitle}>
          This na where we go send your money when e reach your turn to collect
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Select your bank</Text>
        <View style={styles.bankGrid}>
          {NIGERIAN_BANKS.map((bank) => (
            <TouchableOpacity
              key={bank.code}
              style={[styles.bankChip, selectedBank?.code === bank.code && styles.bankChipSelected]}
              onPress={() => setSelectedBank(bank)}
            >
              <Text style={[styles.bankChipText, selectedBank?.code === bank.code && styles.bankChipTextSelected]}>
                {bank.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Account number</Text>
        <TextInput
          style={styles.input}
          placeholder="0123456789"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          value={accountNumber}
          onChangeText={(v) => setAccountNumber(v.replace(/\D/g, '').slice(0, 10))}
          maxLength={10}
        />

        {accountNumber.length === 10 && selectedBank && (
          <View style={styles.confirmCard}>
            <Text style={styles.confirmText}>
              {selectedBank.name} — ****{accountNumber.slice(-4)}
            </Text>
            <Text style={styles.confirmSub}>Make sure this account correct before you continue</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.skipButton]}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!canContinue || loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save & Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  header: { paddingTop: 72, paddingHorizontal: 24, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', lineHeight: 22 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12, marginTop: 24 },
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bankChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  bankChipSelected: { borderColor: '#006B3C', backgroundColor: '#006B3C' },
  bankChipText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  bankChipTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    letterSpacing: 4,
  },
  confirmCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  confirmText: { fontSize: 15, fontWeight: '600', color: '#15803D' },
  confirmSub: { fontSize: 12, color: '#16A34A', marginTop: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },
  skipButton: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  button: { backgroundColor: '#006B3C', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});
