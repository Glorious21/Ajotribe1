import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { formatNaira } from '../../lib/formatNaira';
import { frequencyToPidgin } from '../../lib/formatPidgin';

interface CirclePreview {
  id: string;
  name: string;
  organiser_name: string;
  amount_naira: number;
  frequency: string;
  size: number;
  member_count: number;
  spots_left: number;
  start_date: string;
  status: string;
}

export default function JoinCircleScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [circle, setCircle] = useState<CirclePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!code) return;
    api.get<CirclePreview>(`/circles/invite/${code}`)
      .then(setCircle)
      .catch(() => Alert.alert('Circle not found', 'This invite link no valid again'))
      .finally(() => setLoading(false));
  }, [code]);

  async function handleJoin() {
    if (!circle) return;
    setJoining(true);
    try {
      const result = await api.post<{ circleId: string; slotNumber: number }>(
        `/circles/join/${code}`,
        {}
      );
      router.replace(`/circle/${result.circleId}`);
    } catch (err) {
      Alert.alert('E no work', err instanceof Error ? err.message : 'Try again');
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#006B3C" />
        <Text style={styles.loadingText}>Loading circle...</Text>
      </View>
    );
  }

  if (!circle) return null;

  const totalPot = (circle.amount_naira / 100) * circle.size;
  const canJoin = circle.status !== 'completed' && circle.spots_left > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.close} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.inviteLabel}>You don receive invite to join</Text>
        <Text style={styles.circleName}>{circle.name}</Text>
        <Text style={styles.organiser}>Organised by {circle.organiser_name}</Text>

        <View style={styles.detailCard}>
          <DetailRow icon="💵" label="Your contribution" value={formatNaira(circle.amount_naira)} />
          <DetailRow icon="🔄" label="Frequency" value={frequencyToPidgin(circle.frequency)} />
          <DetailRow icon="👥" label="Circle size" value={`${circle.size} people`} />
          <DetailRow icon="📅" label="Start date" value={circle.start_date} />
          <View style={styles.divider} />
          <DetailRow icon="🏆" label="Total pot per round" value={`₦${totalPot.toLocaleString('en-NG')}`} highlight />
        </View>

        <View style={styles.spotsRow}>
          <View style={[styles.spotsDot, circle.spots_left > 0 ? styles.spotsGreen : styles.spotsRed]} />
          <Text style={styles.spotsText}>
            {circle.spots_left > 0
              ? `${circle.spots_left} spot${circle.spots_left > 1 ? 's' : ''} remaining`
              : 'Circle don full'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {canJoin ? (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin} disabled={joining}>
            <Text style={styles.joinButtonText}>
              {joining ? 'Joining...' : 'Join This Circle 🤝'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fullCard}>
            <Text style={styles.fullText}>This circle don full</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => router.back()} style={styles.declineBtn}>
          <Text style={styles.declineText}>No thanks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: '#6B7280', fontSize: 15 },
  close: { position: 'absolute', top: 56, right: 24, zIndex: 10, padding: 8 },
  closeText: { fontSize: 20, color: '#6B7280', fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 80, gap: 16 },
  inviteLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  circleName: { fontSize: 28, fontWeight: '800', color: '#111827', lineHeight: 36 },
  organiser: { fontSize: 14, color: '#6B7280' },
  detailCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: { fontSize: 18, width: 24 },
  detailLabel: { flex: 1, fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  detailValueHighlight: { fontSize: 16, fontWeight: '800', color: '#006B3C' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  spotsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spotsDot: { width: 10, height: 10, borderRadius: 5 },
  spotsGreen: { backgroundColor: '#16A34A' },
  spotsRed: { backgroundColor: '#DC2626' },
  spotsText: { fontSize: 14, color: '#374151', fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },
  joinButton: {
    backgroundColor: '#006B3C', paddingVertical: 18, borderRadius: 16, alignItems: 'center',
    shadowColor: '#006B3C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  joinButtonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  fullCard: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 18, alignItems: 'center' },
  fullText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  declineBtn: { alignItems: 'center', padding: 12 },
  declineText: { fontSize: 15, color: '#9CA3AF' },
});
