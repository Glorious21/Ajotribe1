import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share, Alert, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { useCircleStore, CircleMember } from '../../store/circleStore';
import { formatNaira } from '../../lib/formatNaira';
import { statusToPidgin, contributionConfirmed, errorMessage, frequencyToPidgin } from '../../lib/formatPidgin';
import { shareText } from '../../lib/deepLinks';
import CircleProgressRing from '../../components/CircleProgressRing';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export default function CircleDashboardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { token, userId } = useAuthStore();
  const { activeCircle, activeMembers, currentRound, mySlot, totalPot, setActiveCircle, updateMemberStatus } = useCircleStore();
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  async function loadDashboard() {
    try {
      const data = await api.get<{
        circle: typeof activeCircle;
        members: CircleMember[];
        currentRound: number;
        mySlot: number;
        totalPot: number;
      }>(`/circles/${id}`);
      if (data.circle) {
        setActiveCircle(data.circle, data.members, data.currentRound, data.mySlot, data.totalPot);
      }
    } catch (err) {
      Alert.alert('E no load', errorMessage(err));
    }
  }

  useEffect(() => {
    loadDashboard();

    // Connect Socket.io for real-time updates
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;
    socket.emit('join:circle', id);

    socket.on('contribution:confirmed', (data: { userId: string; amountNaira: number }) => {
      updateMemberStatus(data.userId, 'confirmed');
      showToast(contributionConfirmed(data.amountNaira));
    });

    socket.on('collection:completed', (data: { collector: string; amountNaira: number; roundNumber: number }) => {
      router.push({
        pathname: '/circle/collected',
        params: {
          collector: data.collector,
          amount: String(data.amountNaira),
          roundNumber: String(data.roundNumber ?? currentRound),
          circleId: id,
        },
      });
    });

    return () => {
      socket.emit('leave:circle', id);
      socket.disconnect();
    };
  }, [id]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleShare() {
    if (!activeCircle) return;
    try {
      await Share.share({
        message: shareText(
          activeCircle.name,
          activeCircle.amount_naira / 100,
          frequencyToPidgin(activeCircle.frequency),
          activeCircle.invite_code
        ),
        url: `https://ajotribe.ng/join/${activeCircle.invite_code}`,
        title: `Join ${activeCircle.name}`,
      });
    } catch {}
  }

  const confirmedCount = activeMembers.filter((m) => m.contribution_status === 'confirmed').length;
  const isOrganiser = activeCircle?.organiser_id === userId;

  return (
    <View style={styles.container}>
      {/* Toast notification */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{activeCircle?.name ?? 'Circle'}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadDashboard(); setRefreshing(false); }} tintColor="#006B3C" />}
      >
        {/* Pot amount */}
        <View style={styles.potCard}>
          <Text style={styles.potLabel}>Round {currentRound} pot</Text>
          <Text style={styles.potAmount}>{formatNaira(totalPot)}</Text>
          <Text style={styles.potSub}>
            {confirmedCount} of {activeCircle?.size ?? 0} members don pay
          </Text>
        </View>

        {/* Progress ring */}
        <View style={styles.ringWrapper}>
          <CircleProgressRing
            total={activeCircle?.size ?? 0}
            confirmed={confirmedCount}
            size={200}
          />
          <View style={styles.ringCenter}>
            <Text style={styles.ringPercent}>
              {activeCircle?.size ? Math.round((confirmedCount / activeCircle.size) * 100) : 0}%
            </Text>
            <Text style={styles.ringLabel}>collected</Text>
          </View>
        </View>

        {/* My slot */}
        {mySlot && (
          <View style={styles.mySlotCard}>
            <Text style={styles.mySlotText}>
              Your slot: <Text style={styles.mySlotBold}>Week {mySlot}</Text>
            </Text>
          </View>
        )}

        {/* Member list */}
        <Text style={styles.sectionTitle}>Members</Text>
        {activeMembers.map((member) => (
          <MemberRow key={member.id} member={member} isMe={member.id === userId} />
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => router.push(`/contribute/${id}`)}
          >
            <Text style={styles.payButtonText}>Pay My Own 💳</Text>
          </TouchableOpacity>

          {isOrganiser && (
            <TouchableOpacity
              style={styles.releaseButton}
              onPress={() => router.push(`/circle/${id}/manage`)}
            >
              <Text style={styles.releaseButtonText}>Manage Circle 🏦</Text>
            </TouchableOpacity>
          )}

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push(`/circle/${id}/members`)}
            >
              <Text style={styles.secondaryButtonText}>👥 Members</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
              <Text style={styles.secondaryButtonText}>📤 Invite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


function MemberRow({ member, isMe }: { member: CircleMember; isMe: boolean }) {
  const status = (member.contribution_status ?? 'upcoming') as 'confirmed' | 'pending' | 'missed' | 'upcoming';
  const statusColor = {
    confirmed: '#16A34A',
    pending: '#D97706',
    missed: '#DC2626',
    upcoming: '#9CA3AF',
  }[status];

  return (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {(member.display_name ?? member.phone_number.slice(-4))[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {member.display_name ?? `****${member.phone_number.slice(-4)}`}
          {isMe && <Text style={styles.meTag}> (You)</Text>}
        </Text>
        <Text style={styles.memberSlot}>Week {member.slot_number}</Text>
      </View>
      <View style={styles.memberStatus}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{statusToPidgin(status)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  toast: {
    position: 'absolute', top: 56, left: 16, right: 16, zIndex: 100,
    backgroundColor: '#111827', borderRadius: 12, padding: 14,
  },
  toastText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: '#006B3C',
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginHorizontal: 8 },
  shareBtn: { padding: 4 },
  shareText: { fontSize: 15, color: '#F4A228', fontWeight: '600' },
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  potCard: {
    backgroundColor: '#006B3C', borderRadius: 20, padding: 24, alignItems: 'center',
  },
  potLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  potAmount: { fontSize: 48, fontWeight: '800', color: '#FFFFFF' },
  potSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  ringWrapper: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPercent: { fontSize: 36, fontWeight: '800', color: '#111827' },
  ringLabel: { fontSize: 13, color: '#6B7280' },
  mySlotCard: {
    backgroundColor: '#FEF3C7', borderRadius: 12, padding: 14, alignItems: 'center',
  },
  mySlotText: { fontSize: 15, color: '#92400E' },
  mySlotBold: { fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 8 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 14, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  memberAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#006B3C', alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  meTag: { fontSize: 13, color: '#6B7280', fontWeight: '400' },
  memberSlot: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  memberStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  actions: { gap: 12, marginTop: 8 },
  payButton: {
    backgroundColor: '#006B3C', paddingVertical: 18, borderRadius: 16, alignItems: 'center',
  },
  payButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  releaseButton: {
    backgroundColor: '#F4A228', paddingVertical: 16, borderRadius: 16, alignItems: 'center',
  },
  releaseButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryButton: {
    flex: 1, borderWidth: 1.5, borderColor: '#006B3C',
    paddingVertical: 14, borderRadius: 16, alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '600', color: '#006B3C' },
});
