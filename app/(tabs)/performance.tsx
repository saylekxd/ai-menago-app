import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { usePerformance } from '@/hooks/usePerformance';
import { supabase } from '@/lib/supabase';
import StatsCard from '@/components/StatsCard';
import { CalendarDays, TrendingUp, CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle, RefreshCw } from 'lucide-react-native';

export default function PerformanceScreen() {
  const { user } = useAuth();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  
  // Initialize performance hook once we have user details
  const isManager = userDetails?.role === 'manager' || userDetails?.role === 'admin';
  const { 
    stats,
    loading: performanceLoading, 
    error: performanceError,
    fetchPerformance,
  } = usePerformance(user?.id || null, isManager, userDetails?.business_id || null);
  
  // Refresh performance data
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
    
    // Only fetch performance if we have user details
    if (userDetails) {
      await fetchPerformance();
    }
    
    setRefreshing(false);
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
          <Text style={styles.title}>Performance</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{userError}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={onRefresh}
            >
              <RefreshCw size={16} color="#fff" style={styles.retryIcon} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Performance</Text>
        <Text style={styles.subtitle}>
          {isManager ? 'Team Performance Overview' : 'Your Task Performance'}
        </Text>
      </View>
      
      {performanceError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{performanceError}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <StatsCard
          title={isManager ? 'Team Task Completion' : 'Your Task Completion'}
          completed={stats.completedTasks}
          pending={stats.pendingTasks}
          overdue={stats.overdueTasks}
          completionRate={stats.completionRate}
        />
        
        <View style={styles.infoCards}>
          <View style={[styles.infoCard, { backgroundColor: '#E8F5E9' }]}>
            <View style={styles.infoCardIcon}>
              <CheckCircle2 size={24} color="#4CAF50" />
            </View>
            <Text style={styles.infoCardValue}>{stats.completedTasks}</Text>
            <Text style={styles.infoCardLabel}>Completed</Text>
          </View>
          
          <View style={[styles.infoCard, { backgroundColor: '#E3F2FD' }]}>
            <View style={styles.infoCardIcon}>
              <Clock size={24} color="#2196F3" />
            </View>
            <Text style={styles.infoCardValue}>{stats.pendingTasks}</Text>
            <Text style={styles.infoCardLabel}>Pending</Text>
          </View>
          
          <View style={[styles.infoCard, { backgroundColor: '#FFEBEE' }]}>
            <View style={styles.infoCardIcon}>
              <AlertCircle size={24} color="#F44336" />
            </View>
            <Text style={styles.infoCardValue}>{stats.overdueTasks}</Text>
            <Text style={styles.infoCardLabel}>Overdue</Text>
          </View>
        </View>
        
        <View style={styles.performanceTips}>
          <Text style={styles.tipsTitle}>Performance Tips</Text>
          <View style={styles.tipCard}>
            <TrendingUp size={20} color="#2196F3" style={styles.tipIcon} />
            <View>
              <Text style={styles.tipHeadline}>Focus on Priority Tasks</Text>
              <Text style={styles.tipDescription}>
                Complete urgent and important tasks first to maximize efficiency.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <CalendarDays size={20} color="#2196F3" style={styles.tipIcon} />
            <View>
              <Text style={styles.tipHeadline}>Plan Your Day</Text>
              <Text style={styles.tipDescription}>
                Review tasks at the beginning of your shift and create a completion plan.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipCard}>
            <CheckCircle2 size={20} color="#2196F3" style={styles.tipIcon} />
            <View>
              <Text style={styles.tipHeadline}>Document Your Work</Text>
              <Text style={styles.tipDescription}>
                Take clear verification photos that show task completion properly.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
    padding: 16,
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
  retryButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  infoCardIcon: {
    marginBottom: 8,
  },
  infoCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#666',
  },
  performanceTips: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
  },
});