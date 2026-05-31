import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const activities = [
  { title: 'Personal save', time: 'Today, 12:14pm', amount: '+N650', good: true },
  { title: 'Auto save', time: 'Yesterday, 2:21pm', amount: '+N400', good: true },
  {
    title: 'Emergency withdrawal',
    time: '3rd May 2026, 12:14pm',
    amount: '+N650',
    good: false,
  },
];

export default function SavingBalance() {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.title}>Saving Balance</Text>
        </View>

        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>TOTAL SAVED</Text>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? 'N 20,800.00' : 'N **,***.**'}
            </Text>
          </View>
          <Pressable onPress={() => setBalanceVisible((value) => !value)}>
            <Image
              source={
                balanceVisible
                  ? require('../../../assets/eye-open.png')
                  : require('../../../assets/eye-closed.png')
              }
              resizeMode="contain"
              style={styles.eyeIcon}
            />
          </Pressable>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>51% of 40,000 Goal</Text>
            <Text style={styles.progressText}>20/25 members paid</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Savings Breakdown:</Text>
        <View style={styles.breakdownRow}>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownLabel}>This Week</Text>
            <Text style={styles.breakdownValue}>N 3,800</Text>
          </View>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownLabel}>This Month</Text>
            <Text style={styles.breakdownValue}>N 10,000</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Activities:</Text>
        <View style={styles.activitiesCard}>
          {activities.map((activity) => (
            <View key={activity.title} style={styles.activityRow}>
              <View
                style={[
                  styles.activityMarker,
                  activity.good ? styles.markerGood : styles.markerBad,
                ]}
              >
                <Text style={styles.markerText}>+</Text>
              </View>
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <Text
                style={[
                  styles.activityAmount,
                  activity.good ? styles.amountGood : styles.amountBad,
                ]}
              >
                {activity.amount}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            At your current pace, you will hit your goal in 4weeks.
          </Text>
          <Text style={styles.tipText}>Keep it up.</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => router.replace('/dashboard/dashone')}>
          <Image source={require('../../../assets/home.png')} style={styles.homeIcon} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 86, paddingHorizontal: 24, paddingTop: 28 },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 24 },
  backButton: {
    alignItems: 'center',
    borderColor: '#E9E5F2',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  backText: { color: '#817A93', fontFamily: 'Poppins_700Bold', fontSize: 24 },
  title: {
    color: '#5B21B6',
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 23,
    marginRight: 48,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: '#6D28D9',
    borderRadius: 11,
    marginBottom: 22,
    minHeight: 128,
    overflow: 'hidden',
    padding: 22,
  },
  balanceLabel: { color: '#FFFFFF', fontFamily: 'Poppins_500Medium', fontSize: 11 },
  balanceAmount: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 28,
    marginTop: 8,
  },
  eyeIcon: { height: 19, position: 'absolute', right: 0, top: -42, width: 19 },
  progressTrack: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 7,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: '#FDE047', height: '100%', width: '52%' },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  progressText: { color: '#FFFFFF', fontFamily: 'Poppins_400Regular', fontSize: 8 },
  sectionTitle: {
    color: '#817A93',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginBottom: 14,
  },
  breakdownRow: { flexDirection: 'row', gap: 14, marginBottom: 26 },
  breakdownCard: {
    backgroundColor: '#F6F2FB',
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  breakdownLabel: { color: '#817A93', fontFamily: 'Poppins_400Regular', fontSize: 9 },
  breakdownValue: {
    color: '#817A93',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 20,
    marginTop: 6,
  },
  activitiesCard: {
    borderColor: '#E9E5F2',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    padding: 14,
  },
  activityRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 10 },
  activityMarker: {
    alignItems: 'center',
    borderRadius: 4,
    height: 34,
    justifyContent: 'center',
    marginRight: 18,
    width: 34,
  },
  markerGood: { backgroundColor: '#BBF7D0' },
  markerBad: { backgroundColor: '#FECACA' },
  markerText: { color: '#817A93', fontFamily: 'Poppins_500Medium', fontSize: 26 },
  activityTextWrap: { flex: 1 },
  activityTitle: { color: '#817A93', fontFamily: 'Poppins_500Medium', fontSize: 13 },
  activityTime: { color: '#9CA3AF', fontFamily: 'Poppins_400Regular', fontSize: 8 },
  activityAmount: { fontFamily: 'Poppins_500Medium', fontSize: 12 },
  amountGood: { color: '#16A34A' },
  amountBad: { color: '#DC2626' },
  tipCard: {
    backgroundColor: '#F6F2FB',
    borderLeftColor: '#5B21B6',
    borderLeftWidth: 8,
    borderRadius: 8,
    padding: 22,
  },
  tipText: { color: '#5B21B6', fontFamily: 'Poppins_400Regular', fontSize: 11 },
  bottomNav: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopColor: '#F3F4F6',
    borderTopWidth: 1,
    bottom: 0,
    height: 60,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  homeIcon: { height: 22, width: 22 },
});
