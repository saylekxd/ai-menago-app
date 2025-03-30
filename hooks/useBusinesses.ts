import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Business, Worker } from '@/types/business';

interface UseBusinessesOptions {
  userId: string | null;
  userRole: string | null;
  businessId: string | null;
}

export function useBusinesses({ userId, userRole, businessId }: UseBusinessesOptions) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager' || isAdmin;

  useEffect(() => {
    if (userId && isManager) {
      fetchBusinesses();
      
      if (businessId) {
        fetchWorkers(businessId);
      }
    } else {
      setLoading(false);
    }
  }, [userId, userRole, businessId]);

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from('businesses').select('*');
      
      // For managers and admins, only fetch their business
      if ((userRole === 'manager' || userRole === 'admin') && businessId) {
        query = query.eq('id', businessId);
      }
      
      const { data, error } = await query.order('name', { ascending: true });
      
      if (error) throw error;
      setBusinesses(data || []);
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      setError(`Failed to load businesses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async (businessIdToFetch: string) => {
    try {
      setError(null);
      
      console.log('Fetching workers for business:', businessIdToFetch);
      console.log('Current user role:', userRole);
      
      const { data, error } = await supabase
        .from('users')
        .select('id, user_id, first_name, last_name, role')
        .eq('business_id', businessIdToFetch)
        .order('first_name', { ascending: true });
        
      if (error) {
        console.error('DB Error fetching workers:', error);
        throw error;
      }
      
      console.log('Workers fetched:', data?.length || 0);
      setWorkers(data || []);
    } catch (error: any) {
      console.error('Error fetching workers:', error);
      setError(`Failed to load workers: ${error.message}`);
    }
  };

  const createBusiness = async (businessData: Omit<Business, 'id' | 'created_at'>) => {
    if (!isAdmin) {
      return { error: 'Only admins can create businesses' };
    }
    
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('businesses')
        .insert([businessData])
        .select()
        .single();
        
      if (error) throw error;
      
      // Update the local state with the new business
      setBusinesses(prev => [...prev, data]);
      
      return { data };
    } catch (error: any) {
      console.error('Error creating business:', error);
      setError(`Failed to create business: ${error.message}`);
      return { error: error.message };
    }
  };

  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    if (!isManager) {
      return { error: 'Permission denied' };
    }
    
    // Managers can only update their own business
    if (userRole === 'manager' && id !== businessId) {
      return { error: 'You can only update your own business' };
    }
    
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update the local state
      setBusinesses(prev => 
        prev.map(business => business.id === id ? data : business)
      );
      
      return { data };
    } catch (error: any) {
      console.error('Error updating business:', error);
      setError(`Failed to update business: ${error.message}`);
      return { error: error.message };
    }
  };

  // Function for admins to update a worker's role (e.g., upgrade to manager or downgrade to worker)
  const updateUserRole = async (userId: string, newRole: 'worker' | 'manager') => {
    if (!isAdmin) {
      return { error: 'Only admins can update user roles' };
    }
    
    // Admins can only update users in their business
    if (businessId) {
      try {
        setError(null);
        
        // Verify user belongs to admin's business
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('business_id, role')
          .eq('id', userId)
          .single();
          
        if (userError) throw userError;
        
        if (userData.business_id !== businessId) {
          return { error: 'You can only update users in your business' };
        }
        
        // Prevent changing admin roles
        if (userData.role === 'admin') {
          return { error: 'Admin roles cannot be changed' };
        }
        
        // Update the user's role
        const { data, error } = await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', userId)
          .select()
          .single();
          
        if (error) throw error;
        
        // Refresh workers list
        await fetchWorkers(businessId);
        
        return { data };
      } catch (error: any) {
        console.error('Error updating user role:', error);
        setError(`Failed to update user role: ${error.message}`);
        return { error: error.message };
      }
    } else {
      return { error: 'Business ID is required' };
    }
  };

  return {
    businesses,
    workers,
    loading,
    error,
    fetchBusinesses,
    fetchWorkers,
    createBusiness,
    updateBusiness,
    updateUserRole,
    isAdmin,
    isManager,
  };
} 