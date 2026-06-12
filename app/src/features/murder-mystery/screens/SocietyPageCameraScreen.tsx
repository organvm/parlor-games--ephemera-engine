import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';

export interface SocietyPageCameraScreenProps {
  onClose: () => void;
  era?: '1920s' | 'Victorian' | 'Noir';
}

export const SocietyPageCameraScreen: React.FC<SocietyPageCameraScreenProps> = ({ 
  onClose,
  era = '1920s'
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const viewShotRef = useRef<ViewShot>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (result?.uri) {
        setPhoto(result.uri);
      }
    }
  };

  const savePhoto = async () => {
    if (!mediaLibraryPermission?.granted) {
      const result = await requestMediaLibraryPermission();
      if (!result.granted) return;
    }

    try {
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('Saved', 'Photo saved to your device album!');
        setPhoto(null);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save photo.');
    }
  };

  if (photo) {
    return (
      <View style={styles.container}>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={styles.compositor}>
          <Image source={{ uri: photo }} style={styles.photo} />
          
          {/* Era Overlays */}
          {era === '1920s' && (
            <View style={styles.overlay1920}>
              <Text style={styles.newspaperHeadline}>THE DAILY SCANDAL</Text>
              <Text style={styles.newspaperSubhead}>Shocking Revelations at the Party!</Text>
            </View>
          )}
          
          {era === 'Victorian' && (
            <View style={styles.overlayVictorian}>
              <View style={styles.sepiaTint} />
              <View style={styles.victorianFrame} />
            </View>
          )}

          {era === 'Noir' && (
            <View style={styles.overlayNoir}>
              <Text style={styles.noirText}>CONFIDENTIAL EVIDENCE</Text>
            </View>
          )}
        </ViewShot>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setPhoto(null)}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={savePhoto}>
            <Text style={styles.buttonText}>Save to Album</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.cameraOverlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.shutterContainer}>
            <TouchableOpacity style={styles.shutterButton} onPress={takePicture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  text: { color: 'white', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, marginHorizontal: 40 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'space-between', padding: 20 },
  header: { paddingTop: 40, alignItems: 'flex-start' },
  closeText: { color: 'white', fontSize: 18, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  shutterContainer: { alignItems: 'center', paddingBottom: 40 },
  shutterButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'white' },
  compositor: { flex: 1, backgroundColor: '#000' },
  photo: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', padding: 30, backgroundColor: '#111' },
  primaryButton: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 8, flex: 1, marginLeft: 8 },
  secondaryButton: { backgroundColor: '#333', padding: 16, borderRadius: 8, flex: 1, marginRight: 8 },
  secondaryButtonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  
  // Overlays
  overlay1920: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-start', padding: 20, backgroundColor: 'rgba(240, 230, 210, 0.2)' },
  newspaperHeadline: { fontFamily: 'serif', fontSize: 36, fontWeight: '900', color: '#111', textAlign: 'center', textTransform: 'uppercase', textShadowColor: '#FFF', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0 },
  newspaperSubhead: { fontFamily: 'serif', fontSize: 18, fontStyle: 'italic', color: '#222', textAlign: 'center', marginTop: 8, textShadowColor: '#FFF', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 0 },
  
  overlayVictorian: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  sepiaTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(112, 66, 20, 0.4)' },
  victorianFrame: { ...StyleSheet.absoluteFillObject, borderWidth: 20, borderColor: '#3b250e', borderStyle: 'solid', opacity: 0.8 },
  
  overlayNoir: { ...StyleSheet.absoluteFillObject, borderTopWidth: 40, borderBottomWidth: 40, borderColor: '#000', justifyContent: 'flex-end', padding: 20 },
  noirText: { color: 'white', fontSize: 24, fontWeight: 'bold', letterSpacing: 4, textAlign: 'right' }
});
