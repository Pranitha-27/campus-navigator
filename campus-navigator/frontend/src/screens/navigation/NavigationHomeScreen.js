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
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../config';
import { getAllLocations, searchLocations, seedFirestoreSafely } from '../../services/navigationService';

export default function NavigationHomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Seed safely first, then load locations
    const init = async () => {
      await seedFirestoreSafely(); // safe: no duplicates
      await loadAllLocations();
    };
    init();
  }, []);

  // Remove duplicates by ID just in case
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
        console.log(`✅ Loaded ${uniqueResults.length} unique locations`);
      }
    } catch (error) {
      console.error(error);
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
      if (response.success) {
        setResults(removeDuplicates(response.data));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Search Error', error.message || 'Failed to search locations');
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
        {item.tags?.length > 0 && (
          <Text style={styles.tags}>🏷️ {item.tags.slice(0, 2).join(', ')}</Text>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Navigate Campus</Text>
      </View>

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No locations found</Text>
          <TouchableOpacity style={styles.showAllButton} onPress={loadAllLocations}>
            <Text style={styles.showAllButtonText}>Show All Locations</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.lightGray },
  backButton: { marginBottom: SPACING.sm },
  backText: { fontSize: 18, color: COLORS.primary },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.black },
  searchContainer: { flexDirection: 'row', padding: SPACING.lg, gap: SPACING.sm },
  searchInput: { flex: 1, height: 50, backgroundColor: COLORS.lightGray, borderRadius: 12, paddingHorizontal: SPACING.md, fontSize: 16 },
  searchButton: { width: 50, height: 50, backgroundColor: COLORS.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  searchButtonText: { fontSize: 24 },
  listContainer: { padding: SPACING.lg },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md },
  locationIcon: { width: 50, height: 50, backgroundColor: COLORS.lightGray, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  locationIconText: { fontSize: 24 },
  locationInfo: { flex: 1 },
  locationName: { fontSize: 18, fontWeight: '600', color: COLORS.black, marginBottom: 4 },
  locationDetails: { fontSize: 14, color: COLORS.gray, marginBottom: 2 },
  tags: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
  arrow: { fontSize: 24, color: COLORS.gray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: SPACING.md, fontSize: 16, color: COLORS.gray },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.md },
  emptyText: { fontSize: 20, fontWeight: '600', color: COLORS.black, marginBottom: SPACING.sm },
  showAllButton: { marginTop: SPACING.lg, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: 8 },
  showAllButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 16 },
});