import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Platform, StatusBar,
  Animated, ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { searchLocations, getAllLocations } from '../../services/navigationService';

// ─── Type config ─────────────────────────────────────────────────────────────
const TYPE_COLOR = {
  lab: '#00C6FF', library: '#4ECDC4', cafeteria: '#FFE66D',
  office: '#A8E6CF', classroom: '#C5A3FF', corridor: '#667',
  landmark: '#FF6B6B', room: '#A8E6CF', default: '#00C6FF',
};
const TYPE_ICON = {
  lab: 'flask', library: 'book', cafeteria: 'utensils',
  office: 'briefcase', classroom: 'chalkboard-teacher',
  landmark: 'map-marker-alt', room: 'door-open', default: 'map-marker-alt',
};
const TYPE_EMOJI = {
  lab: '🔬', library: '📚', cafeteria: '🍽️',
  office: '🏢', classroom: '🎓', landmark: '📍',
  room: '🚪', default: '📌',
};

// ─── Real campus locations (always shown even if API is down) ────────────────
const CAMPUS_LOCATIONS = [
  // Floor 1
  { id: 'bot-lab',       name: 'BOT Lab',                      type: 'lab',       building: 'BSN Block', floor: 1, roomNumber: 'TR 101', tags: ['lab', 'bot', 'robotics'],    isAccessible: true  },
  { id: 'iot-lab-1',     name: 'IoT Lab',                      type: 'lab',       building: 'BSN Block', floor: 1, roomNumber: 'TR 102', tags: ['lab', 'iot'],                isAccessible: true  },
  // Floor 2
  { id: 'von-neumann',   name: 'Von Neumann Lab',               type: 'lab',       building: 'BSN Block', floor: 2, roomNumber: 'TR 201', tags: ['lab', 'computers'],          isAccessible: true  },
  { id: 'cs-lab',        name: 'CS Lab',                        type: 'lab',       building: 'BSN Block', floor: 2, roomNumber: 'TR 202', tags: ['lab', 'cs'],                 isAccessible: true  },
  // Floor 5
  { id: 'kevin-ashton',  name: 'Kevin Ashton IoT Lab',          type: 'lab',       building: 'BSN Block', floor: 5, roomNumber: 'TR 501', tags: ['lab', 'iot', 'aiml'],        isAccessible: true  },
  { id: 'sahyadri-ai',   name: 'Sahyadri AI Computing Lab',     type: 'lab',       building: 'BSN Block', floor: 5, roomNumber: 'TR 507', tags: ['lab', 'ai', 'aiml'],         isAccessible: true  },
  { id: 'john-mccarthy', name: 'John McCarthy Lab',             type: 'lab',       building: 'BSN Block', floor: 5, roomNumber: 'TR 506', tags: ['lab', 'ai', 'ml'],           isAccessible: true  },
  { id: 'aiml-board',    name: 'AIML Board Room',               type: 'room',      building: 'BSN Block', floor: 5, roomNumber: 'TR 505', tags: ['board', 'meeting', 'aiml'],  isAccessible: true  },
  { id: 'aiml-faculty',  name: 'AIML Faculty Room',             type: 'room',      building: 'BSN Block', floor: 5, roomNumber: 'TR 504', tags: ['faculty', 'aiml'],           isAccessible: true  },
  { id: 'staff-room',    name: 'Staff Room',                    type: 'office',    building: 'BSN Block', floor: 5, roomNumber: 'TR 503', tags: ['staff', 'office'],           isAccessible: true  },
  { id: 'cybersec-lab',  name: 'MTech Cybersecurity Research Lab', type: 'lab',    building: 'BSN Block', floor: 5, roomNumber: 'TR 502', tags: ['lab', 'cybersecurity', 'mtech'], isAccessible: true },
  { id: 'peter-naur',    name: 'Peter Naur Data Science Lab',   type: 'lab',       building: 'BSN Block', floor: 5, roomNumber: 'TR 503', tags: ['lab', 'data', 'science'],    isAccessible: true  },
  // Other
  { id: 'cafeteria',     name: 'Cafeteria',                     type: 'cafeteria', building: 'BSN Block', floor: 0, roomNumber: null,      tags: ['food', 'cafe'],              isAccessible: true  },
  { id: 'library',       name: 'Library',                       type: 'library',   building: 'BSN Block', floor: 0, roomNumber: null,      tags: ['books', 'study'],            isAccessible: true  },
];

// ─── Category filter tabs ────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All',       value: null,        icon: 'apps'      },
  { label: 'Labs',      value: 'lab',       icon: 'flask'     },
  { label: 'Rooms',     value: 'room',      icon: 'business'  },
  { label: 'Offices',   value: 'office',    icon: 'briefcase' },
  { label: 'Library',   value: 'library',   icon: 'library'   },
  { label: 'Cafeteria', value: 'cafeteria', icon: 'restaurant'},
];

// ─── Floor filter ────────────────────────────────────────────────────────────
const FLOORS = [
  { label: 'All',   value: null },
  { label: 'G',     value: 0    },
  { label: 'F 1',   value: 1    },
  { label: 'F 2',   value: 2    },
  { label: 'F 3',   value: 3    },
  { label: 'F 5',   value: 5    },
];

// ─── Single Location Card ─────────────────────────────────────────────────────
const LocationCard = ({ item, onNavigate, onDetails, index }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 320, delay: index * 50, useNativeDriver: true }).start();
  }, []);

  const color = TYPE_COLOR[item.type] || TYPE_COLOR.default;
  const icon  = TYPE_ICON[item.type]  || TYPE_ICON.default;
  const emoji = TYPE_EMOJI[item.type] || TYPE_EMOJI.default;

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
    }}>
      <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
        {/* Left icon */}
        <View style={[styles.cardIcon, { backgroundColor: color + '18' }]}>
          <Text style={styles.cardEmoji}>{emoji}</Text>
        </View>

        {/* Info */}
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardMeta}>
            {item.building}
            {item.floor !== undefined && item.floor !== null
              ? ` · ${item.floor === 0 ? 'Ground' : `Floor ${item.floor}`}`
              : ''}
            {item.roomNumber ? ` · ${item.roomNumber}` : ''}
          </Text>
          {item.tags?.length > 0 && (
            <View style={styles.tagRow}>
              {item.tags.slice(0, 3).map((t, i) => (
                <View key={i} style={[styles.tag, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.tagText, { color }]}>#{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: color }]}
            onPress={() => onNavigate(item)}
          >
            <Ionicons name="navigate" size={14} color="#0A0E1A" />
            <Text style={styles.navBtnText}>Go</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailBtn} onPress={() => onDetails(item)}>
            <Ionicons name="information-circle-outline" size={20} color="#445" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function NavigationHomeScreen({ navigation }) {
  const [query,          setQuery]          = useState('');
  const [locations,      setLocations]      = useState(CAMPUS_LOCATIONS);
  const [filtered,       setFiltered]       = useState(CAMPUS_LOCATIONS);
  const [loading,        setLoading]        = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeFloor,    setActiveFloor]    = useState(null);

  // Try to load from API but always fall back to campus data
  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    applyFilters(query, activeCategory, activeFloor);
  }, [query, activeCategory, activeFloor, locations]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await getAllLocations();
      if (Array.isArray(data) && data.length > 0) setLocations(data);
    } catch {
      // Keep campus data
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setQuery(text);
  };

  const applyFilters = (q, cat, floor) => {
    let result = locations;
    if (cat   !== null && cat   !== undefined) result = result.filter(l => l.type  === cat);
    if (floor !== null && floor !== undefined) result = result.filter(l => l.floor === floor);
    if (q.trim()) {
      const lower = q.toLowerCase();
      result = result.filter(l =>
        l.name?.toLowerCase().includes(lower) ||
        l.building?.toLowerCase().includes(lower) ||
        l.roomNumber?.toLowerCase().includes(lower) ||
        l.tags?.some(t => t.toLowerCase().includes(lower))
      );
    }
    setFiltered(result);
  };

  const handleNavigate = (location) => {
    navigation.navigate('TurnByTurn', {
      destination: location.name,
      startLocation: 'Current Location',
    });
  };

  const handleDetails = (location) => {
    navigation.navigate('LocationDetail', { location });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0A0E1A', '#0F172A']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Location</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CrowdHeatmap')} style={styles.heatmapBtn}>
          <Ionicons name="flame" size={20} color="#FFE66D" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#445" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search labs, rooms, buildings..."
            placeholderTextColor="#445"
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#445" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.label}
            style={[styles.chip, activeCategory === cat.value && styles.chipActive]}
            onPress={() => setActiveCategory(cat.value)}
          >
            <Ionicons name={cat.icon} size={13} color={activeCategory === cat.value ? '#00C6FF' : '#445'} />
            <Text style={[styles.chipText, activeCategory === cat.value && { color: '#00C6FF' }]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floor filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.floorRow}
      >
        {FLOORS.map(f => (
          <TouchableOpacity
            key={f.label}
            style={[styles.floorChip, activeFloor === f.value && styles.floorChipActive]}
            onPress={() => setActiveFloor(f.value)}
          >
            <Text style={[styles.floorChipText, activeFloor === f.value && { color: '#FFE66D' }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text style={styles.countText}>{filtered.length} location{filtered.length !== 1 ? 's' : ''} found</Text>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#00C6FF" size="large" />
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id?.toString() || item.name}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <LocationCard
              item={item}
              index={index}
              onNavigate={handleNavigate}
              onDetails={handleDetails}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={{ fontSize: 40 }}>🔍</Text>
              <Text style={styles.emptyText}>No locations found</Text>
              <Text style={styles.emptySub}>Try changing your filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 8, borderRadius: 20, backgroundColor: '#1A2235' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heatmapBtn: { padding: 8, borderRadius: 20, backgroundColor: '#1A2235' },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: '#1A2235', gap: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },

  chipRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#0F172A', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: '#1A2235',
  },
  chipActive: { borderColor: '#00C6FF', backgroundColor: '#00C6FF11' },
  chipText: { color: '#445', fontSize: 12, fontWeight: '600' },

  floorRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  floorChip: {
    backgroundColor: '#0F172A', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: '#1A2235',
  },
  floorChipActive: { borderColor: '#FFE66D', backgroundColor: '#FFE66D11' },
  floorChipText: { color: '#445', fontSize: 12, fontWeight: '700' },

  countText: { color: '#334', fontSize: 12, paddingHorizontal: 20, marginBottom: 6 },

  list: { paddingHorizontal: 16, paddingBottom: 30, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0F172A', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#1A2235', gap: 12,
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 22 },
  cardBody: { flex: 1, gap: 3 },
  cardName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardMeta: { color: '#556', fontSize: 12 },
  tagRow: { flexDirection: 'row', gap: 5, marginTop: 3, flexWrap: 'wrap' },
  tag: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontSize: 10, fontWeight: '600' },

  cardActions: { alignItems: 'center', gap: 6 },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
  },
  navBtnText: { color: '#0A0E1A', fontSize: 12, fontWeight: '800' },
  detailBtn: { padding: 4 },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#445', fontSize: 14 },
  emptyBox: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyText: { color: '#334', fontSize: 16, fontWeight: '700' },
  emptySub: { color: '#2A3450', fontSize: 13 },
});