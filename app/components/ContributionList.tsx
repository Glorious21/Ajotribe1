import { View, Text, FlatList, StyleSheet } from 'react-native';
import { StatusDot, PayStatus } from './StatusDot';
import { formatNaira } from '../lib/formatNaira';

export interface ContributionItem {
  id: string;
  display_name: string | null;
  user_id: string;
  round_number: number;
  amount_naira: number;
  status: PayStatus;
  paid_at: string | null;
}

interface Props {
  contributions: ContributionItem[];
  emptyMessage?: string;
}

export function ContributionList({ contributions, emptyMessage = 'No contributions yet' }: Props) {
  if (!contributions.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={contributions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ContributionRow item={item} />}
      scrollEnabled={false}
      contentContainerStyle={styles.list}
    />
  );
}

function ContributionRow({ item }: { item: ContributionItem }) {
  const paidDate = item.paid_at
    ? new Date(item.paid_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
    : null;

  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.name}>{item.display_name ?? 'Unknown member'}</Text>
        <Text style={styles.meta}>
          Week {item.round_number}{paidDate ? ` · ${paidDate}` : ''}
        </Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.amount}>{formatNaira(item.amount_naira)}</Text>
        <StatusDot status={item.status} showLabel={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list:      { gap: 8 },
  empty:     { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  rowLeft:  { flex: 1 },
  name:     { fontSize: 14, fontWeight: '600', color: '#111827' },
  meta:     { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  amount:   { fontSize: 14, fontWeight: '700', color: '#006B3C' },
});
