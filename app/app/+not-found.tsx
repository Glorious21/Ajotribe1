import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🤷</Text>
      <Text style={styles.title}>Page no dey here</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)/home')}>
        <Text style={styles.buttonText}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAF9', gap: 20 },
  emoji: { fontSize: 56 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  button: { backgroundColor: '#006B3C', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 },
  buttonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
