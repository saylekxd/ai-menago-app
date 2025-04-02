import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Business } from '@/types/business';
import { Users, Calendar, CheckSquare, Bell, Building2 } from 'lucide-react-native';

interface CompanyDashboardProps {
  business: Business | null;
  workerCount: number;
  completedTasksCount?: number;
  pendingTasksCount?: number;
  announcements?: Array<{id: string; title: string; date: string; content: string}>;
  onViewAllAnnouncements?: () => void;
}

export default function CompanyDashboard({
  business,
  workerCount,
  completedTasksCount = 0,
  pendingTasksCount = 0,
  announcements = [],
  onViewAllAnnouncements
}: CompanyDashboardProps) {
  if (!business) {
    return (
      <View style={styles.emptyContainer}>
        <Building2 size={40} color="#BDBDBD" />
        <Text style={styles.emptyText}>No business information available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Company Header */}
      <View style={styles.companyHeader}>
        <View style={styles.companyInfo}>
          {business.logo_url ? (
            <Image 
              source={{ uri: business.logo_url }} 
              style={styles.companyLogo} 
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Building2 size={30} color="#673AB7" />
            </View>
          )}
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{business.name}</Text>
            {business.description && (
              <Text style={styles.companyDescription} numberOfLines={2}>
                {business.description}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Company Metrics */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Users size={24} color="#673AB7" />
          <Text style={styles.metricValue}>{workerCount}</Text>
          <Text style={styles.metricLabel}>Team Members</Text>
        </View>

        <View style={styles.metricCard}>
          <CheckSquare size={24} color="#4CAF50" />
          <Text style={styles.metricValue}>{completedTasksCount}</Text>
          <Text style={styles.metricLabel}>Completed Tasks</Text>
        </View>

        <View style={styles.metricCard}>
          <Calendar size={24} color="#FFC107" />
          <Text style={styles.metricValue}>{pendingTasksCount}</Text>
          <Text style={styles.metricLabel}>Pending Tasks</Text>
        </View>
      </View>

      {/* Company Announcements */}
      <View style={styles.announcementsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Announcements</Text>
          {onViewAllAnnouncements && announcements.length > 0 && (
            <TouchableOpacity onPress={onViewAllAnnouncements}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {announcements.length > 0 ? (
          announcements.slice(0, 2).map((announcement) => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View style={styles.announcementHeader}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementDate}>{announcement.date}</Text>
              </View>
              <Text style={styles.announcementContent} numberOfLines={3}>
                {announcement.content}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyAnnouncements}>
            <Bell size={24} color="#BDBDBD" />
            <Text style={styles.emptyAnnouncementsText}>No announcements yet</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  companyHeader: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1BEE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyDescription: {
    fontSize: 14,
    color: '#666',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  announcementsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#673AB7',
  },
  announcementCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#673AB7',
    paddingLeft: 12,
    marginBottom: 16,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  announcementDate: {
    fontSize: 12,
    color: '#999',
  },
  announcementContent: {
    fontSize: 14,
    color: '#666',
  },
  emptyAnnouncements: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyAnnouncementsText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
}); 