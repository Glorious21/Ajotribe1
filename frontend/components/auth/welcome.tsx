import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeProps = {
  embedded?: boolean;
};

export default function Welcome({ embedded = false }: WelcomeProps) {
  const Container = embedded ? View : SafeAreaView;

  return (
    <Container style={[styles.screen, embedded ? styles.embedded : null]}>
      <StatusBar style="dark" />
      <Image
        source={require('../../assets/Group 4.png')}
        resizeMode="contain"
        style={styles.backgroundDesign}
      />
      <Image
        source={require('../../assets/Group 4.png')}
        resizeMode="contain"
        style={styles.topLeftDesign}
      />
      <Image
        source={require('../../assets/Group 4.png')}
        resizeMode="contain"
        style={styles.rightDesign}
      />

      <View style={styles.content}>
        <View style={styles.brandMark}>
          <Text style={styles.brandLetter}>A</Text>
        </View>

        <Text style={styles.heading}>Welcome</Text>
        <Text style={styles.subtitle}>
          Join Ajotribe to save, contribute, and manage your goals with ease.
        </Text>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed ? styles.pressedButton : styles.defaultButton,
            ]}
            onPress={() => router.push('/login/print')}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.actionText,
                  pressed ? styles.pressedText : styles.defaultText,
                ]}
              >
                Log in
              </Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed ? styles.pressedButton : styles.defaultButton,
            ]}
            onPress={() => router.push('/signup/language')}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.actionText,
                  pressed ? styles.pressedText : styles.defaultText,
                ]}
              >
                Sign up
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  embedded: {
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    zIndex: 1,
  },
  backgroundDesign: {
    height: 280,
    opacity: 0.08,
    position: 'absolute',
    bottom: -58,
    right: -52,
    width: 280,
  },
  topLeftDesign: {
    height: 170,
    left: -48,
    opacity: 0.06,
    position: 'absolute',
    top: -28,
    width: 170,
  },
  rightDesign: {
    height: 150,
    opacity: 0.05,
    position: 'absolute',
    right: -46,
    top: 190,
    width: 150,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#5B21B6',
    borderRadius: 28,
    height: 72,
    justifyContent: 'center',
    marginBottom: 28,
    width: 72,
  },
  brandLetter: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  heading: {
    color: '#111827',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 330,
    textAlign: 'center',
  },
  actions: {
    gap: 14,
    marginTop: 48,
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 16,
  },
  defaultButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#5B21B6',
  },
  pressedButton: {
    backgroundColor: '#5B21B6',
    borderColor: '#5B21B6',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '800',
  },
  defaultText: {
    color: '#5B21B6',
  },
  pressedText: {
    color: '#FFFFFF',
  },
});
