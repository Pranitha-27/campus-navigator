import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../config';

export default function BookingHomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Book a Seat</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>🍽️</Text>
        <Text style={styles.comingSoon}>Coming Soon!</Text>
        <Text style={styles.description}>
          Seat booking feature will be available soon.
          You'll be able to book tables in cafeteria and bakery.
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    marginBottom: SPACING.sm,
  },
  backText: {
    fontSize: 18,
    color: COLORS.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
});