/**
 * Profile Screen - Display user profile information
 * Phase 2: Profile Management
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Platform } from 'react-native';
import {
  Text,
  Card,
  Button,
  Avatar,
  Divider,
  useTheme,
  ActivityIndicator,
  IconButton,
  Menu,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { 
  fetchProfile, 
  uploadImage,
  deleteImage,
  selectProfileLoading,
  selectUploadingImage
} from '../../store/slices/profileSlice';
import { SPACING } from '../../theme/theme';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectProfileLoading);
  const isUploading = useSelector(selectUploadingImage);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    // Fetch fresh profile data
    dispatch(fetchProfile());
  }, [dispatch]);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to upload profile images.'
          );
        }
      }
    })();
  }, []);

  const compressImage = async (imageUri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }], // Resize to max width of 800px
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Image compression error:', error);
      return imageUri; // Return original if compression fails
    }
  };

  const handlePickImage = async () => {
    setMenuVisible(false);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const compressedUri = await compressImage(result.assets[0].uri);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', {
          uri: Platform.OS === 'ios' ? compressedUri.replace('file://', '') : compressedUri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });

        dispatch(uploadImage(formData));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const handleTakePhoto = async () => {
    setMenuVisible(false);
    
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const compressedUri = await compressImage(result.assets[0].uri);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', {
          uri: Platform.OS === 'ios' ? compressedUri.replace('file://', '') : compressedUri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });

        dispatch(uploadImage(formData));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Camera error:', error);
    }
  };

  const handleDeleteImage = () => {
    setMenuVisible(false);
    
    Alert.alert(
      'Delete Profile Image',
      'Are you sure you want to delete your profile image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteImage()),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'N/A';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor={theme.colors.onPrimaryContainer}
        />
        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}>
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Image and Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <Avatar.Text
                size={120}
                label={getInitials()}
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
            
            {/* Image Menu */}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="camera"
                  size={24}
                  mode="contained"
                  containerColor={theme.colors.primary}
                  iconColor={theme.colors.onPrimary}
                  style={styles.cameraButton}
                  onPress={() => setMenuVisible(true)}
                  disabled={isUploading}
                />
              }
              anchorPosition="bottom"
            >
              <Menu.Item
                onPress={handleTakePhoto}
                title="Take Photo"
                leadingIcon="camera"
              />
              <Menu.Item
                onPress={handlePickImage}
                title="Choose from Gallery"
                leadingIcon="image"
              />
              {user?.profileImage && (
                <>
                  <Divider />
                  <Menu.Item
                    onPress={handleDeleteImage}
                    title="Delete Photo"
                    leadingIcon="delete"
                    titleStyle={{ color: theme.colors.error }}
                  />
                </>
              )}
            </Menu>

            {/* Upload Progress */}
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
          </View>

          <Text variant="headlineMedium" style={[styles.name, { color: theme.colors.onSurface }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            {user?.email}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.actionButton}
          >
            Edit Profile
          </Button>
          <Button
            mode="outlined"
            icon="lock-reset"
            onPress={() => navigation.navigate('ChangePassword')}
            style={styles.actionButton}
          >
            Change Password
          </Button>
        </View>

        {/* Personal Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: SPACING.MD }}>
              Personal Information
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                First Name
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {user?.firstName || 'N/A'}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Last Name
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {user?.lastName || 'N/A'}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Email
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {user?.email || 'N/A'}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Phone
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {user?.phone || 'Not provided'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Role Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: SPACING.MD }}>
              Role & Permissions
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Role
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.primary,
                  fontWeight: 'bold',
                }}
              >
                {user?.role?.name || 'N/A'}
              </Text>
            </View>

            {user?.role?.permissions && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.permissionsContainer}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: SPACING.SM }}>
                    Permissions
                  </Text>
                  <View style={styles.permissionsList}>
                    {user.role.permissions.map((permission, index) => (
                      <View
                        key={index}
                        style={[
                          styles.permissionChip,
                          { backgroundColor: theme.colors.secondaryContainer },
                        ]}
                      >
                        <Text
                          variant="bodySmall"
                          style={{ color: theme.colors.onSecondaryContainer }}
                        >
                          {permission}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={{ marginBottom: SPACING.MD }}>
              Account Information
            </Text>

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Status
              </Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: user?.isActive
                        ? theme.colors.tertiary
                        : theme.colors.error,
                    },
                  ]}
                />
                <Text
                  variant="bodyMedium"
                  style={{
                    color: user?.isActive
                      ? theme.colors.tertiary
                      : theme.colors.error,
                  }}
                >
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Last Login
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {formatDate(user?.lastLogin)}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.MD,
    elevation: 2,
  },
  scrollContent: {
    padding: SPACING.MD,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.XL,
    marginTop: SPACING.MD,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.MD,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    elevation: 4,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
    marginTop: SPACING.MD,
    marginBottom: SPACING.XS,
  },
  actionButtons: {
    marginBottom: SPACING.MD,
    gap: SPACING.SM,
  },
  actionButton: {
    marginBottom: SPACING.XS,
  },
  card: {
    marginBottom: SPACING.MD,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
  },
  divider: {
    marginVertical: SPACING.XS,
  },
  permissionsContainer: {
    paddingTop: SPACING.SM,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.XS,
  },
  permissionChip: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
