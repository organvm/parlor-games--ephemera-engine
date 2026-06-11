import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface Props {
  onPhotoSelected: (uri: string) => void;
  initialUri?: string;
}

export function PhotoUpload({ onPhotoSelected, initialUri }: Props) {
  const [photoUri, setPhotoUri] = useState<string | null>(initialUri || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    setLoading(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      
      // Compress and resize
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      setPhotoUri(manipResult.uri);
      onPhotoSelected(manipResult.uri);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#8A867D" />
        ) : photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.image} />
        ) : (
          <Text style={styles.text}>Tap to Select Photo</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0EFEA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4D2C9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  text: {
    color: '#8A867D',
    fontFamily: 'serif',
    fontSize: 16,
  },
});
