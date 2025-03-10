import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Clock, ChartLine as LineChart } from 'lucide-react-native';

interface StatsCardProps {
  title: string;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export default function StatsCard({ title, completed, pending, overdue, completionRate }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${completionRate}%` },
              { backgroundColor: completionRate < 30 ? '#F44336' : completionRate < 70 ? '#FFC107' : '#4CAF50' }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{completionRate}% Complete</Text>
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
            <CheckCircle2 size={20} color="#4CAF50" />
          </View>
          <View>
            <Text style={styles.statValue}>{completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
            <Clock size={20} color="#2196F3" />
          </View>
          <View>
            <Text style={styles.statValue}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
            <AlertCircle size={20} color="#F44336" />
          </View>
          <View>
            <Text style={styles.statValue}>{overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
});