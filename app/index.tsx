import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { session, loading } = useAuth();
  
  // Show nothing during initial load to prevent flash
  if (loading) {
    return null;
  }
  
  // Always redirect to login if not authenticated
  if (!session) {
    return <Redirect href="/auth/login" />;
  }
  
  // Redirect to tabs if authenticated
  return <Redirect href="/(tabs)" />;
}