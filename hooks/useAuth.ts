import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set initial loading state
    setLoading(true);
    
    // Get the current session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
      } catch (err) {
        console.error("Error getting auth session:", err);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Listen for changes to auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: string, businessId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password, 
        options: { 
          data: { 
            first_name: firstName, 
            last_name: lastName, 
            role,
            business_id: businessId
          } 
        } 
      });
      
      if (error) throw error;
      
      // Create user profile in users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            role: role as any,
            business_id: businessId
          });
          
        if (profileError) throw profileError;
      }
      
      return data;
    } catch (error: any) {
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error: any) {
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null); // Explicitly clear session on sign out
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    session,
    user: session?.user ?? null,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
}