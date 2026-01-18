/**
 * Onboarding Screen
 * 3-page introduction for first-time users
 */

import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setOnboardingCompleted } from '../../store/slices/appSlice';
import { SPACING } from '../../theme/theme';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    icon: '📦',
    title: 'Welcome to WLAN Warehouse',
    description:
      'Your all-in-one mobile solution for warehouse product management. Scan, search, and manage your inventory with ease, right from your Android device.',
    features: [
      'Fast product scanning',
      'Real-time inventory updates',
      'Offline-capable operations',
    ],
  },
  {
    id: 2,
    icon: '📱',
    title: 'Scan with Speed',
    description:
      'Use your camera to instantly scan QR codes and barcodes. Get product details in milliseconds and work faster than ever before.',
    features: [
      'QR & barcode support',
      'Instant product lookup',
      'Warehouse-optimized UI',
    ],
  },
  {
    id: 3,
    icon: '✨',
    title: 'Manage with Confidence',
    description:
      'Create, update, and track products on the go. Your complete product management system fits in your pocket.',
    features: [
      'Create new products',
      'Update product details',
      'Track inventory levels',
    ],
  },
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / width);
    setCurrentPage(page);
  };

  const scrollToPage = (page) => {
    scrollViewRef.current?.scrollTo({
      x: page * width,
      animated: true,
    });
    setCurrentPage(page);
  };

  const handleGetStarted = () => {
    dispatch(setOnboardingCompleted(true));
  };

  const handleSkip = () => {
    dispatch(setOnboardingCompleted(true));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={[styles.skipText, { color: theme.colors.primary }]}>Skip</Text>
      </TouchableOpacity>

      {/* Scrollable Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {ONBOARDING_DATA.map((item) => (
          <View key={item.id} style={[styles.page, { width }]}>
            {/* Icon */}
            <Text style={styles.icon}>{item.icon}</Text>

            {/* Title */}
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {item.title}
            </Text>

            {/* Description */}
            <Text
              variant="bodyLarge"
              style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.description}
            </Text>

            {/* Features */}
            <View style={styles.featuresContainer}>
              {item.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={[styles.checkmark, { color: theme.colors.primary }]}>
                    ✓
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={[styles.feature, { color: theme.colors.onSurface }]}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentPage
                    ? theme.colors.primary
                    : theme.colors.outlineVariant,
                width: index === currentPage ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {currentPage < ONBOARDING_DATA.length - 1 ? (
          <Button
            mode="contained"
            onPress={() => scrollToPage(currentPage + 1)}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleGetStarted}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 40,
    right: SPACING.MD,
    zIndex: 10,
    padding: SPACING.SM,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
    paddingTop: 80,
  },
  icon: {
    fontSize: 120,
    marginBottom: SPACING.XL,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.MD,
  },
  description: {
    textAlign: 'center',
    marginBottom: SPACING.XL,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginTop: SPACING.MD,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: SPACING.SM,
  },
  feature: {
    flex: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.LG,
    gap: SPACING.SM,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.XL,
    paddingBottom: SPACING.XL,
  },
  button: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: SPACING.SM,
  },
});
