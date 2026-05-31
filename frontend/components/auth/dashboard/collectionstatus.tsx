import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const collectionOrder = [
  ['1', 'Peace Okere', 'Collected N 40,000 . May 1, 2026'],
  ['2', 'Gracious Mbekwe', 'Collected N 40,000 . May 7, 2026'],
  ['3', 'Anthony Mercy', 'Collected N 40,000 . May 14, 2026'],
  ['4', 'Fatima Bello', 'Collected N 40,000 . May 21, 2026'],
  ['5', 'Ramatu Sanni', 'Collected N 40,000 . May 28, 2026'],
  ['6', 'Azeeza Amina', 'Collected N 40,000 . June 4, 2026'],
];

export default function CollectionStatus() {
  const [visible, setVisible] = useState(true);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.title}>Collection Status</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>YOUR TURN TO COLLECT</Text>
          <Text style={styles.statusAmount}>
            {visible ? 'N 20,800.00' : 'N **,***.**'}
          </Text>
          <Pressable style={styles.eyeButton} onPress={() => setVisible((value) => !value)}>
            <Image
              source={
                visible
                  ? require('../../../assets/eye-open.png')
                  : require('../../../assets/eye-closed.png')
              }
              resizeMode="contain"
              style={styles.eyeIcon}
            />
          </Pressable>
          <View style={styles.positionPill}>
            <Text style={styles.positionText}>Position 9 of 12</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>8 of 12 collections done</Text>
            <Text style={styles.progressText}>8/12 members paid</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Collection Order</Text>

        <View style={styles.orderCard}>
          {collectionOrder.map(([number, name, caption]) => (
            <View key={number} style={styles.orderRow}>
              <View style={styles.numberBox}>
                <Text style={styles.numberText}>{number}</Text>
              </View>
              <View style={styles.orderTextWrap}>
                <Text style={styles.orderName}>{name}</Text>
                <Text style={styles.orderCaption}>{caption}</Text>
              </View>
              <Text style={styles.doneText}>Done</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            You collect next month if all members contribute on time. 8 of 12
            members are up to date.
          </Text>
        </View>
      </ScrollView>

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
  content: { paddingBottom: 86, paddingHorizontal: 24, paddingTop: 28 },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 22 },
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
  statusCard: {
    backgroundColor: '#6D28D9',
    borderRadius: 11,
    marginBottom: 24,
    minHeight: 130,
    overflow: 'hidden',
    padding: 22,
  },
  statusLabel: { color: '#FFFFFF', fontFamily: 'Poppins_500Medium', fontSize: 11 },
  statusAmount: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 28,
    marginTop: 8,
  },
  eyeButton: { position: 'absolute', right: 22, top: 28 },
  eyeIcon: { height: 18, width: 18 },
  positionPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    position: 'absolute',
    right: 20,
    top: 58,
  },
  positionText: { color: '#111827', fontFamily: 'Poppins_700Bold', fontSize: 8 },
  progressTrack: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 7,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: '#FDE047', height: '100%', width: '52%' },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  progressText: { color: '#FFFFFF', fontFamily: 'Poppins_400Regular', fontSize: 8 },
  sectionTitle: { color: '#817A93', fontFamily: 'Poppins_400Regular', fontSize: 13, marginBottom: 14 },
  orderCard: {
    borderColor: '#E9E5F2',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
    padding: 12,
  },
  orderRow: { alignItems: 'center', flexDirection: 'row', marginBottom: 10 },
  numberBox: {
    alignItems: 'center',
    backgroundColor: '#BBF7D0',
    borderRadius: 4,
    height: 34,
    justifyContent: 'center',
    marginRight: 16,
    width: 34,
  },
  numberText: { color: '#817A93', fontFamily: 'Poppins_700Bold', fontSize: 13 },
  orderTextWrap: { flex: 1 },
  orderName: { color: '#817A93', fontFamily: 'Poppins_700Bold', fontSize: 14 },
  orderCaption: { color: '#A19BAD', fontFamily: 'Poppins_400Regular', fontSize: 9 },
  doneText: { color: '#16A34A', fontFamily: 'Poppins_500Medium', fontSize: 11 },
  tipCard: {
    backgroundColor: '#F6F2FB',
    borderLeftColor: '#5B21B6',
    borderLeftWidth: 8,
    borderRadius: 8,
    padding: 20,
  },
  tipText: { color: '#5B21B6', fontFamily: 'Poppins_400Regular', fontSize: 11 },
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
