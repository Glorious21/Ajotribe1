import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';

type Step = 'name' | 'amount' | 'size' | 'frequency' | 'start' | 'review';

interface CircleForm {
  name: string;
  amount_naira: string;
  size: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  start_date: string;
}

export default function CreateCircleScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('name');
  const [form, setForm] = useState<CircleForm>({
    name: '',
    amount_naira: '',
    size: '',
    frequency: 'weekly',
    start_date: '',
  });
  const [loading, setLoading] = useState(false);

  const steps: Step[] = ['name', 'amount', 'size', 'frequency', 'start', 'review'];
  const stepIndex = steps.indexOf(step);

  function next() {
    const nextStep = steps[stepIndex + 1];
    if (nextStep) setStep(nextStep);
  }

  function back() {
    if (stepIndex === 0) { router.back(); return; }
    setStep(steps[stepIndex - 1]);
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const amountKobo = parseInt(form.amount_naira, 10) * 100;
      const result = await api.post<{ circle: { id: string }; inviteLink: string; inviteUrl: string }>(
        '/circles',
        {
          name: form.name,
          amount_naira: amountKobo,
          frequency: form.frequency,
          size: parseInt(form.size, 10),
          start_date: form.start_date,
        }
      );
      router.replace(`/circle/${result.circle.id}`);
    } catch (err) {
      Alert.alert('E no create', err instanceof Error ? err.message : 'Try again');
    } finally {
      setLoading(false);
    }
  }

  const totalPot = parseInt(form.amount_naira || '0', 10) * parseInt(form.size || '0', 10);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {steps.map((s, i) => (
          <View key={s} style={[styles.dot, i <= stepIndex && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.back} onPress={back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {step === 'name' && (
          <StepName value={form.name} onChange={(v) => setForm({ ...form, name: v })} onNext={next} />
        )}
        {step === 'amount' && (
          <StepAmount value={form.amount_naira} onChange={(v) => setForm({ ...form, amount_naira: v })} onNext={next} />
        )}
        {step === 'size' && (
          <StepSize value={form.size} onChange={(v) => setForm({ ...form, size: v })} onNext={next} />
        )}
        {step === 'frequency' && (
          <StepFrequency value={form.frequency} onChange={(v) => setForm({ ...form, frequency: v })} onNext={next} />
        )}
        {step === 'start' && (
          <StepStart value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} onNext={next} />
        )}
        {step === 'review' && (
          <StepReview form={form} totalPot={totalPot} onSubmit={handleCreate} loading={loading} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepName({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>What is your circle name?</Text>
      <Text style={styles.stepHint}>E.g. "Mama Eko Friday Ajo" or "Market Women Weekly"</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter circle name"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        autoFocus
        maxLength={60}
        returnKeyType="next"
        onSubmitEditing={() => value.trim().length >= 3 && onNext()}
      />
      <NextButton disabled={value.trim().length < 3} onPress={onNext} />
    </View>
  );
}

function StepAmount({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const num = parseInt(value, 10);
  const valid = !isNaN(num) && num >= 1000;

  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>How much each person go contribute?</Text>
      <Text style={styles.stepHint}>Minimum ₦1,000 per round</Text>
      <View style={styles.amountRow}>
        <Text style={styles.nairaSign}>₦</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="10,000"
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={(v) => onChange(v.replace(/\D/g, ''))}
          keyboardType="number-pad"
          autoFocus
        />
      </View>
      {valid && (
        <Text style={styles.amountLabel}>
          ₦{num.toLocaleString('en-NG')} per person, per round
        </Text>
      )}
      <NextButton disabled={!valid} onPress={onNext} />
    </View>
  );
}

function StepSize({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  const sizes = ['5', '6', '8', '10', '12', '15', '20'];
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>How many people for the circle?</Text>
      <Text style={styles.stepHint}>Including you (you go be member number 1)</Text>
      <View style={styles.chipGrid}>
        {sizes.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, value === s && styles.chipSelected]}
            onPress={() => onChange(s)}
          >
            <Text style={[styles.chipText, value === s && styles.chipTextSelected]}>{s} people</Text>
          </TouchableOpacity>
        ))}
      </View>
      <NextButton disabled={!value} onPress={onNext} />
    </View>
  );
}

function StepFrequency({ value, onChange, onNext }: { value: string; onChange: (v: 'weekly' | 'biweekly' | 'monthly') => void; onNext: () => void }) {
  const options = [
    { value: 'weekly', label: 'Every week', desc: 'Contributions due every 7 days' },
    { value: 'biweekly', label: 'Every two weeks', desc: 'Contributions due every 14 days' },
    { value: 'monthly', label: 'Every month', desc: 'Contributions due once a month' },
  ] as const;

  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>How often una go contribute?</Text>
      <View style={styles.optionList}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, value === opt.value && styles.optionSelected]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.optionLabel, value === opt.value && styles.optionLabelSelected]}>
              {opt.label}
            </Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <NextButton disabled={false} onPress={onNext} />
    </View>
  );
}

function StepStart({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  // Simple date input — format YYYY-MM-DD
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value) > new Date();

  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>When do the circle start?</Text>
      <Text style={styles.stepHint}>Enter the date for the first round</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD (e.g. 2026-06-01)"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        autoFocus
        maxLength={10}
      />
      {value.length === 10 && !valid && (
        <Text style={styles.error}>Date must be in the future</Text>
      )}
      <NextButton disabled={!valid} onPress={onNext} />
    </View>
  );
}

function StepReview({ form, totalPot, onSubmit, loading }: { form: CircleForm; totalPot: number; onSubmit: () => void; loading: boolean }) {
  const freqLabel = { weekly: 'Every week', biweekly: 'Every 2 weeks', monthly: 'Every month' }[form.frequency];
  return (
    <View style={styles.step}>
      <Text style={styles.stepTitle}>Review your circle</Text>

      <View style={styles.reviewCard}>
        <ReviewRow label="Circle name" value={form.name} />
        <ReviewRow label="Contribution" value={`₦${parseInt(form.amount_naira).toLocaleString('en-NG')}`} />
        <ReviewRow label="Members" value={`${form.size} people`} />
        <ReviewRow label="Frequency" value={freqLabel} />
        <ReviewRow label="Start date" value={form.start_date} />
        <View style={styles.divider} />
        <ReviewRow label="Total pot per round" value={`₦${totalPot.toLocaleString('en-NG')}`} bold />
      </View>

      <Text style={styles.reviewNote}>
        You go be member number 1. Share the invite link with your people after you create the circle.
      </Text>

      <TouchableOpacity style={[styles.createBtn, loading && styles.createBtnDisabled]} onPress={onSubmit} disabled={loading}>
        <Text style={styles.createBtnText}>{loading ? 'Creating...' : 'Create Circle 🎉'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReviewRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={[styles.reviewValue, bold && styles.reviewValueBold]}>{value}</Text>
    </View>
  );
}

function NextButton({ disabled, onPress }: { disabled: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.nextBtn, disabled && styles.nextBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.nextBtnText}>Continue →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  progressRow: { flexDirection: 'row', gap: 6, paddingTop: 56, paddingHorizontal: 24, paddingBottom: 8 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  dotActive: { backgroundColor: '#006B3C' },
  back: { paddingHorizontal: 24, paddingBottom: 8 },
  backText: { fontSize: 16, color: '#006B3C', fontWeight: '500' },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 48 },
  step: { gap: 20 },
  stepTitle: { fontSize: 28, fontWeight: '800', color: '#111827', lineHeight: 36 },
  stepHint: { fontSize: 14, color: '#6B7280', marginTop: -12 },
  input: {
    borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 18, fontSize: 18,
    fontWeight: '600', color: '#111827', backgroundColor: '#FFFFFF',
  },
  amountRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#006B3C',
    borderRadius: 16, backgroundColor: '#FFFFFF', overflow: 'hidden',
  },
  nairaSign: {
    fontSize: 28, fontWeight: '800', color: '#006B3C',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  amountInput: { flex: 1, fontSize: 32, fontWeight: '800', color: '#111827', paddingVertical: 14 },
  amountLabel: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  chipSelected: { borderColor: '#006B3C', backgroundColor: '#006B3C' },
  chipText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  chipTextSelected: { color: '#FFFFFF' },
  optionList: { gap: 12 },
  option: { padding: 20, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  optionSelected: { borderColor: '#006B3C', backgroundColor: '#F0FDF4' },
  optionLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  optionLabelSelected: { color: '#006B3C' },
  optionDesc: { fontSize: 13, color: '#6B7280' },
  error: { fontSize: 13, color: '#DC2626' },
  nextBtn: { backgroundColor: '#006B3C', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  nextBtnDisabled: { backgroundColor: '#9CA3AF' },
  nextBtnText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  reviewCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewLabel: { fontSize: 14, color: '#6B7280' },
  reviewValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  reviewValueBold: { fontSize: 16, fontWeight: '800', color: '#006B3C' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  reviewNote: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  createBtn: { backgroundColor: '#006B3C', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  createBtnDisabled: { backgroundColor: '#9CA3AF' },
  createBtnText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});
