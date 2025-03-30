import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useAuth, useTasks, useUserDetails } from '@/hooks';
import { TaskCard, LoadingView, ErrorView, PhotoUploadModal } from '@/components';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { 
    userDetails, 
    loading: userLoading, 
    error: userError, 
    refetchUserDetails,
    isManager
  } = useUserDetails(user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  
  // Initialize tasks hook once we have user details
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError,
    fetchTasks,
    completeTask,
    uploadPhoto 
  } = useTasks(
    user?.id || null, 
    isManager, 
    userDetails?.business_id || null
  );
  
  // Refresh tasks
  const onRefresh = async () => {
    setRefreshing(true);
    
    // If user details are missing, try to fetch them again
    if (!userDetails && user) {
      await refetchUserDetails();
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
  
  // Handle task completion after photo upload
  const handlePhotoUploaded = async (photoUrl: string) => {
    if (!selectedTask) return;
    
    try {
      await completeTask(selectedTask, photoUrl);
      await fetchTasks();
    } catch (error: any) {
      console.error('Error completing task:', error);
    }
  };
  
  // Handle photo upload logic
  const handleUploadPhoto = async (uri: string): Promise<{ url?: string; error?: any }> => {
    if (!selectedTask) return { error: 'No task selected' };
    
    try {
      const result = await uploadPhoto(uri, selectedTask);
      
      // Transform the result to match the expected interface
      if (result.url) {
        return { url: result.url };
      } else {
        return { error: result.error };
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      return { error: error.message || 'Failed to upload photo' };
    }
  };
  
  // Handle direct task completion without photo
  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
      await fetchTasks();
    } catch (error: any) {
      console.error('Error completing task:', error);
    }
  };
  
  // Render task item
  const renderTaskItem = ({ item }: { item: any }) => (
    <TaskCard
      task={item}
      onComplete={handleCompleteTask}
      onTakePhoto={handleTakePhoto}
    />
  );
  
  // Loading state
  if (userLoading || !user) {
    return <LoadingView />;
  }
  
  // Error state
  if (userError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
        </View>
        <ErrorView 
          message={userError} 
          onRetry={refetchUserDetails} 
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          {userDetails?.role === 'worker' ? 'Your Tasks' : 'Team Tasks'}
        </Text>
      </View>
      
      {tasksError && (
        <ErrorView 
          message={tasksError} 
          onRetry={fetchTasks} 
        />
      )}
      
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !tasksLoading && !tasksError ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isManager 
                  ? 'No tasks assigned. Add new tasks in the Admin panel.'
                  : 'No tasks assigned to you at the moment.'}
              </Text>
            </View>
          ) : null
        }
      />
      
      <PhotoUploadModal
        visible={photoModalVisible}
        onClose={() => setPhotoModalVisible(false)}
        onPhotoUploaded={handlePhotoUploaded}
        onUploadSuccess={handleUploadPhoto}
      />
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
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  taskList: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});