/**
 * Login Screen - User Authentication
 * Phase 1: Complete implementation with form validation
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Checkbox, useTheme, ActivityIndicator, IconButton, Tooltip } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthLoading, selectAuthError, clearError } from '../../store/slices/authSlice';
import { loginSchema } from '../../validators/authValidation';
import { SPACING } from '../../theme/theme';

// Demo credentials
const DEMO_CREDENTIALS = {
  email: 'jtdhamodharan@gmail.com',
  password: 'Prestige123!',
};

export default function LoginScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    dispatch(loginUser({
      email: data.email,
      password: data.password,
      rememberMe,
    }));
  };

  const loadDemoCredentials = () => {
    setValue('email', DEMO_CREDENTIALS.email);
    setValue('password', DEMO_CREDENTIALS.password);
    setRememberMe(true);
  };

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.logo}>
            🏭
          </Text>
          <Text variant="headlineLarge" style={[styles.appName, { color: theme.colors.primary }]}>
            WLAN Warehouse
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Sign in to continue
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
                disabled={loading}
              />
            )}
          />
          {errors.email && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.email.message}
            </Text>
          )}

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.password}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                disabled={loading}
              />
            )}
          />
          {errors.password && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.password.message}
            </Text>
          )}

          {/* Remember Me Checkbox */}
          <View style={styles.rememberMeContainer}>
            <Checkbox
              status={rememberMe ? 'checked' : 'unchecked'}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={loading}
            />
            <Text
              variant="bodyMedium"
              style={styles.rememberMeText}
              onPress={() => setRememberMe(!rememberMe)}
            >
              Remember me
            </Text>
          </View>

          {/* Login Buttons Row */}
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <Tooltip title="Load Demo Credentials">
              <IconButton
                icon="account-key"
                mode="contained"
                size={24}
                onPress={loadDemoCredentials}
                disabled={loading}
                style={styles.demoButton}
                containerColor={theme.colors.secondaryContainer}
                iconColor={theme.colors.onSecondaryContainer}
              />
            </Tooltip>
          </View>

          {/* Error Message */}
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>
                {error}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            WLAN Corporation © 2026
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.XL,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.XXL,
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.MD,
  },
  appName: {
    fontWeight: 'bold',
    marginBottom: SPACING.SM,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginBottom: SPACING.XL,
  },
  input: {
    marginBottom: SPACING.XS,
  },
  errorText: {
    marginBottom: SPACING.MD,
    marginTop: -SPACING.XS,
    marginLeft: SPACING.SM,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.MD,
  },
  rememberMeText: {
    marginLeft: SPACING.XS,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginTop: SPACING.MD,
  },
  loginButton: {
    flex: 1,
  },
  loginButtonContent: {
    height: 50,
  },
  demoButton: {
    height: 50,
  },
  errorContainer: {
    marginTop: SPACING.MD,
    padding: SPACING.MD,
    borderRadius: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.XL,
  },
});
