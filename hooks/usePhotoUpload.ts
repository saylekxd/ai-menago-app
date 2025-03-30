import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

interface UsePhotoUploadOptions {
  onUploadSuccess: (uri: string) => Promise<{ url?: string; error?: any }>;
}

export function usePhotoUpload({ onUploadSuccess }: UsePhotoUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setUploadError('Camera permission is required to take a verification photo');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setUploadError('Gallery permission is required to select a verification photo');
      return false;
    }
    return true;
  };

  const getImagePickerOptions = (): ImagePicker.ImagePickerOptions => ({
    allowsEditing: true,
    aspect: [4, 3] as [number, number],
    quality: 0.1, // Reduced quality to prevent memory issues
    exif: false, // Don't include EXIF data to reduce file size
    base64: false, // Don't include base64 data to save memory
  });

  const takePhoto = async (): Promise<string | null> => {
    setUploadError(null);
    
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return null;
      
      const result = await ImagePicker.launchCameraAsync(getImagePickerOptions());
      
      if (result.canceled) return null;
      
      if (result.assets && result.assets[0]?.uri) {
        return result.assets[0].uri;
      } else {
        setUploadError('No image was captured. Please try again.');
        return null;
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setUploadError(`Error with camera: ${error.message || 'Please try again.'}`);
      return null;
    }
  };

  const selectImage = async (): Promise<string | null> => {
    setUploadError(null);
    
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return null;
      
      const result = await ImagePicker.launchImageLibraryAsync(getImagePickerOptions());
      
      if (result.canceled) return null;
      
      if (result.assets && result.assets[0]?.uri) {
        return result.assets[0].uri;
      } else {
        setUploadError('No image was selected. Please try again.');
        return null;
      }
    } catch (error: any) {
      console.error('Gallery error:', error);
      setUploadError(`Error with gallery: ${error.message || 'Please try again.'}`);
      return null;
    }
  };

  const uploadPhoto = async (uri: string): Promise<{ url?: string; error?: any }> => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log('Uploading photo...', uri.substring(0, 50) + '...');
      const uploadStart = Date.now();
      const result = await onUploadSuccess(uri);
      const uploadDuration = Date.now() - uploadStart;
      console.log(`Upload took ${uploadDuration}ms`);
      
      if (result.error) {
        setUploadError(`Error uploading photo: ${result.error}`);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error during photo upload process:', error);
      setUploadError(`Failed to upload the photo: ${error.message || 'Unknown error'}`);
      return { error };
    } finally {
      setIsUploading(false);
    }
  };

  const captureAndUpload = async (): Promise<{ url?: string; error?: any }> => {
    const uri = await takePhoto();
    if (!uri) return { error: uploadError || 'Failed to capture photo' };
    return await uploadPhoto(uri);
  };

  const selectAndUpload = async (): Promise<{ url?: string; error?: any }> => {
    const uri = await selectImage();
    if (!uri) return { error: uploadError || 'Failed to select photo' };
    return await uploadPhoto(uri);
  };

  return {
    takePhoto,
    selectImage,
    uploadPhoto,
    captureAndUpload,
    selectAndUpload,
    isUploading,
    uploadError,
    setUploadError,
  };
} 