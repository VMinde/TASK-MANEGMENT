import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraModal({ onPhotoCaptured, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const cameraRef = useRef(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Reikalinga prieiga prie kameros</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Leisti prieigą</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
          <Text style={styles.buttonText}>Atšaukti</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.1,
        });
        setPhotoUri(photo.uri);
        setPhotoBase64(`data:image/jpeg;base64,${photo.base64}`);
      } catch (error) {
        Alert.alert('Klaida', 'Nepavyko nufotografuoti');
      }
    }
  };

  const confirmPhoto = () => {
    if (photoBase64) {
      onPhotoCaptured(photoBase64);
      setPhotoUri(null);
      setPhotoBase64(null);
    }
  };

  if (photoUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={confirmPhoto}>
            <Text style={styles.buttonText}>✅ Naudoti nuotrauką</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.retakeButton]} onPress={() => {
            setPhotoUri(null);
            setPhotoBase64(null);
          }}>
            <Text style={styles.buttonText}>📷 Iš naujo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} facing="back">
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.captureButton]} onPress={takePicture}>
            <Text style={styles.buttonText}>📸 Fotografuoti</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
            <Text style={styles.buttonText}>✕ Atšaukti</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    flex: 1,
  },
  retakeButton: {
    backgroundColor: '#FF9800',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
