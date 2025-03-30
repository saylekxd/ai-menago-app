import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { Copy, Share as ShareIcon, Building2 } from 'lucide-react-native';
import { Business } from '@/types/business';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Format date
  const formattedDate = new Date(business.created_at).toLocaleDateString();

  // Copy UUID to clipboard
  const copyUUID = () => {
    try {
      // In a real mobile app, we would use Clipboard.setString
      // Since we're on web, let's use the browser clipboard API
      navigator.clipboard.writeText(business.id);
      setCopySuccess(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
      
      Alert.alert('Copied!', 'Business ID copied to clipboard');
    } catch (err) {
      Alert.alert('Copy failed', 'Could not copy to clipboard');
    }
  };

  // Share UUID
  const shareUUID = async () => {
    try {
      const result = await Share.share({
        message: `Here is your Business ID for registration: ${business.id}`,
        title: `${business.name} - Business ID`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share business ID');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.businessName}>{business.name}</Text>
      </View>

      <View style={styles.detail}>
        <Text style={styles.label}>Industry:</Text>
        <Text style={styles.value}>{business.industry}</Text>
      </View>

      <View style={styles.detail}>
        <Text style={styles.label}>Created:</Text>
        <Text style={styles.value}>{formattedDate}</Text>
      </View>

      <View style={styles.uuidContainer}>
        <Text style={styles.label}>Business ID (UUID):</Text>
        <Text style={styles.uuid}>{business.id}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={copyUUID}>
          <Copy size={16} color="#2196F3" />
          <Text style={styles.actionText}>
            {copySuccess ? 'Copied!' : 'Copy UUID'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={shareUUID}>
          <ShareIcon size={16} color="#2196F3" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 8,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 8,
  },
  value: {
    fontSize: 14,
  },
  uuidContainer: {
    marginTop: 8,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 4,
  },
  uuid: {
    fontFamily: 'monospace',
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#E3F2FD',
    marginRight: 8,
  },
  actionText: {
    marginLeft: 4,
    color: '#2196F3',
    fontWeight: 'bold',
  },
});