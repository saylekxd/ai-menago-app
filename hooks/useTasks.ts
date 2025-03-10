import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];

export function useTasks(userId: string | null, isManager: boolean, businessId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks based on role
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('tasks').select('*');

      if (!businessId) {
        throw new Error('Business ID is required');
      }

      // Add business filter
      query = query.eq('business_id', businessId);

      // If not a manager, only show tasks assigned to this user
      if (!isManager && userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new task (managers only)
  const addTask = async (taskData: Omit<Database['public']['Tables']['tasks']['Insert'], 'id' | 'created_at' | 'completed' | 'completed_at'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          completed: false,
        })
        .select();

      if (error) throw error;
      
      // Update local state
      setTasks(prev => [...prev, data[0]]);
      return { data: data[0], error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Mark a task as complete (with optional photo)
  const completeTask = async (taskId: string, photoUrl?: string) => {
    try {
      const updates: Database['public']['Tables']['tasks']['Update'] = {
        completed: true,
        completed_at: new Date().toISOString(),
      };

      // If photo URL is provided, update that field
      if (photoUrl) {
        updates.verification_photo_url = photoUrl;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select();

      if (error) throw error;
      
      // Update local state
      setTasks(prev => prev.map(task => (task.id === taskId ? data[0] : task)));
      return { data: data[0], error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Upload verification photo
  const uploadPhoto = async (uri: string, taskId: string) => {
    try {
      const fileName = `task_verification/${taskId}/${new Date().getTime()}`;
      
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('task-photos')
        .upload(fileName, blob);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('task-photos')
        .getPublicUrl(fileName);

      return { url: publicUrl, error: null };
    } catch (err: any) {
      return { url: null, error: err.message };
    }
  };

  // Use effect to fetch tasks on component mount or when dependencies change
  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId, isManager, businessId]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    completeTask,
    uploadPhoto
  };
}