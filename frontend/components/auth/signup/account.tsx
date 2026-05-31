import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../../../api/auth';
import { setUserName } from '../profilePhotoStore';

const nigerianPhoneRegex = /^(?:0)?[789][01]\d{8}$/;

export default function Account() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleProceed = async () => {
    if (
      !fullName.trim() ||
      !phoneNumber.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setErrorMessage('Please fill in all fields before proceeding.');
      return;
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    if (!nigerianPhoneRegex.test(normalizedPhone)) {
      setErrorMessage('Please enter a valid Nigerian phone number.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Please make sure both passwords match.');
      return;
    }

    const localPhone = normalizedPhone.startsWith('0')
      ? normalizedPhone.slice(1)
      : normalizedPhone;
    const formattedPhone = `+234${localPhone}`;

    try {
      setSubmitting(true);
      setErrorMessage('');
      await register(formattedPhone, password);
      setUserName(fullName.trim());
      router.push({
        pathname: '/signup/verification',
        params: {
          phone: formattedPhone,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'We could not create your account. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToField = (y: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }, 120);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={16}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Create an account</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name:</Text>
              <TextInput
                autoCapitalize="words"
                placeholder="Adesola Mathew"
                placeholderTextColor="#D1D5DB"
                style={styles.input}
                value={fullName}
                onChangeText={(value) => {
                  setFullName(value);
                  setErrorMessage('');
                }}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number:</Text>
              <TextInput
                keyboardType="phone-pad"
                placeholder="0800 000 0000"
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
                  onFocus={() => scrollToField(150)}
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Re-enter Password:</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  placeholder="000 000"
                  placeholderTextColor="#D1D5DB"
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.input, styles.passwordInput]}
                  value={confirmPassword}
                  onFocus={() => scrollToField(230)}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setErrorMessage('');
                  }}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword((current) => !current)}
                >
                  <Image
                    source={
                      showConfirmPassword
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

          <View style={styles.footer}>
            <Pressable
              disabled={submitting}
              style={[
                styles.proceedButton,
                submitting ? styles.proceedButtonDisabled : null,
              ]}
              onPress={handleProceed}
            >
              <Text style={styles.proceedText}>
                {submitting ? 'Sending...' : 'Proceed'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 150,
    paddingHorizontal: 24,
    paddingTop: 54,
  },
  title: {
    color: '#5B21B6',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 44,
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
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  footer: {
    marginTop: 88,
  },
  proceedButton: {
    alignItems: 'center',
    backgroundColor: '#5B21B6',
    borderRadius: 7,
    paddingVertical: 17,
  },
  proceedButtonDisabled: {
    opacity: 0.65,
  },
  proceedText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 12,
  },
});
