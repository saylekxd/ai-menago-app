import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth, usePerformance, useUserDetails } from '@/hooks';
import { StatsCard, LoadingView, ErrorView } from '@/components';
import { CalendarDays, TrendingUp, CircleCheck as CheckCircle2, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function PerformanceScreen() {
  const { user } = useAuth();
  const { 
    userDetails, 
    loading: userLoading, 
    error: userError, 
    refetchUserDetails,
    isManager
  } = useUserDetails(user);
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Initialize performance hook once we have user details
  const { 
    stats,
    loading: performanceLoading, 
    error: performanceError,
    fetchPerformance,
  } = usePerformance(
    user?.id || null, 
    isManager, 
    userDetails?.business_id || null
  );
  
  // Refresh performance data
  const onRefresh = async () => {
    setRefreshing(true);
    
    // If user details are missing, try to fetch them again
    if (!userDetails && user) {
      await refetchUserDetails();
    }
    
    // Only fetch performance if we have user details
    if (userDetails) {
      await fetchPerformance();
    }
    
    setRefreshing(false);
  };
  
  // Loading state
  if (userLoading || !user) {
    return <LoadingView />;
  }
  
  // Error state
  if (userError) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance</Text>
        </View>
        <ErrorView 
          message={userError} 
          onRetry={refetchUserDetails} 
        />
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
        <ErrorView 
          message={performanceError} 
          onRetry={fetchPerformance} 
        />
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
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoCardIcon: {
    marginBottom: 8,
  },
  infoCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#666',
  },
  performanceTips: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  tipCard: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipHeadline: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});