import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatNaira } from '../../lib/formatNaira';

export default function CollectedScreen() {
  const router = useRouter();
  const { collector, amount, roundNumber, circleId } = useLocalSearchParams<{
    collector: string;
    amount: string;
    roundNumber: string;
    circleId: string;
  }>();

  const amountNaira = parseInt(amount ?? '0', 10);
  const round = parseInt(roundNumber ?? '1', 10);
  const collectorName = collector ?? 'The collector';

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated checkmark */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
          <Text style={styles.icon}>🎉</Text>
        </Animated.View>

        <Animated.View style={{ opacity }}>
          <Text style={styles.headline}>E Don Send!</Text>
          <Text style={styles.subline}>
            {collectorName} don collect
          </Text>
          <Text style={styles.amount}>{formatNaira(amountNaira * 100)}</Text>
          <Text style={styles.roundLabel}>Week {round} collection</Text>

          <View style={styles.confirmCard}>
            <View style={styles.confirmRow}>
              <View style={styles.confirmDot} />
              <Text style={styles.confirmText}>Dem don confirm am ✓</Text>
            </View>
            <Text style={styles.confirmSub}>
              Money dey go to {collectorName}'s bank account.{'\n'}E go reach in a few minutes.
            </Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (circleId) {
              router.replace(`/circle/${circleId}`);
            } else {
              router.replace('/(tabs)/home');
            }
          }}
        >
          <Text style={styles.backButtonText}>Back to Circle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.homeButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006B3C',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 64,
  },
  headline: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
  },
  subline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  amount: {
    fontSize: 56,
    fontWeight: '800',
    color: '#F4A228',
    textAlign: 'center',
    marginTop: 4,
  },
  roundLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  confirmCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  confirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  confirmDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F4A228',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 12,
  },
  backButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#006B3C',
  },
  homeButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
});
