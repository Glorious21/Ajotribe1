import { router } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Metrics() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Enable Biometrics</Text>
        <Text style={styles.subtitle}>Login using your fingerprint</Text>

        <View style={styles.fingerprintWrap}>
          <Image
            source={require('../../../assets/fingerprint.png')}
            resizeMode="contain"
            style={styles.fingerprint}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.skipButton}
          onPress={() => router.push('/signup/photo')}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 78,
  },
  title: {
    color: '#5B21B6',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  fingerprintWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  fingerprint: {
    height: 100,
    width: 100,
  },
  footer: {
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  skipButton: {
    alignItems: 'center',
    backgroundColor: '#5B21B6',
    borderRadius: 7,
    paddingVertical: 17,
  },
  skipText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
});
