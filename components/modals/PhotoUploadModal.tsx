import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, Image } from 'lucide-react-native';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

interface PhotoUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoUploaded: (url: string) => Promise<void>;
  onUploadSuccess: (uri: string) => Promise<{ url?: string; error?: any }>;
}

export default function PhotoUploadModal({
  visible,
  onClose,
  onPhotoUploaded,
  onUploadSuccess,
}: PhotoUploadModalProps) {
  const {
    captureAndUpload,
    selectAndUpload,
    isUploading,
    uploadError,
  } = usePhotoUpload({ onUploadSuccess });

  const handleTakePhoto = async () => {
    const { url, error } = await captureAndUpload();
    
    if (error) {
      console.error('Failed to upload photo:', error);
      return;
    }
    
    if (url) {
      await onPhotoUploaded(url);
      onClose();
    }
  };

  const handleSelectPhoto = async () => {
    const { url, error } = await selectAndUpload();
    
    if (error) {
      console.error('Failed to upload selected photo:', error);
      return;
    }
    
    if (url) {
      await onPhotoUploaded(url);
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Task Verification</Text>
          <Text style={styles.modalSubtitle}>Please provide a photo as proof of completion</Text>
          
          {uploadError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{uploadError}</Text>
            </View>
          )}
          
          {isUploading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Uploading photo...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cameraButton]}
                onPress={handleTakePhoto}
              >
                <Camera size={24} color="#fff" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.galleryButton]}
                onPress={handleSelectPhoto}
              >
                <Image size={24} color="#fff" />
                <Text style={styles.buttonText}>Select from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 8,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#2196F3',
  },
  galleryButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
  },
}); 