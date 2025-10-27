import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../src/services/api';

const COLORS = {
  primary: '#007AFF',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
};

const SPACING = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function Floor5Screen() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFloor5Locations();
  }, []);

  const loadFloor5Locations = async () => {
    try {
      const response = await api.get('/navigation/locations?building=BSN Block&floor=5');
      if (response.data.success) {
        setLocations(response.data.data);
      }
    } catch (error) {
      console.error('Error loading 5th floor:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLocation = ({ item }: any) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      {item.roomNumber && (
        <Text style={styles.cardSubtitle}>Room {item.roomNumber}</Text>
      )}
      <Text style={styles.cardDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>5th Floor - BSN Block</Text>
        <Text style={styles.subtitle}>{locations.length} locations</Text>
      </View>

      <FlatList
        data={locations}
        renderItem={renderLocation}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.list}
      />
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
  backText: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  list: {
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.gray,
  },
});