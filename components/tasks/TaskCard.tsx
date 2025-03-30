import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { CircleCheck as CheckCircle2, CalendarClock, Camera } from 'lucide-react-native';
import { Database } from '@/types/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onTakePhoto: (taskId: string) => void;
}

export default function TaskCard({ task, onComplete, onTakePhoto }: TaskCardProps) {
  const isOverdue = new Date(task.due_date) < new Date() && !task.completed;
  const dueDate = new Date(task.due_date).toLocaleDateString();
  
  return (
    <View style={[styles.card, task.completed && styles.completedCard, isOverdue && styles.overdueCard]}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        {task.completed && (
          <View style={styles.completedBadge}>
            <CheckCircle2 size={16} color="#fff" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
        {isOverdue && (
          <View style={styles.overdueBadge}>
            <CalendarClock size={16} color="#fff" />
            <Text style={styles.overdueText}>Overdue</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.description}>{task.description}</Text>
      
      <View style={styles.dueDate}>
        <CalendarClock size={16} color="#666" />
        <Text style={styles.dueDateText}>Due: {dueDate}</Text>
      </View>
      
      {task.verification_photo_url && (
        <Image source={{ uri: task.verification_photo_url }} style={styles.verificationImage} />
      )}
      
      {!task.completed && (
        <View style={styles.actions}>
          {task.requires_photo && (
            <TouchableOpacity 
              style={[styles.button, styles.photoButton]} 
              onPress={() => onTakePhoto(task.id)}
            >
              <Camera size={16} color="#fff" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.completeButton]}
            onPress={() => onComplete(task.id)}
          >
            <CheckCircle2 size={16} color="#fff" />
            <Text style={styles.buttonText}>
              {task.requires_photo ? 'Complete with Photo' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  completedCard: {
    opacity: 0.8,
    borderLeftColor: '#4CAF50',
    borderLeftWidth: 4,
  },
  overdueCard: {
    borderLeftColor: '#F44336',
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  overdueText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  verificationImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  photoButton: {
    backgroundColor: '#607D8B',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
});