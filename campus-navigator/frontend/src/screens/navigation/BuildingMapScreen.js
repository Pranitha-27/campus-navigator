import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '../../config';

const { width } = Dimensions.get('window');
const FLOOR_W = width - SPACING.lg * 2;

// ─── All floors data ────────────────────────────────────────────────────────
const FLOORS = [
  {
    floor: 0,
    label: 'Ground Floor',
    color: '#0891B2',
    rooms: [
      { id: 'bsn-entrance', label: 'Main\nEntrance', x: 2, y: 30, w: 14, h: 40, color: '#0891B2', type: 'entrance' },
      { id: 'bsn-lobby',    label: 'Lobby',         x: 18, y: 30, w: 14, h: 40, color: '#0891B2', type: 'lobby' },
      { id: 'reception',    label: 'Reception\nDesk', x: 34, y: 30, w: 14, h: 40, color: '#0891B2', type: 'room' },
      { id: 'cafeteria',    label: '🍽️ Cafeteria',  x: 50, y: 30, w: 18, h: 40, color: '#F59E0B', type: 'landmark' },
      { id: 'library',      label: '📚 Library',    x: 70, y: 30, w: 14, h: 40, color: '#8B5CF6', type: 'landmark' },
      { id: 'bsn-elevator', label: '🛗 Lift',       x: 87, y: 20, w: 8,  h: 25, color: '#5856D6', type: 'lift' },
      { id: 'bsn-stairs',   label: '🪜 Stairs',     x: 87, y: 55, w: 8,  h: 25, color: '#94A3B8', type: 'stairs' },
    ],
  },
  {
    floor: 2,
    label: 'Floor 2',
    color: '#2563EB',
    rooms: [
      { id: 'classroom-201', label: 'Class\n201',      x: 2,  y: 20, w: 16, h: 35, color: '#2563EB', type: 'room' },
      { id: 'classroom-202', label: 'Class\n202',      x: 20, y: 20, w: 16, h: 35, color: '#2563EB', type: 'room' },
      { id: 'cs-lab',        label: '💻 CS Lab\nTR201', x: 38, y: 20, w: 20, h: 35, color: '#059669', type: 'lab' },
      { id: 'toilet-f2',     label: '🚻 WC',           x: 60, y: 20, w: 10, h: 35, color: '#94A3B8', type: 'toilet' },
      { id: 'floor2-corridor', label: 'Corridor',      x: 2,  y: 62, w: 80, h: 15, color: '#CBD5E1', type: 'corridor' },
      { id: 'bsn-elevator',  label: '🛗 Lift',         x: 87, y: 20, w: 8,  h: 25, color: '#5856D6', type: 'lift' },
      { id: 'bsn-stairs',    label: '🪜 Stairs',       x: 87, y: 55, w: 8,  h: 25, color: '#94A3B8', type: 'stairs' },
    ],
  },
  {
    floor: 3,
    label: 'Floor 3',
    color: '#7C3AED',
    rooms: [
      { id: 'classroom-301', label: 'Class\n301',        x: 2,  y: 20, w: 16, h: 35, color: '#2563EB', type: 'room' },
      { id: 'classroom-302', label: 'Class\n302',        x: 20, y: 20, w: 16, h: 35, color: '#2563EB', type: 'room' },
      { id: 'networking-lab', label: '🌐 Network\nLab', x: 38, y: 20, w: 20, h: 35, color: '#059669', type: 'lab' },
      { id: 'staff-room',    label: '👔 Staff\nRoom',    x: 60, y: 20, w: 14, h: 35, color: '#F59E0B', type: 'room' },
      { id: 'toilet-f3',     label: '🚻 WC',             x: 76, y: 20, w: 8,  h: 35, color: '#94A3B8', type: 'toilet' },
      { id: 'floor3-corridor', label: 'Corridor',        x: 2,  y: 62, w: 80, h: 15, color: '#CBD5E1', type: 'corridor' },
      { id: 'bsn-elevator',  label: '🛗 Lift',           x: 87, y: 20, w: 8,  h: 25, color: '#5856D6', type: 'lift' },
      { id: 'bsn-stairs',    label: '🪜 Stairs',         x: 87, y: 55, w: 8,  h: 25, color: '#94A3B8', type: 'stairs' },
    ],
  },
  {
    floor: 4,
    label: 'Floor 4',
    color: '#DC2626',
    rooms: [
      { id: 'classroom-401',   label: 'Class\n401',         x: 2,  y: 20, w: 16, h: 35, color: '#2563EB', type: 'room' },
      { id: 'cybersecurity-lab', label: '🔐 Cyber\nSec Lab', x: 20, y: 20, w: 20, h: 35, color: '#059669', type: 'lab' },
      { id: 'prayer-room',     label: '🕌 Prayer\nRoom',    x: 42, y: 20, w: 16, h: 35, color: '#F59E0B', type: 'room' },
      { id: 'toilet-f4',       label: '🚻 WC',              x: 60, y: 20, w: 8,  h: 35, color: '#94A3B8', type: 'toilet' },
      { id: 'floor4-corridor', label: 'Corridor',           x: 2,  y: 62, w: 80, h: 15, color: '#CBD5E1', type: 'corridor' },
      { id: 'bsn-elevator',    label: '🛗 Lift',            x: 87, y: 20, w: 8,  h: 25, color: '#5856D6', type: 'lift' },
      { id: 'bsn-stairs',      label: '🪜 Stairs',          x: 87, y: 55, w: 8,  h: 25, color: '#94A3B8', type: 'stairs' },
    ],
  },
  {
    floor: 5,
    label: 'Floor 5',
    color: '#059669',
    rooms: [
      { id: 'kevin-ashton',   label: '📡 IoT Lab\n501',     x: 2,  y: 15, w: 18, h: 35, color: '#059669', type: 'lab' },
      { id: 'sahyadri-ai',    label: '🤖 AI Lab\n507',      x: 22, y: 15, w: 18, h: 35, color: '#059669', type: 'lab' },
      { id: 'john-mccarthy',  label: '🧪 McCarthy\n506',    x: 42, y: 15, w: 16, h: 35, color: '#059669', type: 'lab' },
      { id: 'aiml-board',     label: '📋 AIML\nBoard',      x: 42, y: 55, w: 16, h: 30, color: '#F59E0B', type: 'room' },
      { id: 'aiml-faculty',   label: '👩‍🏫 Faculty',         x: 60, y: 15, w: 14, h: 35, color: '#F59E0B', type: 'room' },
      { id: 'cybersecurity',  label: '🔐 Cyber\nTR501',     x: 22, y: 55, w: 18, h: 30, color: '#DC2626', type: 'lab' },
      { id: 'peter-naur',     label: '📊 Data Sci\n502',    x: 42, y: 55, w: 16, h: 30, color: '#059669', type: 'lab' },
      { id: 'toilet-f5',      label: '🚻 WC',               x: 76, y: 15, w: 8,  h: 35, color: '#94A3B8', type: 'toilet' },
      { id: 'floor5-corridor', label: 'Corridor',           x: 2,  y: 52, w: 80, h: 8,  color: '#CBD5E1', type: 'corridor' },
      { id: 'bsn-elevator',   label: '🛗 Lift',             x: 87, y: 15, w: 8,  h: 25, color: '#5856D6', type: 'lift' },
      { id: 'bsn-stairs',     label: '🪜 Stairs',           x: 87, y: 50, w: 8,  h: 25, color: '#94A3B8', type: 'stairs' },
    ],
  },
];

// ─── Room type colors ────────────────────────────────────────────────────────
const TYPE_BG = {
  lab:      '#D1FAE5',
  room:     '#DBEAFE',
  corridor: '#F1F5F9',
  lift:     '#EDE9FE',
  stairs:   '#F1F5F9',
  toilet:   '#F8FAFC',
  landmark: '#FEF3C7',
  entrance: '#CFFAFE',
  lobby:    '#CFFAFE',
};

const TYPE_BORDER = {
  lab:      '#059669',
  room:     '#2563EB',
  corridor: '#CBD5E1',
  lift:     '#5856D6',
  stairs:   '#94A3B8',
  toilet:   '#94A3B8',
  landmark: '#F59E0B',
  entrance: '#0891B2',
  lobby:    '#0891B2',
};

// ─── Single floor plan component ─────────────────────────────────────────────
function FloorPlan({ floorData, selectedRoom, onRoomPress }) {
  const MAP_H = FLOOR_W * 0.45;

  return (
    <View style={[styles.floorPlan, { height: MAP_H }]}>
      {floorData.rooms.map((room) => {
        const isSelected = selectedRoom?.id === room.id;
        const isCorridorOrStairs = room.type === 'corridor' || room.type === 'stairs';

        return (
          <TouchableOpacity
            key={room.id}
            activeOpacity={isCorridorOrStairs ? 1 : 0.7}
            onPress={() => !isCorridorOrStairs && onRoomPress(room, floorData.floor)}
            style={[
              styles.room,
              {
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.w}%`,
                height: `${room.h}%`,
                backgroundColor: isSelected
                  ? floorData.color
                  : TYPE_BG[room.type] || '#F1F5F9',
                borderColor: isSelected
                  ? floorData.color
                  : TYPE_BORDER[room.type] || '#CBD5E1',
                borderWidth: isSelected ? 2 : 1,
                transform: isSelected ? [{ scale: 1.04 }] : [],
                zIndex: isSelected ? 10 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.roomLabel,
                {
                  color: isSelected ? '#fff' : '#1E293B',
                  fontSize: room.type === 'corridor' ? 7 : 7.5,
                },
              ]}
              numberOfLines={3}
            >
              {room.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Building overview (stacked floors) ──────────────────────────────────────
function BuildingOverview({ onFloorPress, currentFloor }) {
  return (
    <View style={styles.buildingOverview}>
      <Text style={styles.overviewTitle}>🏢 BSN Block — All Floors</Text>
      {[...FLOORS].reverse().map((floor) => (
        <TouchableOpacity
          key={floor.floor}
          style={[
            styles.floorStrip,
            currentFloor === floor.floor && {
              borderColor: floor.color,
              borderWidth: 2,
              backgroundColor: floor.color + '15',
            },
          ]}
          onPress={() => onFloorPress(floor.floor)}
        >
          <View style={[styles.floorBadge, { backgroundColor: floor.color }]}>
            <Text style={styles.floorBadgeText}>
              {floor.floor === 0 ? 'GF' : `F${floor.floor}`}
            </Text>
          </View>
          <View style={styles.floorStripInfo}>
            <Text style={styles.floorStripLabel}>{floor.label}</Text>
            <Text style={styles.floorStripSub}>
              {floor.rooms.filter((r) => r.type !== 'corridor' && r.type !== 'lift' && r.type !== 'stairs').length} rooms
            </Text>
          </View>
          <View style={styles.floorStripRooms}>
            {floor.rooms
              .filter((r) => ['lab', 'room', 'landmark', 'entrance'].includes(r.type))
              .slice(0, 3)
              .map((r) => (
                <View
                  key={r.id}
                  style={[styles.miniRoom, { backgroundColor: floor.color + '30', borderColor: floor.color }]}
                >
                  <Text style={styles.miniRoomText} numberOfLines={1}>
                    {r.label.split('\n')[0]}
                  </Text>
                </View>
              ))}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function BuildingMapScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'floorplan'
  const [currentFloor, setCurrentFloor] = useState(5);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const currentFloorData = FLOORS.find((f) => f.floor === currentFloor);

  const handleFloorPress = (floor) => {
    setCurrentFloor(floor);
    setSelectedRoom(null);
    setActiveTab('floorplan');
  };

  const handleRoomPress = (room, floor) => {
    setSelectedRoom(room);
  };

  const handleNavigateToRoom = async () => {
    if (!selectedRoom) return;
    // Find the matching location from Firebase and navigate to it
    navigation.navigate('NavigationHome', {
      autoSearch: selectedRoom.label.replace(/\n/g, ' ').split(' ')[0],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campus Map</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            🏢 Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'floorplan' && styles.tabActive]}
          onPress={() => setActiveTab('floorplan')}
        >
          <Text style={[styles.tabText, activeTab === 'floorplan' && styles.tabTextActive]}>
            🗺️ Floor Plan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {activeTab === 'overview' ? (
          <BuildingOverview
            onFloorPress={handleFloorPress}
            currentFloor={currentFloor}
          />
        ) : (
          <View style={styles.floorPlanContainer}>
            {/* Floor selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.floorSelector}
              contentContainerStyle={styles.floorSelectorContent}
            >
              {FLOORS.map((f) => (
                <TouchableOpacity
                  key={f.floor}
                  style={[
                    styles.floorPill,
                    currentFloor === f.floor && {
                      backgroundColor: f.color,
                      borderColor: f.color,
                    },
                  ]}
                  onPress={() => {
                    setCurrentFloor(f.floor);
                    setSelectedRoom(null);
                  }}
                >
                  <Text
                    style={[
                      styles.floorPillText,
                      currentFloor === f.floor && { color: '#fff' },
                    ]}
                  >
                    {f.floor === 0 ? 'GF' : `F${f.floor}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Floor label */}
            <View style={styles.currentFloorLabel}>
              <View
                style={[styles.floorDot, { backgroundColor: currentFloorData?.color }]}
              />
              <Text style={styles.currentFloorText}>
                {currentFloorData?.label}
              </Text>
            </View>

            {/* Floor Plan */}
            <View style={styles.mapWrapper}>
              <FloorPlan
                floorData={currentFloorData}
                selectedRoom={selectedRoom}
                onRoomPress={handleRoomPress}
              />
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {[
                { type: 'lab', label: 'Lab' },
                { type: 'room', label: 'Room' },
                { type: 'landmark', label: 'Landmark' },
                { type: 'lift', label: 'Lift' },
                { type: 'toilet', label: 'WC' },
              ].map((item) => (
                <View key={item.type} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: TYPE_BORDER[item.type] },
                    ]}
                  />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>

            {/* Selected room info */}
            {selectedRoom && (
              <View style={[styles.roomInfoCard, { borderLeftColor: currentFloorData?.color }]}>
                <View style={styles.roomInfoTop}>
                  <View>
                    <Text style={styles.roomInfoName}>
                      {selectedRoom.label.replace(/\n/g, ' ')}
                    </Text>
                    <Text style={styles.roomInfoMeta}>
                      {currentFloorData?.label} •{' '}
                      {selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedRoom(null)}
                    style={styles.closeBtn}
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.navigateBtn, { backgroundColor: currentFloorData?.color }]}
                  onPress={handleNavigateToRoom}
                >
                  <Text style={styles.navigateBtnText}>
                    🧭 Get Directions
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 32 }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { fontSize: 16, color: '#2563EB', fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: '#2563EB' },

  // Building Overview
  buildingOverview: { padding: 16 },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  floorStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  floorBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  floorBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  floorStripInfo: { width: 80 },
  floorStripLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  floorStripSub: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  floorStripRooms: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4, paddingHorizontal: 8 },
  miniRoom: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  miniRoomText: { fontSize: 9, fontWeight: '600', color: '#1E293B' },
  chevron: { fontSize: 22, color: '#CBD5E1' },

  // Floor Plan
  floorPlanContainer: { padding: 16 },
  floorSelector: { marginBottom: 12 },
  floorSelectorContent: { gap: 8, paddingRight: 16 },
  floorPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  floorPillText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  currentFloorLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  floorDot: { width: 10, height: 10, borderRadius: 5 },
  currentFloorText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },

  // Map
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  floorPlan: {
    width: FLOOR_W,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  room: {
    position: 'absolute',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  roomLabel: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 10,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  // Room info card
  roomInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  roomInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  roomInfoName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  roomInfoMeta: { fontSize: 12, color: '#64748B', marginTop: 3 },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 16, color: '#94A3B8' },
  navigateBtn: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  navigateBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});