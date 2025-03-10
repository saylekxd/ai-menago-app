import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { supabase } from '@/lib/supabase';
import { Plus, LogOut, Building2 } from 'lucide-react-native';
import AddTaskForm from '@/components/AddTaskForm';
import CreateBusinessForm from '@/components/CreateBusinessForm';
import BusinessCard from '@/components/BusinessCard';
import { useRouter } from 'expo-router';

export default function AdminScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [createBusinessModalVisible, setCreateBusinessModalVisible] = useState(false);
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
        
        // If manager or admin, fetch workers
        if (data[0].role === 'manager' || data[0].role === 'admin') {
          await fetchWorkers(data[0].business_id);
          await fetchBusinesses();
        }
      } catch (error: any) {
        console.error('Error fetching user details:', error);
        setUserError(`Failed to load user profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [user]);
  
  // Fetch workers for the business
  const fetchWorkers = async (businessId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, role')
        .eq('business_id', businessId)
        .order('first_name', { ascending: true });
        
      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };
  
  // Fetch businesses
  const fetchBusinesses = async () => {
    try {
      // For admins, fetch all businesses
      // For managers, only fetch their business
      let query = supabase.from('businesses').select('*');
      
      if (userDetails?.role === 'manager') {
        query = query.eq('id', userDetails.business_id);
      }
      
      const { data, error } = await query.order('name', { ascending: true });
      
      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };
  
  // Initialize tasks hook once we have user details
  const isManager = userDetails?.role === 'manager' || userDetails?.role === 'admin';
  const { 
    addTask,
    fetchTasks,
  } = useTasks(user?.id || null, isManager, userDetails?.business_id || null);
  
  // Refresh data
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
          
          // If manager or admin, fetch workers
          if (data[0].role === 'manager' || data[0].role === 'admin') {
            await fetchWorkers(data[0].business_id);
            await fetchBusinesses();
          }
        }
      } catch (error) {
        console.error('Error refreshing user details:', error);
      }
    } else if (userDetails?.business_id) {
      await fetchTasks();
      await fetchWorkers(userDetails.business_id);
      await fetchBusinesses();
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
  
  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // If user profile not found
  if (userError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{userError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Management</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setCreateBusinessModalVisible(true)}
            >
              <Building2 size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Business</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.businessesContainer}>
            {businesses.length > 0 ? (
              businesses.map(business => (
                <BusinessCard key={business.id} business={business} />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No businesses found. Create one to get started.</Text>
              </View>
            )}
          </View>
        </View>
        
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
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <Text style={styles.cardText}>
              Use the "Add Task" button to create new tasks and assign them to team members. You can specify due dates and whether verification photos are required.
            </Text>
          </View>
        </View>
        
        {/* Team Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          
          {workers.map(worker => (
            <View key={worker.id} style={styles.workerCard}>
              <View>
                <Text style={styles.workerName}>{worker.first_name} {worker.last_name}</Text>
                <Text style={styles.workerRole}>{worker.role}</Text>
              </View>
            </View>
          ))}
          
          {workers.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No team members found.</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Add Task Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addTaskModalVisible}
        onRequestClose={() => setAddTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AddTaskForm
              onSubmit={handleAddTask}
              workers={workers.filter(w => w.role === 'worker')}
              businessId={userDetails.business_id}
              userId={user?.id || ''}
              onCancel={() => setAddTaskModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
      
      {/* Create Business Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createBusinessModalVisible}
        onRequestClose={() => setCreateBusinessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CreateBusinessForm
              onBusinessCreated={handleBusinessCreated}
              onCancel={() => setCreateBusinessModalVisible(false)}
            />
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
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
    color: '#757575',
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
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  workerRole: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
  },
  unauthorizedContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  unauthorizedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  unauthorizedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 24,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
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
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  businessesContainer: {
    marginBottom: 16,
  }
});