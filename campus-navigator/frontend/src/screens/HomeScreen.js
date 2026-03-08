import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Screen from '../components/Screen';
import { COLORS, SPACING } from '../config';

export default function HomeScreen({ navigation }) {
  return (
    <Screen style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Campus Navigator</Text>
          <Text style={styles.subtitle}>Navigate your campus with ease</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('NavigationHome')}
          >
            <Text style={styles.buttonIcon}>🗺️</Text>
            <Text style={styles.buttonTitle}>Navigate Campus</Text>
            <Text style={styles.buttonSubtitle}>
              Find labs, rooms, and locations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.mapButton]}
            onPress={() => navigation.navigate('BuildingMap')}
          >
            <Text style={styles.buttonIcon}>🏢</Text>
            <Text style={styles.buttonTitle}>Building Map</Text>
            <Text style={styles.buttonSubtitle}>
              View floor plans for all floors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.qrButton]}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.buttonTitle}>Scan QR Code</Text>
            <Text style={styles.buttonSubtitle}>
              Scan a room QR code to navigate instantly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={() => alert('Coming soon!')}
          >
            <Text style={styles.buttonIcon}>⭐</Text>
            <Text style={styles.buttonTitle}>My Favorites</Text>
            <Text style={styles.buttonSubtitle}>
              Quick access to saved locations
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for easier campus life
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    flex: 1,                  // ✅ key fix
  },
  scrollContent: {
    flexGrow: 1,              // ✅ key fix for web
    paddingBottom: 24,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  buttonsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  button: {
    padding: SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton:  { backgroundColor: COLORS.primary },
  mapButton:      { backgroundColor: '#059669' },
  qrButton:       { backgroundColor: '#1C1C1E' },
  tertiaryButton: { backgroundColor: COLORS.secondary },
  buttonIcon:     { fontSize: 40, marginBottom: SPACING.sm },
  buttonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});