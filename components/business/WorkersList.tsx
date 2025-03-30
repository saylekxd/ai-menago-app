import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Worker } from '@/types/business';

interface WorkersListProps {
  workers: Worker[];
  showTitle?: boolean;
}

export default function WorkersList({ workers, showTitle = true }: WorkersListProps) {
  // Function to get badge color based on worker role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#673AB7';
      case 'manager':
        return '#2196F3';
      default:
        return '#4CAF50';
    }
  };

  // Render worker item
  const renderWorkerItem = ({ item }: { item: Worker }) => (
    <View style={styles.workerCard}>
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.first_name} {item.last_name}</Text>
        <View 
          style={[
            styles.roleBadge, 
            { backgroundColor: getRoleBadgeColor(item.role) }
          ]}
        >
          <Text style={styles.roleText}>
            {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.section}>
      {showTitle && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Members</Text>
        </View>
      )}
      
      <View style={styles.workersContainer}>
        {workers.length > 0 ? (
          <FlatList
            data={workers}
            renderItem={renderWorkerItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No team members found.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  workersContainer: {
    marginTop: 8,
  },
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCard: {
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
  emptyText: {
    color: '#757575',
    textAlign: 'center',
  },
}); 