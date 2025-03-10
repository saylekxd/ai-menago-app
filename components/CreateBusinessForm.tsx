import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Plus, Building2 } from 'lucide-react-native';

interface CreateBusinessFormProps {
  onBusinessCreated: () => void;
  onCancel: () => void;
}

export default function CreateBusinessForm({ onBusinessCreated, onCancel }: CreateBusinessFormProps) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name || !industry) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Insert new business with auto-generated UUID
      const { data, error } = await supabase
        .from('businesses')
        .insert({
          name,
          industry,
        })
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        Alert.alert(
          'Business Created',
          `Business "${name}" has been created successfully.`,
          [{ text: 'OK' }]
        );
        onBusinessCreated();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Business</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Business Name*</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter business name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Industry*</Text>
        <TextInput
          style={styles.input}
          value={industry}
          onChangeText={setIndustry}
          placeholder="Enter business industry"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={submitting}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Building2 size={16} color="#fff" />
          <Text style={styles.submitButtonText}>
            {submitting ? 'Creating...' : 'Create Business'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#2196F3',
  },
  submitButtonText: {
    color: '#fff',
    marginLeft: 4,
  },
});