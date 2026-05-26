import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Clipboard, Alert, Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../lib/api';

interface PaymentInstructions {
  amountNaira: number;
  reference: string;
  instructions: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    narration: string;
  };
  message: string;
}

export default function ContributeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<PaymentInstructions | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api.get<PaymentInstructions>(`/contributions/circle/${id}/instructions`)
      .then(setData)
      .catch(() => Alert.alert('E no load', 'Try again'));
  }, [id]);

  function copy(text: string, label: string) {
    Clipboard.setString(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Your Own</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.amountLabel}>Amount to send</Text>
        <Text style={styles.amount}>₦{data.amountNaira.toLocaleString('en-NG')}</Text>

        <View style={styles.instructionCard}>
          <Text style={styles.cardTitle}>Bank Transfer Details</Text>

          <CopyRow
            label="Bank"
            value={data.instructions.bankName}
            onCopy={() => copy(data.instructions.bankName, 'bank')}
            copied={copied === 'bank'}
          />
          <CopyRow
            label="Account Number"
            value={data.instructions.accountNumber}
            onCopy={() => copy(data.instructions.accountNumber, 'account')}
            copied={copied === 'account'}
          />
          <CopyRow
            label="Account Name"
            value={data.instructions.accountName}
            onCopy={() => copy(data.instructions.accountName, 'name')}
            copied={copied === 'name'}
          />
          <CopyRow
            label="Narration / Reference"
            value={data.reference}
            onCopy={() => copy(data.reference, 'ref')}
            copied={copied === 'ref'}
            highlight
          />
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            You must include the reference/narration exactly as shown. Na how we go know say the payment na from you.
          </Text>
        </View>

        <Text style={styles.messageText}>{data.message}</Text>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => Share.share({ message: `Send ₦${data.amountNaira.toLocaleString('en-NG')} to:\nBank: ${data.instructions.bankName}\nAccount: ${data.instructions.accountNumber}\nName: ${data.instructions.accountName}\nRef: ${data.reference}` })}
        >
          <Text style={styles.shareButtonText}>📤 Share Payment Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CopyRow({ label, value, onCopy, copied, highlight }: {
  label: string; value: string; onCopy: () => void; copied: boolean; highlight?: boolean;
}) {
  return (
    <View style={styles.copyRow}>
      <View style={styles.copyInfo}>
        <Text style={styles.copyLabel}>{label}</Text>
        <Text style={[styles.copyValue, highlight && styles.copyValueHighlight]}>{value}</Text>
      </View>
      <TouchableOpacity style={styles.copyBtn} onPress={onCopy}>
        <Text style={[styles.copyBtnText, copied && styles.copiedText]}>
          {copied ? '✓ Copied' : 'Copy'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { color: '#6B7280', fontSize: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  closeText: { fontSize: 15, color: '#DC2626', fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  content: { flex: 1, padding: 24, gap: 16 },
  amountLabel: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  amount: { fontSize: 56, fontWeight: '800', color: '#006B3C', textAlign: 'center' },
  instructionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  copyInfo: { flex: 1 },
  copyLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  copyValue: { fontSize: 15, fontWeight: '600', color: '#111827' },
  copyValueHighlight: { color: '#006B3C', fontSize: 16, fontWeight: '700' },
  copyBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  copyBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  copiedText: { color: '#16A34A' },
  warningCard: {
    flexDirection: 'row', gap: 12, padding: 16,
    backgroundColor: '#FEF3C7', borderRadius: 12, alignItems: 'flex-start',
  },
  warningIcon: { fontSize: 18 },
  warningText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 20 },
  messageText: { fontSize: 14, color: '#6B7280', lineHeight: 22, textAlign: 'center' },
  shareButton: {
    borderWidth: 1.5, borderColor: '#006B3C', paddingVertical: 14,
    borderRadius: 16, alignItems: 'center',
  },
  shareButtonText: { fontSize: 15, fontWeight: '600', color: '#006B3C' },
});
