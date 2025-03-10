import { useEffect, useState } from 'react';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  useFrameworkReady();
  const { session, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Wait for the auth to initialize
      if (!loading) {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [loading]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!session ? (
          // If no session, route to auth screens
          <>
            <Stack.Screen name="auth" />
            <Stack.Screen name="index" redirect={true} />
            <Stack.Screen name="(tabs)" redirect={true} />
          </>
        ) : (
          // If session exists, route to app screens
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="index" redirect={true} />
            <Stack.Screen name="auth" redirect={true} />
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});