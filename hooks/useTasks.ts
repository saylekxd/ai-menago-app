import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import * as FileSystem from 'expo-file-system';

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