import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { CircleCheck as CheckCircle2, CalendarClock, Camera, Users } from 'lucide-react-native';
import { Database } from '@/types/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskAssignment = Database['public']['Tables']['task_assignments']['Row'];

interface TaskCardProps {
  task: Task;
  assignments?: TaskAssignment[];
  assignedUsers?: Array<{id: string, first_name: string, last_name: string}>;
  onComplete: (taskId: string, assignmentId?: string) => void;
  onTakePhoto: (taskId: string, assignmentId?: string) => void;
  userAssignment?: TaskAssignment; // The current user's assignment
}

export default function TaskCard({ 
  task, 
  assignments = [], 
  assignedUsers = [], 
  onComplete, 
  onTakePhoto, 
  userAssignment 
}: TaskCardProps) {
  const isOverdue = new Date(task.due_date) < new Date() && !task.completed;
  const dueDate = new Date(task.due_date).toLocaleDateString();
  
  // Check if all assignments are completed or if legacy task is completed
  const isTaskCompleted = task.completed || 
    (assignments.length > 0 && assignments.every(a => a.completed));
  
  // Count completed assignments
  const completedCount = assignments.filter(a => a.completed).length;
  const assigneeCount = assignments.length > 0 ? assignments.length : 1;
  
  // Format: "2/3 completed"
  const completionStatus = `${completedCount}/${assigneeCount} completed`;
  
  return (
    <View style={[styles.card, isTaskCompleted && styles.completedCard, isOverdue && styles.overdueCard]}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        {isTaskCompleted && (
          <View style={styles.completedBadge}>
            <CheckCircle2 size={16} color="#fff" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
        {!isTaskCompleted && completedCount > 0 && (
          <View style={styles.partialCompletedBadge}>
            <CheckCircle2 size={16} color="#fff" />
            <Text style={styles.completedText}>{completionStatus}</Text>
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
      
      {/* Display assignees */}
      {assignedUsers.length > 0 && (
        <View style={styles.assignees}>
          <Users size={16} color="#666" />
          <Text style={styles.assigneesText}>
            Assigned to: {assignedUsers.map(u => `${u.first_name} ${u.last_name}`).join(', ')}
          </Text>
        </View>
      )}
      
      {/* If the task has been completed by the current user, show their verification photo */}
      {userAssignment?.completed && userAssignment?.verification_photo_url && (
        <Image source={{ uri: userAssignment.verification_photo_url }} style={styles.verificationImage} />
      )}
      
      {/* Show action buttons only if the user hasn't completed their assignment yet */}
      {(!isTaskCompleted && (!userAssignment || !userAssignment.completed)) && (
        <View style={styles.actions}>
          {task.requires_photo && (
            <TouchableOpacity 
              style={[styles.button, styles.photoButton]} 
              onPress={() => onTakePhoto(task.id, userAssignment?.id)}
            >
              <Camera size={16} color="#fff" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.completeButton]}
            onPress={() => onComplete(task.id, userAssignment?.id)}
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
  partialCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
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
    marginBottom: 8,
  },
  dueDateText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  assignees: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assigneesText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
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