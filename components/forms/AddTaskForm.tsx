import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Calendar, Camera, Plus, Users } from 'lucide-react-native';
import { Database } from '@/types/supabase';

type TaskInsert = Omit<Database['public']['Tables']['tasks']['Insert'], 'id' | 'created_at' | 'completed' | 'completed_at'>;

interface AddTaskFormProps {
  onSubmit: (taskData: TaskInsert) => Promise<{ data: any, error: string | null }>;
  workers: Array<{ id: string, first_name: string, last_name: string, role: string }>;
  businessId: string;
  userId: string;
  onCancel: () => void;
}

export default function AddTaskForm({ onSubmit, workers, businessId, userId, onCancel }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Group workers by role for easier selection
  const groupedWorkers = {
    admins: workers.filter(w => w.role === 'admin'),
    managers: workers.filter(w => w.role === 'manager'),
    workers: workers.filter(w => w.role === 'worker')
  };
  
  const handleSubmit = async () => {
    if (!title || !description || !dueDate || !assignedTo) {
      setError('Please fill all required fields');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const taskData: TaskInsert = {
        title,
        description,
        due_date: new Date(dueDate).toISOString(),
        assigned_to: assignedTo,
        created_by: userId,
        requires_photo: requiresPhoto,
        business_id: businessId,
      };
      
      const { error } = await onSubmit(taskData);
      
      if (error) {
        setError(error);
        return;
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo('');
      setRequiresPhoto(false);
      onCancel();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderWorkerGroup = (title: string, workerList: Array<{ id: string, first_name: string, last_name: string, role: string }>) => {
    if (workerList.length === 0) return null;
    
    return (
      <View style={styles.workerGroup}>
        <Text style={styles.workerGroupTitle}>{title}</Text>
        <View style={styles.workersList}>
          {workerList.map(worker => (
            <TouchableOpacity
              key={worker.id}
              style={[
                styles.workerItem,
                assignedTo === worker.id && styles.workerItemSelected
              ]}
              onPress={() => setAssignedTo(worker.id)}
            >
              <Text style={[
                styles.workerName,
                assignedTo === worker.id && styles.workerNameSelected
              ]}>
                {worker.first_name} {worker.last_name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Task</Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Task Title*</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description*</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Due Date*</Text>
        <View style={styles.dateInputContainer}>
          <Calendar size={20} color="#666" />
          <TextInput
            style={[styles.input, styles.dateInput]}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Assign To*</Text>
        {renderWorkerGroup('Admins', groupedWorkers.admins)}
        {renderWorkerGroup('Managers', groupedWorkers.managers)}
        {renderWorkerGroup('Workers', groupedWorkers.workers)}
      </View>
      
      <View style={styles.formGroup}>
        <View style={styles.toggleContainer}>
          <View style={styles.toggleLabel}>
            <Camera size={20} color="#666" />
            <Text style={styles.toggleText}>Require verification photo</Text>
          </View>
          <Switch
            value={requiresPhoto}
            onValueChange={setRequiresPhoto}
            trackColor={{ false: '#E0E0E0', true: '#BBDEFB' }}
            thumbColor={requiresPhoto ? '#2196F3' : '#FFF'}
          />
        </View>
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
          <Plus size={16} color="#fff" />
          <Text style={styles.submitButtonText}>
            {submitting ? 'Adding...' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  dateInput: {
    flex: 1,
    borderWidth: 0,
    marginLeft: 8,
  },
  workerGroup: {
    marginBottom: 12,
  },
  workerGroupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  workersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workerItem: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  workerItemSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  workerName: {
    color: '#666',
  },
  workerNameSelected: {
    color: '#0D47A1',
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    marginLeft: 8,
    color: '#666',
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