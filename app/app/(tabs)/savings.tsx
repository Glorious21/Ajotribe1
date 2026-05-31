import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useWalletStore } from '../../store/walletStore';
import { formatNaira } from '../../lib/formatNaira';

export default function SavingsScreen() {
  const { displayName } = useAuthStore();
  const { setSummary, totalSaved, totalCollected, circlesCompleted, missedPayments, activeCircles, isLoaded } = useWalletStore();
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await api.get<{
        totalSaved: number;
        totalCollected: number;
        circlesCompleted: number;
        missedPayments: number;
        activeCircles: number;
      }>('/users/me/savings');
      setSummary(data);
    } catch {}
  }

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Savings</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor="#006B3C" />}
      >
        <View style={styles.heroBanner}>
          <Text style={styles.heroLabel}>Total you don save</Text>
          <Text style={styles.heroAmount}>{isLoaded ? formatNaira(totalSaved) : '₦...'}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{isLoaded ? formatNaira(totalCollected) : '₦...'}</Text>
            <Text style={styles.statLabel}>Collected so far</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{circlesCompleted}</Text>
            <Text style={styles.statLabel}>Circles completed</Text>
          </View>
        </View>

        {missedPayments > 0 && (
          <View style={styles.missedCard}>
            <Text style={styles.missedText}>
              ⚠️ {missedPayments} missed payment{missedPayments !== 1 ? 's' : ''} on your record. Pay on time to keep your reputation clean.
            </Text>
          </View>
        )}

        <View style={styles.reputationCard}>
          <Text style={styles.reputationTitle}>Your reputation</Text>
          <Text style={styles.reputationDesc}>
            Complete more circles to build your savings reputation. Members with good reputation get first choice of slots.
          </Text>
          <View style={styles.stars}>
            {[1,2,3,4,5].map((i) => (
              <Text key={i} style={[styles.star, i <= circlesCompleted && styles.starFilled]}>★</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  header: { paddingTop: 64, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: '#006B3C' },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  content: { padding: 20, gap: 16 },
  heroBanner: {
    backgroundColor: '#006B3C',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  heroLabel: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  heroAmount: { fontSize: 48, fontWeight: '800', color: '#FFFFFF' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  missedCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  missedText: { fontSize: 13, color: '#991B1B', lineHeight: 20 },
  reputationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
  },
  reputationTitle: { fontSize: 16, fontWeight: '700', color: '#92400E', marginBottom: 8 },
  reputationDesc: { fontSize: 13, color: '#92400E', lineHeight: 18, marginBottom: 12 },
  stars: { flexDirection: 'row', gap: 4 },
  star: { fontSize: 24, color: '#E5E7EB' },
  starFilled: { color: '#F4A228' },
});
