import { View, Text, StyleSheet } from 'react-native';
import { StatusDot, PayStatus } from './StatusDot';
import type { CircleMember } from '../store/circleStore';

interface Props {
  member: CircleMember;
  isMe?: boolean;
  totalRounds?: number;
}

export function MemberCard({ member, isMe = false, totalRounds }: Props) {
  const status = (member.contribution_status ?? 'upcoming') as PayStatus;
  const initial = (member.display_name ?? member.phone_number.slice(-4))[0].toUpperCase();
  const name = member.display_name ?? `****${member.phone_number.slice(-4)}`;

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>
          {name}
          {isMe && <Text style={styles.meTag}> (You)</Text>}
        </Text>
        <Text style={styles.slot}>
          Week {member.slot_number}{totalRounds ? ` of ${totalRounds}` : ''}
        </Text>
      </View>

      <StatusDot status={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#006B3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  info:    { flex: 1 },
  name:    { fontSize: 15, fontWeight: '600', color: '#111827' },
  meTag:   { fontSize: 13, color: '#6B7280', fontWeight: '400' },
  slot:    { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});
