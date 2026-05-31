import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const languages = ['Yoruba', 'Pidgin', 'English'];

export default function Language() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const canProceed = selectedLanguage !== null;

  const handleProceed = () => {
    if (!selectedLanguage) {
      setErrorMessage('Please select a language before proceeding.');
      return;
    }

    setErrorMessage('');
    router.push('/signup/account');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>Please select a preferred Language</Text>

        <View style={styles.options}>
          {languages.map((language) => {
            const selected = selectedLanguage === language;

            return (
              <Pressable
                key={language}
                style={styles.option}
                onPress={() => {
                  setSelectedLanguage(language);
                  setErrorMessage('');
                }}
              >
                <View
                  style={[
                    styles.radio,
                    selected ? styles.radioSelected : styles.radioDefault,
                  ]}
                />
                <Text style={styles.optionText}>{language}</Text>
              </Pressable>
            );
          })}
        </View>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.proceedButton,
            canProceed ? styles.proceedEnabled : styles.proceedDisabled,
          ]}
          onPress={handleProceed}
        >
          <Text style={styles.proceedText}>Proceed</Text>
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
    paddingTop: 64,
  },
  title: {
    color: '#5B21B6',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 16,
    marginBottom: 42,
    textAlign: 'center',
  },
  subtitle: {
    color: '#adadae',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginBottom: 22,
    textAlign: 'center',
  },
  options: {
    gap: 14,
  },
  option: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 7,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 24,
  },
  radio: {
    borderRadius: 999,
    height: 12,
    marginRight: 24,
    width: 12,
  },
  radioDefault: {
    backgroundColor: '#F6F3FF',
  },
  radioSelected: {
    backgroundColor: '#5B21B6',
  },
  optionText: {
    color: '#111827',
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  footer: {
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  proceedButton: {
    alignItems: 'center',
    borderRadius: 7,
    paddingVertical: 17,
  },
  proceedEnabled: {
    backgroundColor: '#5B21B6',
  },
  proceedDisabled: {
    backgroundColor: '#C4B5FD',
    opacity: 0.55,
  },
  proceedText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 14,
    textAlign: 'center',
  },
});
