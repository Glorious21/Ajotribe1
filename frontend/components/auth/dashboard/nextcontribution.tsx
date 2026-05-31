import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const schedule = [
  {
    marker: '✓',
    markerStyle: 'paid' as const,
    title: 'Kojo Market Women',
    caption: 'N1,600 . Paid on 29th of May',
    status: 'Paid',
  },
  {
    marker: '◷',
    markerStyle: 'soon' as const,
    title: 'Madam Fruit',
    caption: 'N2,500 . Due on 1st of June',
    status: 'Soon',
  },
  {
    marker: '▦',
    markerStyle: 'upcoming' as const,
    title: 'Ajo Mama',
    caption: 'N1,000 . Due on 8th of June',
    status: 'Upcoming',
  },
];

export default function NextContribution() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.title}>Next contribution</Text>
        </View>

        <View style={styles.dueCard}>
          <View>
            <Text style={styles.dueLabel}>DUE SOONEST</Text>
            <Text style={styles.dueAmount}>N 1,600</Text>
            <Text style={styles.dueCaption}>Kojo Market women . Sunday 1 June</Text>
          </View>
          <View style={styles.duePill}>
            <Text style={styles.duePillText}>In 2 Days</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Full Schedule</Text>

        {schedule.map((item) => (
          <View key={item.title} style={styles.scheduleRow}>
            <View
              style={[
                styles.scheduleMarker,
                item.markerStyle === 'paid'
                  ? styles.paidMarker
                  : item.markerStyle === 'soon'
                    ? styles.soonMarker
                    : styles.upcomingMarker,
              ]}
            >
              <Text
                style={[
                  styles.scheduleMarkerText,
                  item.markerStyle === 'paid'
                    ? styles.paidText
                    : item.markerStyle === 'soon'
                      ? styles.soonText
                      : styles.upcomingText,
                ]}
              >
                {item.marker}
              </Text>
            </View>
            <View style={styles.scheduleTextWrap}>
              <Text style={styles.scheduleTitle}>{item.title}</Text>
              <Text style={styles.scheduleCaption}>{item.caption}</Text>
            </View>
            <Text
              style={[
                styles.scheduleStatus,
                item.markerStyle === 'paid'
                  ? styles.paidText
                  : item.markerStyle === 'soon'
                    ? styles.soonText
                    : styles.upcomingText,
              ]}
            >
              {item.status}
            </Text>
          </View>
        ))}

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            You have N 4,800 available in your balance, enough to cover all
            upcoming contributions
          </Text>
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
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 22 },
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
  dueCard: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 11,
    borderColor: '#38BDF8',
    borderWidth: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    minHeight: 118,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  dueLabel: { color: '#817A93', fontFamily: 'Poppins_500Medium', fontSize: 11 },
  dueAmount: {
    color: '#817A93',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 28,
    marginTop: 6,
  },
  dueCaption: {
    color: '#817A93',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 8,
  },
  duePill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  duePillText: { color: '#111827', fontFamily: 'Poppins_700Bold', fontSize: 8 },
  sectionTitle: {
    color: '#817A93',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginBottom: 24,
  },
  scheduleRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 24 },
  scheduleMarker: {
    alignItems: 'center',
    borderRadius: 6,
    height: 34,
    justifyContent: 'center',
    marginRight: 18,
    width: 34,
  },
  paidMarker: { backgroundColor: '#BBF7D0' },
  soonMarker: { backgroundColor: '#EDE9FE' },
  upcomingMarker: { backgroundColor: '#E5E7EB' },
  scheduleMarkerText: { fontFamily: 'Poppins_700Bold', fontSize: 18 },
  paidText: { color: '#16A34A' },
  soonText: { color: '#EAB308' },
  upcomingText: { color: '#817A93' },
  scheduleTextWrap: { flex: 1 },
  scheduleTitle: { color: '#817A93', fontFamily: 'Poppins_700Bold', fontSize: 15 },
  scheduleCaption: { color: '#A19BAD', fontFamily: 'Poppins_400Regular', fontSize: 10 },
  scheduleStatus: { fontFamily: 'Poppins_500Medium', fontSize: 11 },
  tipCard: {
    backgroundColor: '#F6F2FB',
    borderLeftColor: '#5B21B6',
    borderLeftWidth: 8,
    borderRadius: 8,
    marginTop: 32,
    padding: 20,
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
