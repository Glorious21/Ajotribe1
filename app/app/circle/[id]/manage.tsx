import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../lib/api';
import { MemberCard } from '../../../components/MemberCard';
import { formatNaira } from '../../../lib/formatNaira';
import { errorMessage } from '../../../lib/formatPidgin';
import type { CircleMember } from '../../../store/circleStore';
import type { Circle } from '../../../store/circleStore';

export default function ManageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [releasing, setReleasing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await api.get<{
        circle: Circle;
        members: CircleMember[];
        currentRound: number;
        mySlot: number;
        totalPot: number;
      }>(`/circles/${id}`);
      setCircle(data.circle);
      setMembers(data.members ?? []);
      setCurrentRound(data.currentRound ?? 1);
    } catch {
      Alert.alert('E no load', 'Check your connection and try again');
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleRelease() {
    Alert.alert(
      'Release funds?',
      `This go send ₦${circle ? ((circle.amount_naira * circle.size) / 100).toLocaleString('en-NG') : '...'} to the Week ${currentRound} collector. Make sure all contributions don enter.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Release',
          style: 'destructive',
          onPress: async () => {
            setReleasing(true);
            try {
              await api.post(`/collections/trigger/${id}`, {});
              Alert.alert('E Don Send!', 'Payment don start. E go reach the account in a few minutes.');
              router.back();
            } catch (err) {
              Alert.alert('E no work', errorMessage(err));
            } finally {
              setReleasing(false);
            }
          },
        },
      ]
    );
  }

  const confirmedCount = members.filter((m) => m.contribution_status === 'confirmed').length;
  const allPaid = confirmedCount === (circle?.size ?? 0);
  const totalPot = circle ? circle.amount_naira * circle.size : 0;
  const collectorForRound = members.find((m) => m.slot_number === currentRound);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Circle</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor="#006B3C"
          />
        }
      >
        {/* Collection status card */}
        <View style={styles.roundCard}>
          <Text style={styles.roundLabel}>Week {currentRound} Collection</Text>
          <Text style={styles.roundAmount}>{formatNaira(totalPot)}</Text>
          <Text style={styles.roundSub}>
            {confirmedCount} of {circle?.size ?? '?'} members don pay
          </Text>
          {collectorForRound && (
            <View style={styles.collectorRow}>
              <Text style={styles.collectorLabel}>Collecting this week:</Text>
              <Text style={styles.collectorName}>
                {collectorForRound.display_name ?? `****${collectorForRound.phone_number?.slice(-4)}`}
              </Text>
            </View>
          )}
        </View>

        {/* Release button */}
        {circle?.status === 'active' && (
          <TouchableOpacity
            style={[styles.releaseBtn, (!allPaid || releasing) && styles.releaseBtnDisabled]}
            onPress={handleRelease}
            disabled={releasing}
          >
            <Text style={styles.releaseBtnText}>
              {releasing ? 'Sending...' : allPaid ? '🏦 Release Funds' : `Waiting for ${(circle?.size ?? 0) - confirmedCount} more payment${(circle?.size ?? 0) - confirmedCount !== 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        )}

        {!allPaid && circle?.status === 'active' && (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>
              ⚠️ Not everyone don pay yet. You fit still release early if you want — but make sure you trust all members go pay.
            </Text>
          </View>
        )}

        {/* Members list */}
        <Text style={styles.sectionTitle}>Member Status</Text>
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            totalRounds={circle?.size}
          />
        ))}

        {/* Circle info */}
        {circle && (
          <View style={styles.infoCard}>
            <InfoRow label="Circle name" value={circle.name} />
            <InfoRow label="Status" value={circle.status === 'active' ? 'Active' : circle.status} />
            <InfoRow label="Frequency" value={circle.frequency} />
            <InfoRow label="Members" value={`${circle.size}`} />
            <InfoRow label="Invite code" value={circle.invite_code} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#006B3C',
  },
  backBtn:  { padding: 4 },
  backText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  title:    { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  content:  { padding: 20, gap: 16, paddingBottom: 48 },
  roundCard: {
    backgroundColor: '#006B3C',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  roundLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  roundAmount: { fontSize: 44, fontWeight: '800', color: '#FFFFFF' },
  roundSub:    { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  collectorRow: { flexDirection: 'row', gap: 6, marginTop: 12, alignItems: 'center' },
  collectorLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  collectorName:  { fontSize: 13, fontWeight: '700', color: '#F4A228' },
  releaseBtn: {
    backgroundColor: '#F4A228',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  releaseBtnDisabled: { backgroundColor: '#D1D5DB' },
  releaseBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
  },
  warningText: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 4 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 13, color: '#6B7280' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
});
