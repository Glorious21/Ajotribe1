import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const initialTimerSeconds = 5 * 60 + 23;

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}s`;
}

export default function Contribute() {
  const [timerSeconds, setTimerSeconds] = useState(initialTimerSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.title}>Contribute</Text>
        </View>

        <Text style={styles.notice}>
          Please ensure to send <Text style={styles.noticeBold}>EXACTLY N1,600</Text> to the
          account details displayed below.
        </Text>

        <View style={styles.accountCard}>
          <Text style={styles.label}>Account Name:</Text>
          <Text style={styles.value}>Anthony Joshua Mercy</Text>

          <Text style={styles.label}>Bank Name:</Text>
          <Text style={styles.value}>Sterling Bank</Text>

          <Text style={styles.label}>Account Number:</Text>
          <Text style={styles.value}>6299317866</Text>
        </View>

        <Text style={styles.timer}>{formatTimer(timerSeconds)}</Text>
      </View>

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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 112 },
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
  notice: {
    color: '#EAB308',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 22,
    textAlign: 'center',
  },
  noticeBold: { fontFamily: 'Poppins_800ExtraBold' },
  accountCard: {
    alignItems: 'center',
    backgroundColor: '#F6F2FB',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 36,
  },
  label: {
    color: '#817A93',
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    marginBottom: 10,
  },
  value: {
    color: '#5B21B6',
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    marginBottom: 34,
    textAlign: 'center',
  },
  timer: {
    color: '#9CA3AF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginTop: 22,
    textAlign: 'center',
  },
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
