import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
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
          <Stack.Screen 
            name="auth" 
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <Stack.Screen 
            name="(tabs)" 
            options={{
              headerShown: false,
            }}
          />
        )}
        
        <Stack.Screen 
          name="index" 
          options={{
            headerShown: false,
          }}
          redirect={!session ? true : undefined} 
        />
        
        <Stack.Screen 
          name="+not-found" 
          options={{
            headerShown: false,
          }}
        />
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