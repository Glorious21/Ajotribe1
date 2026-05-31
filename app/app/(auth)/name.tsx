import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function NameScreen() {
  const router = useRouter();
  const { setProfile } = useAuthStore();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (name.trim().length < 2) {
      Alert.alert('Enter your name', 'We need your name so your circle know who you be');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/profile', { display_name: name.trim() });
      setProfile(name.trim());
      router.replace('/(auth)/bank-setup');
    } catch (err) {
      Alert.alert('E no save', 'Try again abeg');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <View style={styles.emoji}>
          <Text style={{ fontSize: 56 }}>👋</Text>
        </View>
        <Text style={styles.title}>What dem go{'\n'}call you?</Text>
        <Text style={styles.subtitle}>Your circle members go see this name</Text>

        <TextInput
          style={styles.input}
          placeholder="E.g. Mama Tunde"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          autoFocus
          maxLength={50}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (loading || name.trim().length < 2) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={loading || name.trim().length < 2}
        >
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 80, alignItems: 'flex-start' },
  emoji: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', lineHeight: 40, marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 40 },
  input: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#006B3C',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  footer: { paddingHorizontal: 24, paddingBottom: 48 },
  button: { backgroundColor: '#006B3C', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});
