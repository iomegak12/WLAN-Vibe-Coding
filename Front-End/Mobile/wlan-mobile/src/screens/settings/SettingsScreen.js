/**
 * Settings Screen - App settings and preferences
 * Phase 2: Enhanced navigation structure
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Divider, useTheme, Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../../store/slices/authSlice';
import CustomHeader from '../../components/layout/CustomHeader';
import { SPACING } from '../../theme/theme';

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CustomHeader title="Settings" showIcons={false} />
      
      <ScrollView>
        {/* Account Section */}
        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Profile"
            description={user?.email}
            left={props => <List.Icon {...props} icon="account" />}
            onPress={() => navigation.navigate('Profile')}
          />
          <Divider />
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </List.Section>

        <Divider />

        {/* Preferences Section */}
        <List.Section>
          <List.Subheader>Preferences</List.Subheader>
          <List.Item
            title="Notifications"
            description="Enable push notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Dark Mode"
            description="Switch to dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* App Info Section */}
        <List.Section>
          <List.Subheader>App Information</List.Subheader>
          <List.Item
            title="Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="About"
            description="WLAN Warehouse Mobile"
            left={props => <List.Icon {...props} icon="information-outline" />}
          />
        </List.Section>

        <Divider />

        {/* Logout */}
        <List.Section>
          <List.Item
            title="Logout"
            description="Sign out of your account"
            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            titleStyle={{ color: theme.colors.error }}
            onPress={handleLogout}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
