import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserDetails {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  business_id: string | null;
  [key: string]: any;
}

export function useUserDetails(user: User | null) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user details for auth ID:', user.id);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id);

      if (error) throw error;

      // Check if user exists in the users table
      if (!data || data.length === 0) {
        setError('User profile not found. Please contact an administrator.');
        setUserDetails(null);
      } else {
        // User exists, set the details
        console.log('User details found with user_id:', data[0].user_id);
        setUserDetails(data[0]);
        setError(null);
      }
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setError(`Failed to load user profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [user]);

  return {
    userDetails,
    loading,
    error,
    refetchUserDetails: fetchUserDetails,
    isManager: userDetails?.role === 'manager' || userDetails?.role === 'admin'
  };
} 