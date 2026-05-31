import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setProfilePhotoUri } from '../profilePhotoStore';

export default function Photo() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const usePickerResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    setSelectedImage(result.assets[0].uri);
    setErrorMessage('');
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage('Please allow photo access to choose a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      shape: 'oval',
      defaultTab: 'photos',
      quality: 0.8,
    });

    usePickerResult(result);
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage('Please allow camera access to take a profile photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      shape: 'oval',
      quality: 0.8,
    });

    usePickerResult(result);
  };

  const handleUpload = () => {
    if (!selectedImage) {
      setErrorMessage('Please select a profile photo before uploading.');
      return;
    }

    setErrorMessage('');
    setProfilePhotoUri(selectedImage);
    router.replace('/dashboard/dashone');
  };

  const removePhoto = () => {
    setSelectedImage(null);
    setProfilePhotoUri(null);
    setErrorMessage('');
  };

  const handlePhotoPress = () => {
    const actions = [
      { text: 'Gallery', onPress: openGallery },
      { text: 'Camera', onPress: openCamera },
      ...(selectedImage
        ? [{ text: 'Remove photo', onPress: removePhoto, style: 'destructive' as const }]
        : []),
      { text: 'Cancel', style: 'cancel' as const },
    ];

    Alert.alert('Profile Photo', 'Choose how you want to add your photo.', actions);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile Photo</Text>
        <Text style={styles.subtitle}>Please upload a profile photo</Text>

        <Pressable style={styles.photoCircle} onPress={handlePhotoPress}>
          <Image
            source={
              selectedImage
                ? { uri: selectedImage }
                : require('../../../assets/headshot.png')
            }
            resizeMode={selectedImage ? 'cover' : 'contain'}
            style={selectedImage ? styles.selectedPhoto : styles.headshot}
          />
        </Pressable>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Pressable
          disabled={!selectedImage}
          style={[
            styles.uploadButton,
            selectedImage ? styles.uploadEnabled : styles.uploadDisabled,
          ]}
          onPress={handleUpload}
        >
          <Text
            style={[
              styles.uploadText,
              selectedImage ? styles.uploadTextEnabled : styles.uploadTextDisabled,
            ]}
          >
            Upload
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
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 78,
  },
  title: {
    color: '#5B21B6',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    marginBottom: 38,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    textAlign: 'center',
  },
  photoCircle: {
    alignItems: 'center',
    borderColor: '#E5E7EB',
    borderRadius: 100,
    borderWidth: 1,
    height: 176,
    justifyContent: 'center',
    marginTop: 148,
    overflow: 'hidden',
    width: 176,
  },
  headshot: {
    height: 88,
    width: 88,
  },
  selectedPhoto: {
    height: '100%',
    width: '100%',
  },
  errorText: {
    color: '#B91C1C',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 24,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 34,
    paddingHorizontal: 24,
  },
  uploadButton: {
    alignItems: 'center',
    borderRadius: 7,
    paddingVertical: 17,
  },
  uploadEnabled: {
    backgroundColor: '#5B21B6',
  },
  uploadDisabled: {
    backgroundColor: '#DDD6FE',
  },
  uploadText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  },
  uploadTextEnabled: {
    color: '#FFFFFF',
  },
  uploadTextDisabled: {
    color: '#6B7280',
  },
});
