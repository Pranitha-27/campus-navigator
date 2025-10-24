import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#007AFF',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export default function NavigationHomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Search will be connected to backend soon!');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Navigate Campus</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for labs, rooms, or locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyText}>Start searching</Text>
          <Text style={styles.emptySubtext}>
            Search for any lab or location on campus
          </Text>
        </View>
      )}
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
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.gray,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});