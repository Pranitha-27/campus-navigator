import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../../config';
import { searchLocations, seedFirestore } from '../../services/navigationService';

export default function NavigationHomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ⚠️ TEMPORARY — remove after seeing "✅ Seeded 19 locations" in terminal
  useEffect(() => {
    seedFirestore();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await searchLocations(searchQuery);
      setResults(response.data || []);
    } catch (error) {
      alert('Error searching locations. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => navigation.navigate('LocationDetail', { location: item })}
    >
      <View style={styles.locationIcon}>
        <Text style={styles.locationIconText}>📍</Text>
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationDetails}>
          {item.building} • Floor {item.floor}
          {item.roomNumber ? ` • Room ${item.roomNumber}` : ''}
        </Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderLocationItem}
          // ✅ Firebase uses 'id' not '_id'
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : searchQuery && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No locations found</Text>
          <Text style={styles.emptySubtext}>
            Try searching for "Lab", "IoT", or "Cafeteria"
          </Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
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
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: { marginBottom: SPACING.sm },
  backText: { fontSize: 18, color: COLORS.primary },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.black },
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
  searchButtonText: { fontSize: 24 },
  listContainer: { padding: SPACING.lg },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  locationIcon: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.lightGray,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  locationIconText: { fontSize: 24 },
  locationInfo: { flex: 1 },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  locationDetails: { fontSize: 14, color: COLORS.gray },
  arrow: { fontSize: 24, color: COLORS.gray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: SPACING.md, fontSize: 16, color: COLORS.gray },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.md },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  emptySubtext: { fontSize: 16, color: COLORS.gray, textAlign: 'center' },
});