import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { AtSign, Lock, User, Building, CircleAlert as AlertCircle, CircleHelp as HelpCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

// Regex pattern for UUID validation
// Format: 8-4-4-4-12 hexadecimal characters
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessId, setBusinessId] = useState('');
  const [businessIdError, setBusinessIdError] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [role, setRole] = useState('worker');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signUp, loading } = useAuth();
  const router = useRouter();

  // Validate business ID format and existence
  const validateBusinessId = async (id: string) => {
    if (!id) {
      setBusinessIdError('Business ID is required');
      setBusinessName(null);
      return false;
    }
    
    if (!UUID_PATTERN.test(id)) {
      setBusinessIdError('Invalid UUID format. Example: 123e4567-e89b-12d3-a456-426614174000');
      setBusinessName(null);
      return false;
    }
    
    // Check if business exists
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        setBusinessIdError('Business ID not found. Please check with your administrator.');
        setBusinessName(null);
        return false;
      }
      
      // Business found, show the name
      setBusinessName(data.name);
      setBusinessIdError(null);
      return true;
    } catch (err) {
      setBusinessIdError('Error validating business ID');
      setBusinessName(null);
      return false;
    }
  };

  // Update business ID with validation
  const handleBusinessIdChange = (text: string) => {
    setBusinessId(text);
    // Clear error when typing
    if (businessIdError) {
      setBusinessIdError(null);
    }
    
    // Clear business name when changing ID
    if (businessName) {
      setBusinessName(null);
    }
  };
  
  // Validate business ID when field loses focus
  const handleBusinessIdBlur = () => {
    if (businessId) {
      validateBusinessId(businessId);
    }
  };

  const handleRegister = async () => {
    // Reset error messages
    setErrorMessage(null);

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      setErrorMessage('Please fill all required fields');
      return;
    }

    // Validate business ID format and existence
    const isBusinessValid = await validateBusinessId(businessId);
    if (!isBusinessValid) {
      return;
    }

    try {
      const { error } = await signUp(email, password, firstName, lastName, role, businessId);
      
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      
      // On successful registration, show success alert and navigate to login
      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully. Please login with your credentials.",
        [{ text: "OK", onPress: () => router.replace('/auth/login') }]
      );
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>
        
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        
        <View style={styles.formContainer}>
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <User size={20} color="#757575" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            
            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <AtSign size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Lock size={20} color="#757575" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <View style={styles.businessIdContainer}>
            <View style={[
              styles.inputContainer, 
              businessIdError ? styles.inputError : null,
              businessName ? styles.inputSuccess : null
            ]}>
              <Building size={20} 
                color={businessIdError ? "#F44336" : businessName ? "#4CAF50" : "#757575"} 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Business ID (UUID format)"
                value={businessId}
                onChangeText={handleBusinessIdChange}
                onBlur={handleBusinessIdBlur}
              />
              {businessName && (
                <View style={styles.businessBadge}>
                  <Text style={styles.businessBadgeText}>{businessName}</Text>
                </View>
              )}
            </View>
            
            {businessIdError && (
              <View style={styles.fieldErrorContainer}>
                <AlertCircle size={16} color="#F44336" />
                <Text style={styles.fieldErrorText}>{businessIdError}</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.businessIdHelpContainer}>
              <HelpCircle size={14} color="#757575" />
              <Text style={styles.businessIdHint}>
                Enter the Business UUID provided by your administrator
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleOptions}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'worker' && styles.roleOptionSelected
                ]}
                onPress={() => setRole('worker')}
              >
                <Text style={[
                  styles.roleOptionText,
                  role === 'worker' && styles.roleOptionTextSelected
                ]}>
                  Worker
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'manager' && styles.roleOptionSelected
                ]}
                onPress={() => setRole('manager')}
              >
                <Text style={[
                  styles.roleOptionText,
                  role === 'manager' && styles.roleOptionTextSelected
                ]}>
                  Manager
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
  },
  formContainer: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    height: 50,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  inputSuccess: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  fieldErrorText: {
    color: '#F44336',
    fontSize: 12,
    marginLeft: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  businessIdContainer: {
    marginBottom: 16,
  },
  businessIdHelpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  businessIdHint: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  businessBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  businessBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleContainer: {
    marginBottom: 24,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roleOptions: {
    flexDirection: 'row',
  },
  roleOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  roleOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  roleOptionText: {
    color: '#757575',
  },
  roleOptionTextSelected: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#757575',
    fontSize: 14,
  },
  loginLink: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
  },
});