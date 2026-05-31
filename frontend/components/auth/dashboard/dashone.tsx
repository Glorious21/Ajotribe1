import { useState } from 'react';
import { router } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProfilePhotoUri, getUserName } from '../profilePhotoStore';

const actionCards = [
  {
    icon: require('../../../assets/sbal.png'),
    title: 'Saving Balance',
    caption: 'Click to view your saving goal.',
    route: '/dashboard/savingbalance',
  },
  {
    icon: require('../../../assets/acircle.png'),
    title: 'Active Circles',
    caption: 'Click to view your circles.',
    route: '/dashboard/activecircle',
  },
  {
    icon: require('../../../assets/ci_timer.png'),
    title: 'Next Contribution',
    caption: 'Click to view contributions.',
    route: '/dashboard/nextcontribution',
  },
  {
    icon: require('../../../assets/status.png'),
    title: 'Collection Status',
    caption: 'Click to view your collection status.',
    route: '/dashboard/collectionstatus',
  },
];

const activities = [
  {
    marker: '+',
    markerStyle: 'positive' as const,
    title: 'Personal save',
    time: 'Today, 12:14pm',
    amount: '+N650',
    amountStyle: 'positive' as const,
  },
  {
    marker: '+',
    markerStyle: 'positive' as const,
    title: 'Auto save',
    time: 'Yesterday, 2:21pm',
    amount: '+N400',
    amountStyle: 'positive' as const,
  },
  {
    marker: '+',
    markerStyle: 'negative' as const,
    title: 'Emergency withdrawal',
    time: 'Yesterday, 9:42am',
    amount: '+N650',
    amountStyle: 'negative' as const,
  },
];

export default function DashOne() {
  const profilePhotoUri = getProfilePhotoUri();
  const userName = getUserName() ?? 'Adesola Mathew';
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={
              profilePhotoUri
                ? { uri: profilePhotoUri }
                : require('../../../assets/tribe1.png')
            }
            resizeMode="cover"
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcome}>Welcome back!</Text>
            <Text style={styles.name}>{userName}</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? 'N 26,800.00' : 'N **,***.**'}
            </Text>
            <Text style={styles.balanceCaption}>Active savings ongoing</Text>
          </View>
          <Pressable
            style={styles.balanceEyeButton}
            onPress={() => setBalanceVisible((current) => !current)}
          >
            <Image
              source={
                balanceVisible
                  ? require('../../../assets/eye-open.png')
                  : require('../../../assets/eye-closed.png')
              }
              resizeMode="contain"
              style={styles.balanceEyeImage}
            />
          </Pressable>
        </View>

        <View style={styles.actionGrid}>
          {actionCards.map((card) => (
            <Pressable
              key={card.title}
              style={styles.actionCard}
              onPress={() => {
                if (card.route) {
                  router.push(card.route);
                }
              }}
            >
              <Image
                source={card.icon}
                resizeMode="contain"
                style={styles.actionIcon}
              />
              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>{card.title}</Text>
                <Text style={styles.actionCaption}>{card.caption}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.circleButton}>
          <Text style={styles.circleButtonText}>Create Circle</Text>
          <Text style={styles.circleButtonIcon}>+</Text>
        </View>

        <View style={[styles.circleButton, styles.joinButton]}>
          <Text style={[styles.circleButtonText, styles.joinButtonText]}>
            Join Circle
          </Text>
          <Text style={styles.joinButtonIcon}>oo</Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Activities:</Text>

        <View style={styles.activitiesCard}>
          {activities.map((activity, index) => (
            <View
              key={`${activity.title}-${activity.time}`}
              style={[
                styles.activityRow,
                index === activities.length - 1 ? styles.lastActivityRow : null,
              ]}
            >
              <View
                style={[
                  styles.activityMarker,
                  activity.markerStyle === 'positive'
                    ? styles.markerPositive
                    : styles.markerNegative,
                ]}
              >
                <Text style={styles.activityMarkerText}>{activity.marker}</Text>
              </View>
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <Text
                style={[
                  styles.activityAmount,
                  activity.amountStyle === 'positive'
                    ? styles.amountPositive
                    : styles.amountNegative,
                ]}
              >
                {activity.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Pressable onPress={() => router.replace('/dashboard/dashone')}>
          <Image
            source={require('../../../assets/home.png')}
            resizeMode="contain"
            style={styles.homeIcon}
          />
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
    paddingBottom: 86,
    paddingHorizontal: 22,
    paddingTop: 38,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 30,
  },
  avatar: {
    borderColor: '#5B21B6',
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    marginRight: 14,
    width: 48,
  },
  welcome: {
    color: '#5B21B6',
    fontFamily: 'Poppins_700Bold',
    fontSize: 23,
    lineHeight: 29,
  },
  name: {
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: '#6D28D9',
    borderRadius: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    minHeight: 116,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_800ExtraBold',
    fontSize: 27,
    lineHeight: 34,
  },
  balanceCaption: {
    color: '#EDE9FE',
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginTop: 8,
  },
  balanceEyeButton: {
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  balanceEyeImage: {
    height: 19,
    opacity: 0.9,
    width: 19,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  actionCard: {
    alignItems: 'center',
    borderColor: '#E9E5F2',
    borderRadius: 9,
    borderWidth: 1,
    flexBasis: '48%',
    flexDirection: 'row',
    minHeight: 66,
    paddingHorizontal: 15,
  },
  actionIcon: {
    height: 24,
    marginRight: 12,
    width: 24,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    color: '#817A93',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  actionCaption: {
    color: '#B8B1C7',
    fontFamily: 'Poppins_400Regular',
    fontSize: 7,
    marginTop: 3,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: '#F5F0FB',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    minHeight: 70,
    paddingHorizontal: 24,
  },
  circleButtonText: {
    color: '#817A93',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  circleButtonIcon: {
    color: '#817A93',
    fontFamily: 'Poppins_500Medium',
    fontSize: 28,
  },
  joinButton: {
    backgroundColor: '#FDE68A',
    marginBottom: 28,
  },
  joinButtonText: {
    color: '#817A93',
  },
  joinButtonIcon: {
    color: '#817A93',
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
  },
  sectionTitle: {
    color: '#817A93',
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    marginBottom: 14,
  },
  activitiesCard: {
    borderColor: '#E9E5F2',
    borderRadius: 9,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  activityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  lastActivityRow: {
    marginBottom: 0,
  },
  activityMarker: {
    alignItems: 'center',
    borderRadius: 4,
    height: 34,
    justifyContent: 'center',
    marginRight: 18,
    width: 34,
  },
  markerPositive: {
    backgroundColor: '#BBF7D0',
  },
  markerNegative: {
    backgroundColor: '#FECACA',
  },
  activityMarkerText: {
    color: '#817A93',
    fontFamily: 'Poppins_500Medium',
    fontSize: 27,
    lineHeight: 31,
  },
  activityTextWrap: {
    flex: 1,
  },
  activityTitle: {
    color: '#817A93',
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    lineHeight: 21,
  },
  activityTime: {
    color: '#9CA3AF',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  activityAmount: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
  },
  amountPositive: {
    color: '#16A34A',
  },
  amountNegative: {
    color: '#DC2626',
  },
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
  homeIcon: {
    height: 22,
    width: 22,
  },
});
