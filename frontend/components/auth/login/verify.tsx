import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login, readAuthToken } from '../../../api/auth';
import { getProfilePhotoUri, setAuthToken } from '../profilePhotoStore';

const nigerianPhoneRegex = /^(?:0)?[789][01]\d{8}$/;

export default function VerifyLogin() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const profilePhotoUri = getProfilePhotoUri();

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !password.trim()) {
      setErrorMessage('Please enter your phone number and password.');
      return;
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    if (!nigerianPhoneRegex.test(normalizedPhone)) {
      setErrorMessage('Please enter a valid Nigerian phone number.');
      return;
    }

    const localPhone = normalizedPhone.startsWith('0')
      ? normalizedPhone.slice(1)
      : normalizedPhone;
    const formattedPhone = `+234${localPhone}`;

    try {
      setSubmitting(true);
      setErrorMessage('');
      const response = await login(formattedPhone, password);
      const token = readAuthToken(response);

      if (!token) {
        throw new Error('Login succeeded, but no auth token was returned.');
      }

      setAuthToken(token);
      router.replace('/dashboard/dashone');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'We could not log you in. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

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

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone Number:</Text>
            <TextInput
              keyboardType="phone-pad"
              placeholder="0000 000 0000"
              placeholderTextColor="#D1D5DB"
              style={styles.input}
              value={phoneNumber}
              onChangeText={(value) => {
                setPhoneNumber(value);
                setErrorMessage('');
              }}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password:</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                placeholder="000 000"
                placeholderTextColor="#D1D5DB"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setErrorMessage('');
                }}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword((current) => !current)}
              >
                <Image
                  source={
                    showPassword
                      ? require('../../../assets/eye-open.png')
                      : require('../../../assets/eye-closed.png')
                  }
                  resizeMode="contain"
                  style={styles.eyeImage}
                />
              </Pressable>
            </View>
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          disabled={submitting}
          style={[
            styles.loginButton,
            submitting ? styles.loginButtonDisabled : null,
          ]}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>
            {submitting ? 'Logging in...' : 'Login'}
          </Text>
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
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  title: {
    color: '#5B21B6',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 34,
    textAlign: 'center',
  },
  avatar: {
    alignSelf: 'center',
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
    marginBottom: 38,
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    color: '#111827',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
  input: {
    borderColor: '#E5E7EB',
    borderRadius: 7,
    borderWidth: 1,
    color: '#111827',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    minHeight: 54,
    paddingHorizontal: 18,
  },
  inputWithIcon: {
    position: 'relative',
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 0,
    width: 40,
  },
  eyeImage: {
    height: 20,
    opacity: 0.65,
    width: 20,
  },
  footer: {
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#5B21B6',
    borderRadius: 7,
    paddingVertical: 17,
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 12,
  },
});
