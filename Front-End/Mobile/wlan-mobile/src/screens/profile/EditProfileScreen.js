/**
 * Edit Profile Screen - Edit user profile information
 * Phase 2: Profile Management
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { updateProfile, selectUpdatingProfile } from '../../store/slices/profileSlice';
import { updateProfileSchema } from '../../validators/profileValidation';
import { SPACING } from '../../theme/theme';

export default function EditProfileScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const updating = useSelector(selectUpdatingProfile);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: yupResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const result = await dispatch(updateProfile(data));
    
    if (result.type.endsWith('/fulfilled')) {
      // Navigate back after successful update
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      // Could add a confirmation dialog here
      reset();
    }
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <IconButton
          icon="close"
          size={24}
          onPress={handleCancel}
          iconColor={theme.colors.onPrimaryContainer}
        />
        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}>
          Edit Profile
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
          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            Update your personal information below. Email cannot be changed.
          </Text>

          {/* First Name Input */}
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="First Name *"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.firstName}
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                disabled={updating}
              />
            )}
          />
          {errors.firstName && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.firstName.message}
            </Text>
          )}

          {/* Last Name Input */}
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Last Name *"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.lastName}
                left={<TextInput.Icon icon="account" />}
                style={styles.input}
                disabled={updating}
              />
            )}
          />
          {errors.lastName && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.lastName.message}
            </Text>
          )}

          {/* Email (Read-only) */}
          <TextInput
            label="Email"
            mode="outlined"
            value={user?.email || ''}
            editable={false}
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
            disabled
          />
          <Text variant="bodySmall" style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
            Email cannot be changed
          </Text>

          {/* Phone Input */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Phone"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.phone}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                style={styles.input}
                disabled={updating}
                placeholder="+1234567890"
              />
            )}
          />
          {errors.phone && (
            <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.phone.message}
            </Text>
          )}

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
            disabled={updating || !isDirty}
            loading={updating}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>

          {/* Cancel Button */}
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            disabled={updating}
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
  description: {
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
  helperText: {
    marginBottom: SPACING.MD,
    marginTop: -SPACING.XS,
    marginLeft: SPACING.SM,
  },
  saveButton: {
    marginTop: SPACING.XL,
    marginBottom: SPACING.SM,
  },
  cancelButton: {
    marginBottom: SPACING.MD,
  },
  buttonContent: {
    height: 50,
  },
});
