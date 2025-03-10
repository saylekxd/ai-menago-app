import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '@/components/TaskCard';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from 'expo-image-picker';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  
  // Get user role and business ID
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id);
          
        if (error) throw error;
        
        // Check if user exists in the users table
        if (!data || data.length === 0) {
          setUserError('User profile not found. Please contact an administrator.');
          setLoading(false);
          return;
        }
        
        // User exists, set the details
        setUserDetails(data[0]);
        setUserError(null);
      } catch (error: any) {
        console.error('Error fetching user details:', error);
        setUserError(`Failed to load user profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [user]);
  
  // Initialize tasks hook once we have user details
  const isManager = userDetails?.role === 'manager' || userDetails?.role === 'admin';
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError,
    fetchTasks,
    completeTask,
    uploadPhoto 
  } = useTasks(user?.id || null, isManager, userDetails?.business_id || null);
  
  // Refresh tasks
  const onRefresh = async () => {
    setRefreshing(true);
    
    // If user details are missing, try to fetch them again
    if (!userDetails && user) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setUserDetails(data[0]);
          setUserError(null);
        }
      } catch (error) {
        console.error('Error refreshing user details:', error);
      }
    }
    
    // Only fetch tasks if we have user details
    if (userDetails) {
      await fetchTasks();
    }
    
    setRefreshing(false);
  };
  
  // Handle taking verification photo
  const handleTakePhoto = (taskId: string) => {
    setSelectedTask(taskId);
    setPhotoModalVisible(true);
  };
  
  // Take photo and upload
  const takePhoto = async () => {
    if (!selectedTask) return;
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Camera permission is required to take a verification photo');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0].uri) {
        const { url, error } = await uploadPhoto(result.assets[0].uri, selectedTask);
        
        if (error) {
          alert(`Error uploading photo: ${error}`);
          return;
        }
        
        if (url) {
          await completeTask(selectedTask, url);
          setPhotoModalVisible(false);
          await fetchTasks();
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('There was an error taking the photo. Please try again.');
    }
  };
  
  // Select image from library and upload
  const selectImage = async () => {
    if (!selectedTask) return;
    
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Gallery permission is required to select a verification photo');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0].uri) {
        const { url, error } = await uploadPhoto(result.assets[0].uri, selectedTask);
        
        if (error) {
          alert(`Error uploading photo: ${error}`);
          return;
        }
        
        if (url) {
          await completeTask(selectedTask, url);
          setPhotoModalVisible(false);
          await fetchTasks();
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      alert('There was an error selecting the image. Please try again.');
    }
  };
  
  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // If task requires photo and doesn't have one yet, show photo modal
    if (task.requires_photo && !task.verification_photo_url) {
      handleTakePhoto(taskId);
      return;
    }
    
    // Otherwise, just complete the task
    await completeTask(taskId);
    await fetchTasks();
  };
  
  // Render task list
  const renderTaskItem = ({ item }: { item: any }) => (
    <TaskCard 
      task={item} 
      onComplete={handleCompleteTask}
      onTakePhoto={handleTakePhoto}
    />
  );
  
  // Render loading state
  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // Render user error state if user profile is not found
  if (userError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{userError}</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Render tasks
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.welcome}>
          Welcome, {userDetails?.first_name || 'User'}!
        </Text>
      </View>
      
      {tasksError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{tasksError}</Text>
        </View>
      )}
      
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {tasksLoading 
                ? 'Loading tasks...' 
                : 'No tasks assigned to you yet.'}
            </Text>
          </View>
        }
      />
      
      {/* Photo verification modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={photoModalVisible}
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verification Photo</Text>
            <Text style={styles.modalText}>
              Please provide a photo as verification for completing this task.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.photoButton]} 
                onPress={takePhoto}
              >
                <Camera size={20} color="#fff" />
                <Text style={styles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.galleryButton]} 
                onPress={selectImage}
              >
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setPhotoModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  taskList: {
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  photoButton: {
    backgroundColor: '#2196F3',
  },
  galleryButton: {
    backgroundColor: '#9C27B0',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#666',
  },
});