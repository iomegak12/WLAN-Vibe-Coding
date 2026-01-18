/**
 * Change Password Screen - Change user password
 * Phase 2: Profile Management
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  IconButton,
  Card,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { logoutUser } from '../../store/slices/authSlice';
import { changePassword, selectChangingPassword } from '../../store/slices/profileSlice';
import { changePasswordSchema } from '../../validators/authValidation';
import { SPACING } from '../../theme/theme';

export default function ChangePasswordScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const changing = useSelector(selectChangingPassword);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    const result = await dispatch(
      changePassword({
        userId: user.id,
        passwordData: data,
      })
    );

    if (result.type.endsWith('/fulfilled')) {
      // Password changed successfully, logout user
      setTimeout(() => {
        dispatch(logoutUser());
      }, 2000);
    }
  };

  const handleCancel = () => {
    reset();
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleCancel}
          iconColor={theme.colors.onPrimaryContainer}
        />
        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}>
          Change Password
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <Card style={styles.infoCard} mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                ⚠️ After changing your password, you will be logged out and need to sign in again with your new password.
              </Text>
            </Card.Content>
          </Card>

          {/* Current Password Input */}
          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Current Password *"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.currentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showCurrentPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                }
                style={styles.input}
                disabled={changing}
              />
            )}
          />
          {errors.currentPassword && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.currentPassword.message}
            </Text>
          )}

          {/* New Password Input */}
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="New Password *"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.newPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock-reset" />}
                right={
                  <TextInput.Icon
                    icon={showNewPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                }
                style={styles.input}
                disabled={changing}
              />
            )}
          />
          {errors.newPassword && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.newPassword.message}
            </Text>
          )}

          {/* Confirm Password Input */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm New Password *"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                left={<TextInput.Icon icon="lock-check" />}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                disabled={changing}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.confirmPassword.message}
            </Text>
          )}

          {/* Password Requirements */}
          <Card style={styles.requirementsCard} mode="outlined">
            <Card.Content>
              <Text variant="titleSmall" style={{ marginBottom: SPACING.SM }}>
                Password Requirements:
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                • At least 8 characters long{'\n'}
                • Contains at least one uppercase letter{'\n'}
                • Contains at least one lowercase letter{'\n'}
                • Contains at least one number
              </Text>
            </Card.Content>
          </Card>

          {/* Change Password Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.changeButton}
            contentStyle={styles.buttonContent}
            disabled={changing}
            loading={changing}
          >
            {changing ? 'Changing Password...' : 'Change Password'}
          </Button>

          {/* Cancel Button */}
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            disabled={changing}
          >
            Cancel
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.MD,
    elevation: 2,
  },
  scrollContent: {
    padding: SPACING.XL,
  },
  infoCard: {
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
  requirementsCard: {
    marginTop: SPACING.MD,
    marginBottom: SPACING.XL,
  },
  changeButton: {
    marginBottom: SPACING.SM,
  },
  cancelButton: {
    marginBottom: SPACING.MD,
  },
  buttonContent: {
    height: 50,
  },
});
