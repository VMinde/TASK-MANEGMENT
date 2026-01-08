import { View, Image, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';

export default function ImageViewer({ visible, imageUri, onClose }) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕ Uždaryti</Text>
        </TouchableOpacity>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    zIndex: 10,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
