import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { useAuth, useTasks, useUserDetails, useBusinesses } from '@/hooks';
import { Plus, LogOut } from 'lucide-react-native';
import { 
  AddTaskForm, 
  CreateBusinessForm, 
  BusinessList, 
  WorkersList, 
  LoadingView, 
  ErrorView 
} from '@/components';
import { useRouter } from 'expo-router';

export default function AdminScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { 
    userDetails, 
    loading: userLoading, 
    error: userError, 
    refetchUserDetails,
    isManager
  } = useUserDetails(user);
  
  const [refreshing, setRefreshing] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [createBusinessModalVisible, setCreateBusinessModalVisible] = useState(false);
  
  // Initialize businesses hook once we have user details
  const { 
    businesses,
    workers, 
    loading: businessesLoading,
    error: businessesError,
    fetchBusinesses,
    fetchWorkers,
    createBusiness,
    isAdmin
  } = useBusinesses({
    userId: user?.id || null,
    userRole: userDetails?.role || null,
    businessId: userDetails?.business_id || null
  });
  
  // Initialize tasks hook
  const { addTask } = useTasks(
    user?.id || null, 
    isManager, 
    userDetails?.business_id || null
  );
  
  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    
    // If user details are missing, try to fetch them again
    if (!userDetails && user) {
      await refetchUserDetails();
    } else if (userDetails?.business_id) {
      await fetchBusinesses();
      await fetchWorkers(userDetails.business_id);
    }
    
    setRefreshing(false);
  };
  
  // Handle adding a new task
  const handleAddTask = async (taskData: any) => {
    const result = await addTask(taskData);
    return result;
  };
  
  // Handle business creation
  const handleBusinessCreated = async () => {
    setCreateBusinessModalVisible(false);
    await fetchBusinesses();
  };
  
  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
  };
  
  // Loading state
  if (userLoading || !user) {
    return <LoadingView />;
  }
  
  // Error state for user profile
  if (userError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
        </View>
        <ErrorView 
          message={userError} 
          onRetry={refetchUserDetails}
          additionalActions={
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          }
        />
      </View>
    );
  }
  
  // If not a manager, show unauthorized message
  if (!isManager) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.unauthorizedContainer}>
            <Text style={styles.unauthorizedTitle}>Access Restricted</Text>
            <Text style={styles.unauthorizedText}>
              This section is only available to managers and administrators.
            </Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Manage tasks, workers and businesses</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Business Management Section */}
        <BusinessList 
          businesses={businesses}
          onAddBusiness={() => setCreateBusinessModalVisible(true)}
          isAdmin={isAdmin}
        />
        
        {/* Team Management Section */}
        {userDetails?.business_id && (
          <>
            {/* Debug info - remove in production */}
            <Text style={{ display: 'none' }}>
              {JSON.stringify(workers)}
            </Text>
            <WorkersList workers={workers} />
          </>
        )}
        
        {/* Task Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Task Management</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setAddTaskModalVisible(true)}
            >
              <Plus size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Admin Footer with Logout */}
        <View style={styles.adminFooter}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addTaskModalVisible}
        onRequestClose={() => setAddTaskModalVisible(false)}
      >
        <AddTaskForm 
          onSubmit={handleAddTask}
          onCancel={() => setAddTaskModalVisible(false)}
          businessId={userDetails?.business_id || ''}
          userId={user?.id || ''}
          workers={workers.filter(w => w.role === 'worker')}
        />
      </Modal>
      
      {/* Create Business Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createBusinessModalVisible}
        onRequestClose={() => setCreateBusinessModalVisible(false)}
      >
        <CreateBusinessForm 
          onCancel={() => setCreateBusinessModalVisible(false)}
          onBusinessCreated={handleBusinessCreated}
        />
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
    backgroundColor: '#673AB7',
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  unauthorizedContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#D32F2F',
  },
  unauthorizedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  adminFooter: {
    marginTop: 24,
    marginBottom: 48,
    alignItems: 'center',
  },
});