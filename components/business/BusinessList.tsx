import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Building2 } from 'lucide-react-native';
import BusinessCard from '@/components/business/BusinessCard';
import { Business } from '@/types/business';

interface BusinessListProps {
  businesses: Business[];
  onAddBusiness: () => void;
  isAdmin: boolean;
}

export default function BusinessList({ businesses, onAddBusiness, isAdmin }: BusinessListProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Business Management</Text>
        {isAdmin && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={onAddBusiness}
          >
            <Building2 size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Business</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.businessesContainer}>
        {businesses.length > 0 ? (
          <FlatList
            data={businesses}
            renderItem={({ item }) => <BusinessCard business={item} />}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No businesses found. {isAdmin ? 'Create one to get started.' : 'Contact an administrator.'}
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
    fontWeight: 'bold',
    marginLeft: 8,
  },
  businessesContainer: {
    marginTop: 8,
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