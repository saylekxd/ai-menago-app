import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, RefreshControl, Alert } from 'react-native';
import { useAuth, useTasks, useUserDetails, useBusinesses } from '@/hooks';
import { Plus, LogOut, User } from 'lucide-react-native';
import { 
  AddTaskForm, 
  CreateBusinessForm, 
  BusinessList, 
  TeamMembersView, 
  CompanyDashboard,
  LoadingView, 
  ErrorView 
} from '@/components';
import { useRouter } from 'expo-router';

export default function TeamDashboardScreen() {
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
  const [updatingRoles, setUpdatingRoles] = useState(false);
  
  // Initialize businesses hook once we have user details
  const { 
    businesses,
    workers, 
    loading: businessesLoading,
    error: businessesError,
    fetchBusinesses,
    fetchWorkers,
    createBusiness,
    updateUserRole,
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
  const handleAddTask = async (taskData: any, assigneeIds: string[]) => {
    const result = await addTask(taskData, assigneeIds);
    return result;
  };
  
  // Handle business creation
  const handleBusinessCreated = async () => {
    setCreateBusinessModalVisible(false);
    await fetchBusinesses();
  };
  
  // Handle upgrading worker to manager or downgrading manager to worker
  const handleUpdateRole = async (userId: string, newRole: 'worker' | 'manager') => {
    setUpdatingRoles(true);
    
    try {
      if (!isAdmin) {
        Alert.alert('Permission Denied', 'Only admins can change user roles.');
        return;
      }
      
      const result = await updateUserRole(userId, newRole);
      
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        const roleChangeMessage = newRole === 'manager' 
          ? 'Worker has been upgraded to manager role.' 
          : 'Manager has been downgraded to worker role.';
        Alert.alert('Success', roleChangeMessage);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update user role');
    } finally {
      setUpdatingRoles(false);
    }
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
        <DashboardHeader 
          title="Team Dashboard" 
          userRole={userDetails?.role || 'worker'}
          onLogout={handleLogout}
        />
        <ErrorView 
          message={userError} 
          onRetry={refetchUserDetails}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <DashboardHeader 
        title="Team Dashboard" 
        subtitle={isManager ? "Manage tasks, workers and businesses" : "View team and tasks"}
        userRole={userDetails?.role || 'worker'}
        onLogout={handleLogout}
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Company Dashboard for All Users */}
        {userDetails?.business_id && (
          <CompanyDashboard
            business={businesses.find(b => b.id === userDetails.business_id) || null}
            workerCount={workers.length}
            completedTasksCount={5} // Replace with actual data
            pendingTasksCount={3} // Replace with actual data
            announcements={[
              {
                id: '1',
                title: 'Welcome to the Team Dashboard',
                date: new Date().toLocaleDateString(),
                content: 'This dashboard provides you with an overview of your team, tasks, and company information.'
              }
            ]}
            onViewAllAnnouncements={() => {
              // Handle view all announcements
              console.log('View all announcements');
            }}
          />
        )}
        
        {/* Business Management Section - Admin & Manager Only */}
        {isManager && (
          <BusinessList 
            businesses={businesses}
            onAddBusiness={() => setCreateBusinessModalVisible(true)}
            isAdmin={isAdmin}
          />
        )}
        
        {/* Team Management Section - Visible to all, but with different capabilities */}
        {userDetails?.business_id && (
          <TeamMembersView
            workers={workers}
            isAdmin={isAdmin}
            isManager={isManager}
            readOnly={!isManager}
            onUpdateRole={handleUpdateRole}
            isUpdating={updatingRoles}
            businessName={businesses.find(b => b.id === userDetails.business_id)?.name}
            onContactMember={(worker) => {
              Alert.alert(
                'Contact Member',
                `Would you like to contact ${worker.first_name} ${worker.last_name}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Contact', onPress: () => console.log('Contact:', worker.email) }
                ]
              );
            }}
          />
        )}
        
        {/* Task Management Section - Admin & Manager Only */}
        {isManager && (
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
        )}
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
          workers={workers}
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

// Common header component with logout button
interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userRole: string;
  onLogout: () => void;
}

const DashboardHeader = ({ title, subtitle, userRole, onLogout }: DashboardHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.headerContent}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <TouchableOpacity style={styles.profileButton} onPress={onLogout}>
        <LogOut size={20} color="#fff" />
      </TouchableOpacity>
    </View>
    <View style={styles.roleIndicator}>
      <User size={14} color="#fff" />
      <Text style={styles.roleText}>
        {userRole === 'admin' ? 'Administrator' : userRole === 'manager' ? 'Manager' : 'Team Member'}
      </Text>
    </View>
  </View>
);

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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    color: '#fff',
    marginLeft: 4,
    opacity: 0.9,
  },
  profileButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
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
});