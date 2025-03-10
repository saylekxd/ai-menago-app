import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type TaskPerformance = Database['public']['Tables']['task_performance']['Row'];

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

  // Fetch performance data for user or team
  const fetchPerformance = async () => {
    if (!userId || !businessId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // If manager, get performance for all users in business
      if (isManager) {
        const { data: users } = await supabase
          .from('users')
          .select('id')
          .eq('business_id', businessId);
          
        if (!users || users.length === 0) throw new Error('No users found');
        
        const userIds = users.map(user => user.id);
        
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
          .eq('user_id', userId)
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
  
  // Get task completion stats
  const fetchTaskStats = async () => {
    if (!userId || !businessId) return;
    
    try {
      let query = supabase.from('tasks').select('*');
      
      // Filter by business
      query = query.eq('business_id', businessId);
      
      // If not manager, only get this user's tasks
      if (!isManager) {
        query = query.eq('assigned_to', userId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      if (!data) return;
      
      const now = new Date();
      const completed = data.filter(task => task.completed).length;
      const pending = data.filter(task => !task.completed).length;
      const overdue = data.filter(task => {
        return !task.completed && new Date(task.due_date) < now;
      }).length;
      
      const completionRate = data.length > 0 
        ? Math.round((completed / data.length) * 100) 
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
  
  // Use effect to fetch performance data on mount
  useEffect(() => {
    if (userId && businessId) {
      fetchPerformance();
    }
  }, [userId, isManager, businessId]);
  
  return {
    performance,
    stats,
    loading,
    error,
    fetchPerformance,
    fetchTaskStats,
  };
}