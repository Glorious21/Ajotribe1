import { router } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const circles = [
  {
    title: 'Kojo Market Women',
    caption: '25 members . N1,600/week',
    percent: '78%',
    fill: '78%' as const,
    color: '#5B21B6',
    admin: true,
  },
  {
    title: 'Madam Fruit',
    caption: '16 members . N1,000/week',
    percent: '25%',
    fill: '25%' as const,
    color: '#FDE68A',
  },
  {
    title: 'Ajo Mama',
    caption: '12 members . N1,200/week',
    percent: '50%',
    fill: '50%' as const,
    color: '#10B981',
  },
];

export default function ActiveCircle() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.title}>Active Circle</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summary}>Total active circle (3)</Text>
          <Text style={styles.addIcon}>+</Text>
        </View>

        {circles.map((circle, index) => (
          <Pressable
            key={circle.title}
            style={styles.circleCard}
            onPress={() => {
              if (index === 0) {
                router.push('/dashboard/circledetail');
              }
            }}
          >
            <Image
              source={require('../../../assets/tribe1.png')}
              resizeMode="cover"
              style={styles.circleImage}
            />
            <View style={styles.circleTextWrap}>
              <View style={styles.circleTitleRow}>
                <Text style={styles.circleTitle}>{circle.title}</Text>
                {circle.admin ? <Text style={styles.adminPill}>Admin</Text> : null}
              </View>
              <Text style={styles.circleCaption}>{circle.caption}</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: circle.fill, backgroundColor: circle.color },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.percent}>{circle.percent}</Text>
          </Pressable>
        ))}
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
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 28 },
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
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  summary: { color: '#817A93', fontFamily: 'Poppins_400Regular', fontSize: 12 },
  addIcon: { color: '#817A93', fontFamily: 'Poppins_500Medium', fontSize: 28 },
  circleCard: {
    alignItems: 'center',
    backgroundColor: '#F6F2FB',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 18,
    minHeight: 96,
    padding: 14,
  },
  circleImage: { borderRadius: 6, height: 54, marginRight: 12, width: 54 },
  circleTextWrap: { flex: 1 },
  circleTitleRow: { alignItems: 'center', flexDirection: 'row' },
  circleTitle: { color: '#817A93', fontFamily: 'Poppins_700Bold', fontSize: 16 },
  adminPill: {
    backgroundColor: '#BBF7D0',
    borderRadius: 8,
    color: '#16A34A',
    fontFamily: 'Poppins_400Regular',
    fontSize: 8,
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  circleCaption: {
    color: '#817A93',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginBottom: 12,
    marginTop: 3,
  },
  progressTrack: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: { borderRadius: 999, height: '100%' },
  percent: { color: '#5B21B6', fontFamily: 'Poppins_800ExtraBold', fontSize: 17 },
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
