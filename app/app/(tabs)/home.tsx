import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useCircleStore, Circle } from '../../store/circleStore';
import { formatNaira } from '../../lib/formatNaira';
import { frequencyToPidgin } from '../../lib/formatPidgin';

export default function HomeScreen() {
  const router = useRouter();
  const { displayName } = useAuthStore();
  const { circles, setCircles } = useCircleStore();
  const [refreshing, setRefreshing] = useState(false);

  async function loadCircles() {
    try {
      const data = await api.get<Circle[]>('/circles');
      setCircles(data);
    } catch (err) {
      Alert.alert('E no load', 'Check your connection and pull down to refresh');
    }
  }

  useEffect(() => {
    loadCircles();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await loadCircles();
    setRefreshing(false);
  }

  const firstName = displayName?.split(' ')[0] ?? 'Welcome';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>How far, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Your savings dey wait for you</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/circle/create')}
        >
          <Text style={styles.createButtonText}>+ New Circle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006B3C" />}
      >
        {circles.length === 0 ? (
          <EmptyState onPress={() => router.push('/circle/create')} />
        ) : (
          circles.map((circle) => (
            <CircleCard
              key={circle.id}
              circle={circle}
              onPress={() => router.push(`/circle/${circle.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function CircleCard({ circle, onPress }: { circle: Circle & { member_count?: number }; onPress: () => void }) {
  const memberCount = (circle as { member_count?: number }).member_count ?? 0;
  const percentFull = Math.round((memberCount / circle.size) * 100);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={1}>{circle.name}</Text>
        <StatusBadge status={circle.status} />
      </View>

      <Text style={styles.cardAmount}>{formatNaira(circle.amount_naira)}</Text>
      <Text style={styles.cardFrequency}>{frequencyToPidgin(circle.frequency)}</Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentFull}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {memberCount} of {circle.size} members joined
      </Text>
    </TouchableOpacity>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    forming: { bg: '#FEF3C7', text: '#D97706', label: 'Forming' },
    active: { bg: '#F0FDF4', text: '#16A34A', label: 'Active' },
    completed: { bg: '#F3F4F6', text: '#6B7280', label: 'Done' },
  }[status] ?? { bg: '#F3F4F6', text: '#6B7280', label: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

function EmptyState({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🌿</Text>
      <Text style={styles.emptyTitle}>No circle yet</Text>
      <Text style={styles.emptyDesc}>
        Create your own circle or ask a friend to share their invite link with you
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onPress}>
        <Text style={styles.emptyButtonText}>Start Your Circle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#006B3C',
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  createButton: {
    backgroundColor: '#F4A228',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  createButtonText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardAmount: { fontSize: 32, fontWeight: '800', color: '#006B3C', marginBottom: 2 },
  cardFrequency: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  progressBar: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: '#006B3C', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: '#9CA3AF' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  emptyButton: {
    backgroundColor: '#006B3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  emptyButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
