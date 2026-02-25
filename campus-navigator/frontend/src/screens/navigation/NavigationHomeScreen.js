// NavigationHomeScreen.js - UPDATED

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
  Alert,
} from 'react-native';
import { COLORS, SPACING } from '../../config';
import { searchLocations, getAllLocations } from '../../services/navigationService';

export default function NavigationHomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ✅ Load all locations on screen mount
  useEffect(() => {
    loadAllLocations();
  }, []);

  const loadAllLocations = async () => {
    setLoading(true);
    try {
      console.log('📊 Loading all locations...');
      const response = await getAllLocations();
      console.log('📊 All locations response:', response);
      
      if (response.success) {
        setResults(response.data || []);
        console.log(`✅ Loaded ${response.data?.length || 0} locations`);
        
        // Log first few location names for debugging
        response.data?.slice(0, 3).forEach(loc => {
          console.log('  -', loc.name);
        });
      }
    } catch (error) {
      console.error('❌ Load all error:', error);
      Alert.alert('Error', 'Failed to load locations: ' + error.message);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Empty search = show all
      loadAllLocations();
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Searching for:', searchQuery);
      const response = await searchLocations(searchQuery);
      
      console.log('📊 Search response:', response);
      console.log('📊 Results count:', response?.data?.length);
      
      if (response.success) {
        setResults(response.data || []);
        if (response.data?.length === 0) {
          console.log('⚠️ No results found. Try: "Lab", "IoT", "AI", "Floor", "Kevin"');
        }
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      Alert.alert('Search Error', error.message || 'Failed to search locations');
      setResults([]);
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
        {item.tags && item.tags.length > 0 && (
          <Text style={styles.tags}>🏷️ {item.tags.slice(0, 2).join(', ')}</Text>
        )}
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
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {results.length} location{results.length !== 1 ? 's' : ''} found
            </Text>
            {searchQuery.trim() === '' && (
              <Text style={styles.showingAll}>Showing all</Text>
            )}
          </View>
          <FlatList
            data={results}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      ) : !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No locations found</Text>
          <Text style={styles.emptySubtext}>
            Try searching for:{"\n"}"Lab", "IoT", "AI", "Floor", "Kevin", "501"
          </Text>
          <TouchableOpacity style={styles.showAllButton} onPress={loadAllLocations}>
            <Text style={styles.showAllButtonText}>Show All Locations</Text>
          </TouchableOpacity>
        </View>
      ) : null}
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
  resultsHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  showingAll: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
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
  locationDetails: { fontSize: 14, color: COLORS.gray, marginBottom: 2 },
  tags: { fontSize: 12, color: COLORS.primary, marginTop: 2 },
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
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  showAllButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  showAllButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
  },
});