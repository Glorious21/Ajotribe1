import { View, Text, StyleSheet } from 'react-native';

export type PayStatus = 'confirmed' | 'pending' | 'missed' | 'upcoming';

const STATUS_COLORS: Record<PayStatus, string> = {
  confirmed: '#16A34A',
  pending:   '#D97706',
  missed:    '#DC2626',
  upcoming:  '#9CA3AF',
};

const STATUS_LABELS: Record<PayStatus, string> = {
  confirmed: 'Don pay ✓',
  pending:   'On the way...',
  missed:    'E no pay',
  upcoming:  'Not yet due',
};

interface Props {
  status: PayStatus;
  showLabel?: boolean;
}

export function StatusDot({ status, showLabel = true }: Props) {
  const color = STATUS_COLORS[status];
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      {showLabel && (
        <Text style={[styles.label, { color }]}>{STATUS_LABELS[status]}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot:   { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 12, fontWeight: '600' },
});
