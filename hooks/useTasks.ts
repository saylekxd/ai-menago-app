import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import * as FileSystem from 'expo-file-system';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskAssignment = Database['public']['Tables']['task_assignments']['Row'];

export function useTasks(userId: string | null, isManager: boolean, businessId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userIdMap, setUserIdMap] = useState<{authId: string, userId: string} | null>(null);

  // Get the user_id from auth.id mapping
  useEffect(() => {
    if (userId) {
      fetchUserIdMapping();
    }
  }, [userId]);

  const fetchUserIdMapping = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, user_id, role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      if (data) {
        console.log('User ID mapping:', { 
          authId: data.id, 
          userId: data.user_id,
          role: data.role 
        });
        setUserIdMap({
          authId: data.id,
          userId: data.user_id
        });
      }
    } catch (err) {
      console.error('Error fetching user mapping:', err);
    }
  };

  // Fetch tasks based on role
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!userIdMap) {
        throw new Error('User ID mapping not available');
      }

      if (!businessId) {
        throw new Error('Business ID is required');
      }

      // First, fetch the user's task assignments
      const { data: userAssignments, error: assignmentsError } = await supabase
        .from('task_assignments')
        .select('id, task_id, user_id, assigned_at, completed, completed_at, verification_photo_url')
        .eq('user_id', userIdMap.userId);
        
      if (assignmentsError) {
        console.error('Error fetching user assignments:', assignmentsError);
        throw assignmentsError;
      }
      
      // Get all task IDs assigned to the current user
      const userTaskIds = userAssignments?.map(a => a.task_id) || [];
      
      let tasksQuery;
      let tasksData: Task[] = [];
      
      // For dashboard, everyone only sees tasks assigned to them
      if (userTaskIds.length > 0) {
        tasksQuery = supabase
          .from('tasks')
          .select('*')
          .eq('business_id', businessId)
          .in('id', userTaskIds)
          .order('due_date', { ascending: true });
          
        const { data, error: tasksError } = await tasksQuery;
        
        if (tasksError) {
          console.error('Supabase tasks query error:', tasksError);
          throw tasksError;
        }
        
        tasksData = data || [];
      }
      
      // Fetch all task assignments for the user's tasks
      let allAssignments: TaskAssignment[] = [];
      
      if (tasksData.length > 0) {
        const taskIds = tasksData.map(task => task.id);
        const { data: assignmentsData, error: allAssignmentsError } = await supabase
          .from('task_assignments')
          .select('id, task_id, user_id, assigned_at, completed, completed_at, verification_photo_url')
          .in('task_id', taskIds);
          
        if (allAssignmentsError) {
          console.error('Error fetching all assignments:', allAssignmentsError);
          throw allAssignmentsError;
        }
        
        allAssignments = assignmentsData || [];
      } else {
        // No tasks found, so use just the user's assignments
        allAssignments = userAssignments || [];
      }
      
      console.log(`Fetched ${tasksData.length} tasks and ${allAssignments.length} assignments`);
      
      // Set the data
      setTasks(tasksData);
      setTaskAssignments(allAssignments);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new task with multiple assignees
  const addTask = async (
    taskData: Omit<Database['public']['Tables']['tasks']['Insert'], 'id' | 'created_at' | 'completed' | 'completed_at'>,
    assigneeIds: string[]
  ) => {
    try {
      if (!userIdMap) {
        return { data: null, error: 'User ID mapping not available' };
      }

      if (assigneeIds.length === 0) {
        return { data: null, error: 'At least one assignee is required' };
      }

      // Update created_by to use user_id if needed
      const updatedTaskData = {
        ...taskData,
        created_by: userIdMap.userId,
        completed: false,
      };

      // Insert the task
      const { data: newTaskData, error: taskError } = await supabase
        .from('tasks')
        .insert(updatedTaskData)
        .select();

      if (taskError) throw taskError;
      
      if (!newTaskData || newTaskData.length === 0) {
        throw new Error('Failed to create task');
      }

      const newTaskId = newTaskData[0].id;
      
      // Create task assignments for each assignee using individual queries
      for (const userId of assigneeIds) {
        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert({
            task_id: newTaskId,
            user_id: userId,
            completed: false
          });
          
        if (assignmentError) {
          console.error(`Error assigning task to user ${userId}:`, assignmentError);
        }
      }
      
      // Update local state
      setTasks(prev => [...prev, newTaskData[0]]);
      
      // Refresh assignments
      fetchTasks();
      
      return { data: newTaskData[0], error: null };
    } catch (err: any) {
      console.error('Error creating task:', err);
      return { data: null, error: err.message };
    }
  };

  // Mark a task assignment as complete (with optional photo)
  const completeTaskAssignment = async (assignmentId: string, photoUrl?: string) => {
    try {
      const updates = {
        completed: true,
        completed_at: new Date().toISOString(),
        verification_photo_url: photoUrl || null
      };

      const { data, error } = await supabase
        .from('task_assignments')
        .update(updates)
        .eq('id', assignmentId)
        .select();

      if (error) throw error;
      
      // Update local state
      setTaskAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId ? data[0] : assignment
        )
      );
      
      // Refresh the task list to update completion status
      fetchTasks();
      
      return { data: data[0], error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Legacy method for backwards compatibility
  const completeTask = async (taskId: string, photoUrl?: string) => {
    try {
      // Find the assignment for this task for the current user
      const assignment = taskAssignments.find(
        a => a.task_id === taskId && a.user_id === userIdMap?.userId
      );
      
      if (!assignment) {
        return { data: null, error: 'Assignment not found for this task' };
      }
      
      // Complete the assignment instead
      return await completeTaskAssignment(assignment.id, photoUrl);
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Upload verification photo
  const uploadPhoto = async (uri: string, taskId: string) => {
    try {
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileName = `task_verification/${taskId}/${timestamp}.jpg`;
      
      // Get auth token
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error("Authentication token not available");
      }
      
      // Get Supabase URL from environment or constants
      // Using hardcoded URL from lib/supabase.ts as fallback
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 
                           'https://bbxsssdbptcuitnjkrfi.supabase.co';
      
      // Log upload attempt
      console.log(`Attempting to upload file to ${fileName}`);
      
      // Using direct REST API call instead of Supabase client
      try {
        const uploadResult = await FileSystem.uploadAsync(
          `${supabaseUrl}/storage/v1/object/task-photos/${fileName}`,
          uri,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'image/jpeg',
            },
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          }
        );
        
        if (uploadResult.status >= 200 && uploadResult.status < 300) {
          // Get public URL 
          const { data: { publicUrl } } = supabase.storage
            .from('task-photos')
            .getPublicUrl(fileName);
            
          return { url: publicUrl, error: null };
        } else {
          throw new Error(`Upload failed with status ${uploadResult.status}`);
        }
      } catch (uploadError) {
        console.error('REST upload error:', uploadError);
        
        // Fallback to base64 upload if direct upload fails
        try {
          console.log('Attempting fallback to base64 upload...');
          // Read the file as base64
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Upload to Supabase storage with base64
          const { data, error } = await supabase.storage
            .from('task-photos')
            .upload(fileName, base64, {
              contentType: 'image/jpeg',
              upsert: true,
            });
          
          if (error) throw error;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('task-photos')
            .getPublicUrl(fileName);
            
          return { url: publicUrl, error: null };
        } catch (base64Error) {
          console.error('Base64 upload error:', base64Error);
          throw base64Error;
        }
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      return { url: null, error: err.message };
    }
  };

  // Use effect to fetch tasks when userIdMap is available
  useEffect(() => {
    if (userId && userIdMap) {
      fetchTasks();
    }
  }, [userId, isManager, businessId, userIdMap]);

  return {
    tasks,
    taskAssignments,
    loading,
    error,
    fetchTasks,
    addTask,
    completeTask,
    completeTaskAssignment,
    uploadPhoto
  };
}