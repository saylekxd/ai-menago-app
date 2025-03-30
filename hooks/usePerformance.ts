import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type TaskPerformance = Database['public']['Tables']['task_performance']['Row'];
type TaskAssignment = Database['public']['Tables']['task_assignments']['Row'];

export function usePerformance(userId: string | null, isManager: boolean, businessId: string | null) {
  const [performance, setPerformance] = useState<TaskPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  });
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
        setUserIdMap({
          authId: data.id,
          userId: data.user_id
        });
      }
    } catch (err) {
      console.error('Error fetching user mapping:', err);
    }
  };

  // Fetch performance data for user or team
  const fetchPerformance = async () => {
    if (!userId || !businessId || !userIdMap) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // If manager, get performance for all users in business
      if (isManager) {
        const { data: users } = await supabase
          .from('users')
          .select('id, user_id')
          .eq('business_id', businessId);
          
        if (!users || users.length === 0) throw new Error('No users found');
        
        const userIds = users.map(user => user.user_id);
        
        const { data, error } = await supabase
          .from('task_performance')
          .select('*')
          .in('user_id', userIds)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPerformance(data || []);
      } else {
        // Get only this user's performance
        const { data, error } = await supabase
          .from('task_performance')
          .select('*')
          .eq('user_id', userIdMap.userId)  // Use the mapped user ID
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPerformance(data || []);
      }
      
      // Also fetch task stats
      await fetchTaskStats();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Get task completion stats based on task assignments
  const fetchTaskStats = async () => {
    if (!userId || !businessId || !userIdMap) return;
    
    try {
      // First get the user's assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('task_assignments')
        .select('id, task_id, user_id, assigned_at, completed, completed_at, verification_photo_url')
        .eq('user_id', userIdMap.userId);
        
      if (assignmentError) throw assignmentError;
      
      if (!assignments || assignments.length === 0) {
        setStats({
          completedTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0,
          completionRate: 0,
        });
        return;
      }
      
      // Get the tasks for these assignments
      const taskIds = assignments.map(a => a.task_id);
      
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, due_date')
        .in('id', taskIds);
        
      if (tasksError) throw tasksError;
      
      if (!tasks) return;
      
      // Match tasks with assignments to check due dates
      const now = new Date();
      
      // Count based on assignments
      const completed = assignments.filter(a => a.completed).length;
      const pending = assignments.filter(a => !a.completed).length;
      
      // For overdue, we need to check the task due dates against assignments
      const overdue = assignments.filter(a => {
        if (a.completed) return false;
        
        // Find the corresponding task to check its due date
        const task = tasks.find(t => t.id === a.task_id);
        return task && new Date(task.due_date) < now;
      }).length;
      
      const completionRate = assignments.length > 0 
        ? Math.round((completed / assignments.length) * 100) 
        : 0;
      
      setStats({
        completedTasks: completed,
        pendingTasks: pending,
        overdueTasks: overdue,
        completionRate,
      });
    } catch (err: any) {
      console.error('Error fetching task stats:', err);
    }
  };
  
  // Use effect to fetch performance data on mount or when userIdMap changes
  useEffect(() => {
    if (userId && businessId && userIdMap) {
      fetchPerformance();
    }
  }, [userId, isManager, businessId, userIdMap]);
  
  return {
    performance,
    stats,
    loading,
    error,
    fetchPerformance,
    fetchTaskStats,
  };
}