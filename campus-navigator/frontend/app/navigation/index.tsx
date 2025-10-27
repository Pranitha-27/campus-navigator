import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import api from '../../src/services/api';

const COLORS = {
  primary: '#007AFF',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
  success: '#34C759',
  warning: '#FF9500',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface Location {
  _id: string;
  name: string;
  building: string;
  floor: number;
  roomNumber?: string;
  description: string;
  type: string;
  tags: string[];
}

export default function NavigationHomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Enter Search Query', 'Please enter a location name to search');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/navigation/search?query=${searchQuery}`);
      console.log('Search results:', response.data);

      if (response.data.success && response.data.data.length > 0) {
        setResults(response.data.data);
      } else {
        setResults([]);
        Alert.alert('No Results', 'No locations found. Try searching for "Kevin Ashton", "AIML", or "Cybersecurity"');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      Alert.alert(
        'Connection Error',
        'Could not connect to server. Make sure:\n1. Backend is running (npm run dev)\n2. Your phone and computer are on the same network'
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getFloorBadgeColor = (floor: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[floor % colors.length];
  };

  const renderLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.locationCard}
      onPress={() => {
        Alert.alert(
          item.name,
          `Building: ${item.building}\nFloor: ${item.floor}\n${item.roomNumber ? `Room: ${item.roomNumber}\n` : ''}${item.description}`,
          [
            { text: 'Close', style: 'cancel' },
            { 
              text: 'Get Directions', 
              onPress: () => Alert.alert('Coming Soon', 'Navigation directions will be available soon!')
            }
          ]
        );
      }}
    >
      <View style={styles.locationIcon}>
        <Text style={styles.locationIconText}>
          {item.type === 'room' ? '🚪' : item.type === 'landmark' ? '📍' : '🏢'}
        </Text>
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationDetails}>
          {item.building} • Floor {item.floor}
          {item.roomNumber && ` • Room ${item.roomNumber}`}
        </Text>
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.floorBadge, { backgroundColor: getFloorBadgeColor(item.floor) }]}>
        <Text style={styles.floorBadgeText}>F{item.floor}</Text>
      </View>
    </TouchableOpacity>
  );

  // Quick access buttons for 5th floor
  const quickSearchButtons = [
    { label: '5th Floor', query: 'floor 5' },
    { label: 'AIML Labs', query: 'AIML' },
    { label: 'IoT Labs', query: 'IoT' },
    { label: 'Data Science', query: 'Data Science' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Navigate Campus</Text>
        <Text style={styles.subtitle}>Search for any lab or location</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Try 'Kevin Ashton', 'Cybersecurity', 'AIML'..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Search Buttons */}
      <View style={styles.quickSearchContainer}>
        <Text style={styles.quickSearchLabel}>Quick Search:</Text>
        <View style={styles.quickSearchButtons}>
          {quickSearchButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickSearchButton}
              onPress={() => {
                setSearchQuery(button.query);
                handleSearch();
              }}
            >
              <Text style={styles.quickSearchButtonText}>{button.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <>
          <Text style={styles.resultsHeader}>
            Found {results.length} location{results.length > 1 ? 's' : ''}
          </Text>
          <FlatList
            data={results}
            renderItem={renderLocationItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      ) : searchQuery ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No locations found</Text>
          <Text style={styles.emptySubtext}>
            Try searching for:{'\n'}
            • Kevin Ashton Lab{'\n'}
            • John McCarthy Lab{'\n'}
            • Cybersecurity Lab{'\n'}
            • AIML Faculty Room
          </Text>
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyText}>Start Exploring</Text>
          <Text style={styles.emptySubtext}>
            Search for labs, rooms, or use quick search above
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
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
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
  quickSearchContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  quickSearchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  quickSearchButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickSearchButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  quickSearchButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  listContainer: {
    padding: SPACING.lg,
  },
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
    elevation: 3,
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
  locationIconText: {
    fontSize: 24,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  locationDetails: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  floorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  floorBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
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
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});