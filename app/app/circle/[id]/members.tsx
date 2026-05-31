import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../../lib/api';
import { MemberCard } from '../../../components/MemberCard';
import type { CircleMember } from '../../../store/circleStore';

interface MemberRow extends CircleMember {
  total_contributions: number;
  missed_count: number;
}

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [circleSize, setCircleSize] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await api.get<{
        circle: { size: number };
        members: MemberRow[];
        currentRound: number;
        mySlot: number;
        totalPot: number;
      }>(`/circles/${id}`);
      setCircleSize(data.circle?.size ?? 0);
      setMembers(data.members ?? []);
    } catch {
      Alert.alert('E no load', 'Check your connection and try again');
    }
  }

  useEffect(() => { load(); }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Members</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={members}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MemberCard member={item} totalRounds={circleSize} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }}
            tintColor="#006B3C"
          />
        }
        ListHeaderComponent={
          <Text style={styles.count}>{members.length} of {circleSize} slots filled</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No members yet</Text>
          </View>
        }
      />
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
  backBtn: { padding: 4 },
  backText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  title: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  list: { padding: 16, gap: 10 },
  count: { fontSize: 13, color: '#6B7280', marginBottom: 8, textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },
});
