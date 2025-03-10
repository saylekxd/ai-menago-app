import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Database } from '@/types/supabase';

// Get the Supabase URL and anon key directly from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// If direct access fails, try through Constants
if (!supabaseUrl || !supabaseAnonKey) {
  const extraSupabaseUrl = Constants.expoConfig?.extra?.SUPABASE_URL;
  const extraSupabaseAnonKey = Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;
  
  if (extraSupabaseUrl && extraSupabaseAnonKey) {
    console.log('Using Supabase credentials from Constants.expoConfig.extra');
  } else {
    console.error('Supabase URL and Anon Key are required! Check your environment variables.');
    console.log('Configuration:', {
      directEnv: { supabaseUrl, supabaseAnonKey },
      fromConstants: { supabaseUrl: extraSupabaseUrl, supabaseAnonKey: extraSupabaseAnonKey }
    });
  }
}

// SecureStore is not available on web, so we need to use localStorage instead
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Use hardcoded values in development if environment variables are not available
const finalSupabaseUrl = supabaseUrl || 'https://bbxsssdbptcuitnjkrfi.supabase.co';
const finalSupabaseAnonKey = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJieHNzc2RicHRjdWl0bmprcmZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzcwNjcsImV4cCI6MjA1NzIxMzA2N30.LyAJp-U4A85_pmM7YUQPrhdHftxatOCRkZlk0HuhKGE';

// Create Supabase client
export const supabase = createClient<Database>(finalSupabaseUrl, finalSupabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    detectSessionInUrl: false,
  },
});