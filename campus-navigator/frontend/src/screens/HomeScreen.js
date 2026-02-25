import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../config';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Campus Navigator</Text>
        <Text style={styles.subtitle}>Navigate your campus with ease</Text>
      </View>

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
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('BookingHome')}
        >
          <Text style={styles.buttonIcon}>🍽️</Text>
          <Text style={styles.buttonTitle}>Book Seat</Text>
          <Text style={styles.buttonSubtitle}>
            Reserve tables in cafeteria or bakery
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for easier campus life
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  button: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.success,
  },
  tertiaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
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
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});