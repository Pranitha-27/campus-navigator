import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Screen from '../../components/Screen';
import { COLORS, SPACING } from '../../config';
import { getAllLocations, searchLocations, seedFirestoreSafely } from '../../services/navigationService';

export default function NavigationHomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
<<<<<<< HEAD
    // Seed Firestore safely (no duplicates) then load locations
=======
>>>>>>> 6391fe06a9906ac2a0d7ff969ca28e6be1a3ccb7
    const init = async () => {
      await seedFirestoreSafely();
      await loadAllLocations();
    };
    init();
  }, []);

  const removeDuplicates = (locations) => {
    const map = new Map();
    locations.forEach(l => {
      if (!map.has(l.id)) map.set(l.id, l);
    });
    return Array.from(map.values());
  };

  const loadAllLocations = async () => {
    setLoading(true);
    try {
      const response = await getAllLocations();
      if (response.success) {
        const uniqueResults = removeDuplicates(response.data);
        setResults(uniqueResults);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAllLocations();
      return;
    }
    setLoading(true);
    try {
      const response = await searchLocations(searchQuery);
      if (response.success) setResults(removeDuplicates(response.data));
    } catch (error) {
      Alert.alert('Search Error', error.message || 'Failed to search locations');
    } finally {
      setLoading(false);
    }
  };

  const getTypeEmoji = (type) => {
    const map = { lab: '🔬', room: '🚪', building: '🏢', landmark: '📍' };
    return map[type] || '📌';
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => navigation.navigate('LocationDetail', { location: item })}
    >
      <View style={styles.locationIcon}>
        <Text style={styles.locationIconText}>{getTypeEmoji(item.type)}</Text>
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationDetails}>
          {item.building} • Floor {item.floor}
          {item.roomNumber ? ` • Room ${item.roomNumber}` : ''}
        </Text>
        {item.tags?.length > 0 && (
          <Text style={styles.tags}>🏷️ {item.tags.slice(0, 2).join(', ')}</Text>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Navigate Campus</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search: Lab, IoT, AI, Floor 5..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      {!loading && results.length > 0 && (
        <Text style={styles.resultsCount}>{results.length} locations found</Text>
      )}

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      ) : (
        <FlatList
          // ✅ Filtering out duplicates by matching the first instance of each name
          data={results.filter((item, index, self) => 
            index === self.findIndex((t) => t.name === item.name)
          )}
          renderItem={renderLocationItem}
<<<<<<< HEAD
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyText}>No locations found</Text>
              <Text style={styles.emptySubText}>Try a different search term</Text>
            </View>
          }
=======
          // Firebase uses 'id' not '_id'
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          contentContainerStyle={styles.listContainer}
>>>>>>> aa2f81e0d91b418f69d8dc2cac50178c13cb758a
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  backButton: { marginBottom: SPACING.sm },
  backText: { fontSize: 18, color: COLORS.primary },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.black },

  // Search
  searchContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
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
  searchButtonText: { fontSize: 22 },
  resultsCount: {
    fontSize: 13,
    color: COLORS.gray,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },

  // List
  list: {
    flex: 1,                    // ← key fix for scroll
  },
  listContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    flexGrow: 1,               // ← key fix for web scroll
  },

  // Location card
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.lightGray,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  locationIconText: { fontSize: 22 },
  locationInfo: { flex: 1 },
  locationName: { fontSize: 16, fontWeight: '600', color: COLORS.black, marginBottom: 3 },
  locationDetails: { fontSize: 13, color: COLORS.gray, marginBottom: 2 },
  tags: { fontSize: 11, color: COLORS.primary, marginTop: 2 },
  arrow: { fontSize: 24, color: COLORS.gray },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: SPACING.md, fontSize: 16, color: COLORS.gray },
<<<<<<< HEAD
=======

  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.black, marginBottom: 6 },
  emptySubText: { fontSize: 14, color: COLORS.gray },
>>>>>>> 6391fe06a9906ac2a0d7ff969ca28e6be1a3ccb7
});