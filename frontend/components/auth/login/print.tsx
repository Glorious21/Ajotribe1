import { router } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProfilePhotoUri } from '../profilePhotoStore';

export default function PrintLogin() {
  const profilePhotoUri = getProfilePhotoUri();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>

        <Image
          source={
            profilePhotoUri
              ? { uri: profilePhotoUri }
              : require('../../../assets/tribe1.png')
          }
          resizeMode="cover"
          style={styles.avatar}
        />

        <Text style={styles.welcomeText}>Welcome Back!</Text>

        <Image
          source={require('../../../assets/fingerprint.png')}
          resizeMode="contain"
          style={styles.fingerprint}
        />

        <Pressable
          style={styles.fingerprintButton}
          onPress={() => router.replace('/dashboard/dashone')}
        >
          <Text style={styles.fingerprintButtonText}>Verify fingerprint</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.passwordLink}
        onPress={() => router.push('/login/verify')}
      >
        <Text style={styles.passwordLinkText}>
          Or login with <Text style={styles.passwordText}>Password?</Text>
        </Text>
      </Pressable>
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
    paddingTop: 72,
  },
  title: {
    color: '#5B21B6',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 34,
  },
  avatar: {
    borderColor: '#5B21B6',
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    marginBottom: 28,
    width: 48,
  },
  welcomeText: {
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginBottom: 104,
  },
  fingerprint: {
    height: 84,
    marginBottom: 28,
    width: 84,
  },
  fingerprintButton: {
    backgroundColor: '#5B21B6',
    borderRadius: 7,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  fingerprintButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  passwordLink: {
    alignItems: 'center',
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  passwordLinkText: {
    color: '#5B21B6',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  passwordText: {
    fontFamily: 'Poppins_700Bold',
    textDecorationLine: 'underline',
  },
});
