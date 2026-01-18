/**
 * Profile Validation Schemas
 * Yup schemas for profile and password forms
 * Phase 2: Profile Management
 */

import * as yup from 'yup';

/**
 * Update profile validation schema
 */
export const updateProfileSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .required('First name is required')
    .trim(),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .required('Last name is required')
    .trim(),
  phone: yup
    .string()
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number (e.g., +1234567890)'
    )
    .nullable(),
});

/**
 * Change password validation schema
 */
export const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your password'),
});

export default {
  updateProfileSchema,
  changePasswordSchema,
};
