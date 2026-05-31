import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { readAuthToken, verifyOtp } from '../../../api/auth';
import { setAuthToken } from '../profilePhotoStore';

const codeLength = 6;
const initialTimerSeconds = 4 * 60 + 57;

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}s`;
}

export default function Verification() {
  const params = useLocalSearchParams();
  const phone = typeof params.phone === 'string' ? params.phone : '+2348011237894';
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [code, setCode] = useState(Array(codeLength).fill(''));
  const [errorMessage, setErrorMessage] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(initialTimerSeconds);
  const [submitting, setSubmitting] = useState(false);
  const enteredCode = code.join('');
  const isCodeComplete = enteredCode.length === codeLength;
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);
  const canVerify = isCodeComplete && !submitting;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    const nextValue = value.replace(/\D/g, '').slice(-1);
    const nextCode = [...code];
    nextCode[index] = nextValue;
    setCode(nextCode);
    setErrorMessage('');
    setIsCodeCorrect(false);

    if (nextValue && index < codeLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isCodeComplete) {
      setErrorMessage('Please enter the full verification code.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const response = await verifyOtp(phone, enteredCode);
      const token = readAuthToken(response);

      if (!token) {
        throw new Error('Verification succeeded, but no auth token was returned.');
      }

      setAuthToken(token);
      setIsCodeCorrect(true);
      router.push('/signup/metrics');
    } catch (error) {
      setIsCodeCorrect(false);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'That code is not correct yet. Please check and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Verification</Text>

        <Text style={styles.message}>
          A verification code was sent to {phone}
        </Text>

        <View style={styles.codeRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(input) => {
                inputsRef.current[index] = input;
              }}
              keyboardType="number-pad"
              maxLength={1}
              placeholder="-"
              placeholderTextColor="#D1D5DB"
              style={[
              styles.codeInput,
              isCodeCorrect ? styles.codeInputSuccess : null,
              ]}
              textAlign="center"
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
            />
          ))}
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <Text style={styles.timer}>{formatTimer(timerSeconds)}</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          disabled={!canVerify}
          style={[
            styles.verifyButton,
            canVerify ? styles.verifyEnabled : styles.verifyDisabled,
          ]}
          onPress={handleVerify}
        >
          <Text
            style={[
              styles.verifyText,
              canVerify ? styles.verifyTextEnabled : styles.verifyTextDisabled,
            ]}
          >
            {submitting ? 'Verifying...' : 'Verify'}
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
    paddingTop: 82,
  },
  title: {
    color: '#5B21B6',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 42,
    textAlign: 'center',
  },
  message: {
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginBottom: 30,
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  codeInput: {
    borderColor: '#E5E7EB',
    borderRadius: 9,
    borderWidth: 1,
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    height: 54,
    lineHeight: 24,
    paddingBottom: 0,
    paddingTop: 0,
    width: 46,
  },
  codeInputSuccess: {
    borderColor: '#22C55E',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginBottom: 16,
    textAlign: 'center',
  },
  timer: {
    color: '#9CA3AF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  footer: {
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  verifyButton: {
    alignItems: 'center',
    borderRadius: 7,
    paddingVertical: 17,
  },
  verifyDisabled: {
    backgroundColor: '#DDD6FE',
  },
  verifyEnabled: {
    backgroundColor: '#5B21B6',
  },
  verifyText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  verifyTextDisabled: {
    color: '#6B7280',
  },
  verifyTextEnabled: {
    color: '#FFFFFF',
  },
});
