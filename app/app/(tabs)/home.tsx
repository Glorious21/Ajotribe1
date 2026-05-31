import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, Modal, TextInput, ActivityIndicator,
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

  // Create circle modal
  const [createVisible, setCreateVisible] = useState(false);
  const [circleName, setCircleName] = useState('');
  const [circleAmount, setCircleAmount] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);

  // Join circle modal
  const [joinVisible, setJoinVisible] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  async function loadCircles() {
    try {
      const data = await api.get<Circle[]>('/circles');
      setCircles(data);
    } catch {
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

  function openCreate() {
    setCreatedInviteCode(null);
    setCircleName('');
    setCircleAmount('');
    setCreateVisible(true);
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const result = await api.post<{ circle: { id: string; invite_code: string }; inviteLink: string }>(
        '/circles',
        {
          name: circleName.trim(),
          amount_naira: parseInt(circleAmount, 10) * 100,
          frequency: 'weekly',
          size: 5,
          start_date: '2026-06-01',
        }
      );
      setCreatedInviteCode(result.circle.invite_code);
      await loadCircles();
    } catch (err) {
      Alert.alert('E no create', err instanceof Error ? err.message : 'Try again');
    } finally {
      setCreating(false);
    }
  }

  async function handleJoin() {
    setJoining(true);
    try {
      const result = await api.post<{ circleId: string; slotNumber: number }>(
        `/circles/join/${joinCode.trim()}`,
        {}
      );
      setJoinVisible(false);
      setJoinCode('');
      await loadCircles();
      router.push(`/circle/${result.circleId}`);
    } catch (err) {
      Alert.alert('E no work', err instanceof Error ? err.message : 'Try again');
    } finally {
      setJoining(false);
    }
  }

  const firstName = displayName?.split(' ')[0] ?? 'Welcome';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>How far, {firstName} 👋</Text>
          <Text style={styles.subGreeting}>Your savings dey wait for you</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.joinHeaderBtn} onPress={() => setJoinVisible(true)}>
            <Text style={styles.joinHeaderBtnText}>Join</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={openCreate}>
            <Text style={styles.createButtonText}>+ New Circle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006B3C" />}
      >
        {circles.length === 0 ? (
          <EmptyState onCreate={openCreate} onJoin={() => setJoinVisible(true)} />
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

      {/* Create Circle Modal */}
      <Modal visible={createVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {createdInviteCode ? (
              <>
                <Text style={styles.modalTitle}>Circle don create! 🎉</Text>
                <Text style={styles.modalHint}>Share this invite code with your people:</Text>
                <View style={styles.codeBox}>
                  <Text style={styles.codeText}>{createdInviteCode}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => setCreateVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Create New Circle</Text>
                <Text style={styles.fieldLabel}>Circle Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="E.g. Friday Market Ajo"
                  placeholderTextColor="#9CA3AF"
                  value={circleName}
                  onChangeText={setCircleName}
                  autoFocus
                />
                <Text style={styles.fieldLabel}>Amount per person (₦)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="10000"
                  placeholderTextColor="#9CA3AF"
                  value={circleAmount}
                  onChangeText={(v) => setCircleAmount(v.replace(/\D/g, ''))}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  style={[styles.modalBtn, (creating || !circleName.trim() || !circleAmount) && styles.modalBtnDisabled]}
                  onPress={handleCreate}
                  disabled={creating || !circleName.trim() || !circleAmount}
                >
                  {creating
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.modalBtnText}>Create Circle</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Join Circle Modal */}
      <Modal visible={joinVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Join a Circle</Text>
            <Text style={styles.fieldLabel}>Enter invite code</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ask your organiser for the code"
              placeholderTextColor="#9CA3AF"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.modalBtn, (joining || !joinCode.trim()) && styles.modalBtnDisabled]}
              onPress={handleJoin}
              disabled={joining || !joinCode.trim()}
            >
              {joining
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.modalBtnText}>Join Circle 🤝</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setJoinVisible(false); setJoinCode(''); }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

function EmptyState({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>🌿</Text>
      <Text style={styles.emptyTitle}>No circle yet</Text>
      <Text style={styles.emptyDesc}>
        Create your own circle or join one with an invite code
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onCreate}>
        <Text style={styles.emptyButtonText}>Start Your Circle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.emptyJoinButton} onPress={onJoin}>
        <Text style={styles.emptyJoinButtonText}>Join a Circle</Text>
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
  headerButtons: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  joinHeaderBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
  },
  joinHeaderBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
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
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32, gap: 12 },
  emptyEmoji: { fontSize: 64, marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  emptyButton: {
    backgroundColor: '#006B3C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  emptyButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  emptyJoinButton: {
    borderWidth: 1.5,
    borderColor: '#006B3C',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  emptyJoinButtonText: { fontSize: 16, fontWeight: '600', color: '#006B3C' },

  // Modals
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 48,
    gap: 12,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4 },
  modalHint: { fontSize: 14, color: '#6B7280' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 4 },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FAFAF9',
  },
  modalBtn: {
    backgroundColor: '#006B3C',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  modalBtnDisabled: { backgroundColor: '#9CA3AF' },
  modalBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 15, color: '#9CA3AF' },
  codeBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#16A34A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  codeText: { fontSize: 28, fontWeight: '800', color: '#006B3C', letterSpacing: 2 },
});
