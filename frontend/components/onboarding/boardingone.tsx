import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Welcome from '../auth/welcome';

const slides = [
  {
    id: 'save',
    image: require('../../assets/tribe2.png'),
    resizeMode: 'contain' as const,
    title: 'Save money, Set Goals',
    description:
      'Start individual savings to achieve both your long and short term goals using Ajotribe.',
  },
  {
    id: 'speak',
    image: require('../../assets/tribe1.png'),
    resizeMode: 'cover' as const,
    title: 'Speak to Ajotribe',
    description:
      'Save, contribute, and check your balance by just speaking to Ajotribe in your preferred language.',
  },
];

export default function OnboardingOne() {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(nextIndex);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />

      <ScrollView
        horizontal
        pagingEnabled
        bounces={false}
        decelerationRate="fast"
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width }]}>
            <View style={styles.imageWrap}>
              <Image
                source={slide.image}
                resizeMode={slide.resizeMode}
                style={styles.heroImage}
              />
              <Pressable
                style={styles.skipWrap}
                onPress={() => router.push('/welcome')}
              >
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
              {slide.id === 'speak' ? <View style={styles.imageFade} /> : null}
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>

              <View style={styles.pagination}>
                {slides.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.dot,
                      index === activeIndex ? styles.activeDot : null,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        ))}

        <View style={[styles.slide, { width }]}>
          <Welcome embedded />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipWrap: {
    position: 'absolute',
    right: 20,
    top: 52,
    zIndex: 2,
  },
  skipText: {
    color: '#3F3F46',
    fontSize: 16,
    fontWeight: '800',
  },
  imageWrap: {
    flex: 1,
    marginTop: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  imageFade: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    bottom: 0,
    height: 78,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  content: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingBottom: 32,
    paddingHorizontal: 30,
    paddingTop: 28,
  },
  title: {
    color: '#5B21B6',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 31,
    marginBottom: 18,
    textAlign: 'center',
  },
  description: {
    color: '#111827',
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 330,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 56,
  },
  dot: {
    backgroundColor: '#9CA3AF',
    borderRadius: 999,
    height: 5,
    width: 5,
  },
  activeDot: {
    backgroundColor: '#5B21B6',
    width: 26,
  },
});
