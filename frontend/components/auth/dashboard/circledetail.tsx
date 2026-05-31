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

const members = [
  { name: 'Joy Eze', role: 'Owner' },
  { name: 'Madam Tony' },
  { name: 'Mrs. Uche' },
  { name: 'Joy Eze' },
  { name: 'Joy Eze' },
  { name: 'Madam Tony' },
  { name: 'Mrs. Uche' },
  { name: 'Joy Eze' },
];

export default function CircleDetail() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.title}>Active Circle</Text>
        </View>

        <View style={styles.hero}>
          <Image
            source={require('../../../assets/tribe1.png')}
            resizeMode="cover"
            style={styles.circleImage}
          />
          <Text style={styles.circleName}>Kojo Market Women</Text>
          <Text style={styles.memberCount}>25 members</Text>
          <Text style={styles.description}>
            Every member is to contribute the designated amount each week and
            this must be done judiciously to avoid removal from the circle.
          </Text>

          <Pressable style={styles.addMembersButton}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addMembersText}>Add Members</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Members</Text>
        <View style={styles.membersList}>
          {members.map((member, index) => (
            <View key={`${member.name}-${index}`} style={styles.memberRow}>
              <Image
                source={require('../../../assets/headshot.png')}
                resizeMode="cover"
                style={styles.memberAvatar}
              />
              <Text style={styles.memberName}>{member.name}</Text>
              {member.role ? <Text style={styles.memberRole}>{member.role}</Text> : null}
            </View>
          ))}
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
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 86,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 28,
  },
  backButton: {
    alignItems: 'center',
    borderColor: '#E9E5F2',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  backText: {
    color: '#817A93',
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
  },
  title: {
    color: '#5B21B6',
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 23,
    marginRight: 48,
    textAlign: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  circleImage: {
    borderRadius: 22,
    height: 44,
    marginBottom: 22,
    width: 44,
  },
  circleName: {
    color: '#817A93',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  memberCount: {
    color: '#A19BAD',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginBottom: 24,
  },
  description: {
    color: '#817A93',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 26,
    maxWidth: 320,
    textAlign: 'center',
  },
  addMembersButton: {
    alignItems: 'center',
    backgroundColor: '#F6F2FB',
    borderRadius: 11,
    justifyContent: 'center',
    minHeight: 76,
    width: 170,
  },
  addIcon: {
    borderColor: '#817A93',
    borderRadius: 10,
    borderWidth: 1,
    color: '#817A93',
    fontFamily: 'Poppins_400Regular',
    fontSize: 18,
    height: 22,
    lineHeight: 21,
    marginBottom: 10,
    textAlign: 'center',
    width: 22,
  },
  addMembersText: {
    color: '#817A93',
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#817A93',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    marginBottom: 12,
  },
  membersList: {
    gap: 18,
  },
  memberRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  memberAvatar: {
    borderRadius: 13,
    height: 26,
    marginRight: 16,
    width: 26,
  },
  memberName: {
    color: '#817A93',
    flex: 1,
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
  },
  memberRole: {
    color: '#5B21B6',
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
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
