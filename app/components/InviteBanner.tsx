import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { shareText } from '../lib/deepLinks';

interface Props {
  circleName: string;
  amountNaira: number;
  frequency: string;
  inviteCode: string;
}

export function InviteBanner({ circleName, amountNaira, frequency, inviteCode }: Props) {
  async function handleShare() {
    try {
      await Share.share({
        message: shareText(circleName, amountNaira, frequency, inviteCode),
        url: `https://ajotribe.ng/join/${inviteCode}`,
        title: `Join ${circleName}`,
      });
    } catch {}
  }

  return (
    <View style={styles.banner}>
      <View style={styles.textBlock}>
        <Text style={styles.label}>Invite friends</Text>
        <Text style={styles.code} numberOfLines={1}>
          ajotribe.ng/join/{inviteCode}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleShare} activeOpacity={0.8}>
        <Text style={styles.buttonText}>📤 Share</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 12,
  },
  textBlock: { flex: 1 },
  label:     { fontSize: 12, color: '#166534', fontWeight: '600', marginBottom: 2 },
  code:      { fontSize: 13, color: '#006B3C', fontWeight: '700' },
  button: {
    backgroundColor: '#006B3C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});
