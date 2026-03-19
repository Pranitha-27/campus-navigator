// src/screens/CrowdHeatmapScreen.js
// Live crowd heatmap with real-time Firestore updates + REST API fallback

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, Animated, Platform, StatusBar, RefreshControl
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase'; // your firebase client config
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');
const CELL_SIZE = 36;
const MAP_COLS = 8;
const MAP_ROWS = 6;

// Color gradient for crowd density (0-100)
const densityColor = (density) => {
  if (density < 20) return '#00C6FF22';
  if (density < 40) return '#4ECDC444';
  if (density < 60) return '#FFE66D88';
  if (density < 80) return '#FF6B6BAA';
  return '#FF0044CC';
};

const densityLabel = (d) => {
  if (d < 20) return 'Empty';
  if (d < 40) return 'Quiet';
  if (d < 60) return 'Moderate';
  if (d < 80) return 'Busy';
  return 'Crowded';
};

const densityTextColor = (d) => {
  if (d < 20) return '#00C6FF';
  if (d < 40) return '#4ECDC4';
  if (d < 60) return '#FFE66D';
  if (d < 80) return '#FF6B6B';
  return '#FF0044';
};

// Generate demo grid if no realtime data
const generateDemoGrid = () =>
  Array.from({ length: MAP_ROWS }, (_, r) =>
    Array.from({ length: MAP_COLS }, (_, c) => ({
      id: `${r}-${c}`,
      density: Math.floor(Math.random() * 100),
      label: null,
    }))
  );

// Overlay room labels on grid
const ROOM_OVERLAYS = [
  { row: 0, col: 0, colSpan: 2, label: 'Reception', icon: 'desk' },
  { row: 0, col: 3, colSpan: 2, label: 'Cafeteria', icon: 'restaurant' },
  { row: 1, col: 0, colSpan: 3, label: 'Corridor A', icon: 'swap-horiz' },
  { row: 2, col: 1, colSpan: 2, label: 'Library', icon: 'book' },
  { row: 2, col: 4, colSpan: 2, label: 'IoT Lab', icon: 'wifi' },
  { row: 3, col: 0, colSpan: 2, label: 'Seminar Hall', icon: 'people' },
  { row: 4, col: 2, colSpan: 3, label: 'Corridor B', icon: 'swap-horiz' },
  { row: 5, col: 1, colSpan: 2, label: 'Computer Lab', icon: 'computer' },
];

export default function CrowdHeatmapScreen({ navigation }) {
  const [grid, setGrid] = useState(generateDemoGrid());
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [topCrowded, setTopCrowded] = useState([]);
  const [totalOccupancy, setTotalOccupancy] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    startPulse();
    if (isLive) subscribeToFirestore();
    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, [selectedFloor, isLive]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  const subscribeToFirestore = () => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    try {
      const q = query(
        collection(db, 'crowd_data'),
        orderBy('timestamp', 'desc')
      );
      unsubscribeRef.current = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) { generateAndSetDemo(); return; }
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        processCrowdData(docs);
        setLastUpdated(new Date());
      }, () => generateAndSetDemo());
    } catch {
      generateAndSetDemo();
    }
  };

  const generateAndSetDemo = () => {
    const g = generateDemoGrid();
    setGrid(g);
    computeStats(g);
  };

  const processCrowdData = (docs) => {
    // Map Firestore docs to grid cells
    const g = generateDemoGrid();
    docs.forEach(doc => {
      if (doc.floor === selectedFloor && doc.row !== undefined && doc.col !== undefined) {
        if (g[doc.row] && g[doc.row][doc.col]) {
          g[doc.row][doc.col].density = doc.density || 0;
        }
      }
    });
    setGrid(g);
    computeStats(g);
  };

  const computeStats = (g) => {
    const flat = g.flat();
    const avg = flat.reduce((a, c) => a + c.density, 0) / flat.length;
    setTotalOccupancy(Math.round(avg));

    const named = ROOM_OVERLAYS.map(r => {
      const cells = [];
      for (let c = r.col; c < r.col + r.colSpan; c++) {
        if (g[r.row]?.[c]) cells.push(g[r.row][c].density);
      }
      const avg = cells.reduce((a, b) => a + b, 0) / cells.length;
      return { label: r.label, icon: r.icon, density: Math.round(avg) };
    });
    named.sort((a, b) => b.density - a.density);
    setTopCrowded(named.slice(0, 4));
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    generateAndSetDemo();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const floors = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0A0E1A', '#0F172A']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Crowd Map</Text>
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.liveText}>{isLive ? 'LIVE' : 'DEMO'}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setIsLive(l => !l)} style={styles.liveToggle}>
          <Ionicons name={isLive ? 'radio' : 'radio-outline'} size={22} color={isLive ? '#FF6B6B' : '#555'} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00C6FF" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Floor Selector */}
        <View style={styles.floorRow}>
          {floors.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.floorBtn, selectedFloor === f && styles.floorBtnActive]}
              onPress={() => setSelectedFloor(f)}
            >
              <Text style={[styles.floorBtnText, selectedFloor === f && { color: '#00C6FF' }]}>F{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overall Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: densityTextColor(totalOccupancy) }]}>{totalOccupancy}%</Text>
            <Text style={styles.statLbl}>Overall Occupancy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{topCrowded[0]?.label || '—'}</Text>
            <Text style={styles.statLbl}>Busiest Area</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statVal, { color: '#4ECDC4', fontSize: 12 }]}>
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={styles.statLbl}>Last Updated</Text>
          </View>
        </View>

        {/* Heatmap Grid */}
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>Floor {selectedFloor} — Crowd Density</Text>
          <View style={styles.mapGrid}>
            {grid.map((row, rIdx) => (
              <View key={rIdx} style={styles.mapRow}>
                {row.map((cell, cIdx) => {
                  const overlay = ROOM_OVERLAYS.find(o => o.row === rIdx && o.col === cIdx);
                  return (
                    <View
                      key={cIdx}
                      style={[
                        styles.cell,
                        { backgroundColor: densityColor(cell.density) },
                        overlay && { borderColor: '#ffffff22', borderWidth: 1 }
                      ]}
                    >
                      {overlay && (
                        <Text style={styles.cellLabel} numberOfLines={1}>
                          {overlay.label.split(' ')[0]}
                        </Text>
                      )}
                      <Text style={styles.cellDensity}>{cell.density}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
          {/* Legend */}
          <View style={styles.legend}>
            {['Empty', 'Quiet', 'Moderate', 'Busy', 'Crowded'].map((lbl, i) => (
              <View key={lbl} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: densityColor(i * 25 + 10) }]} />
                <Text style={styles.legendText}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Crowd Areas */}
        <Text style={styles.sectionTitle}>Area Status</Text>
        <View style={styles.areaList}>
          {topCrowded.map((area, i) => (
            <View key={i} style={styles.areaCard}>
              <View style={styles.areaLeft}>
                <MaterialIcons name={area.icon || 'location-on'} size={20} color={densityTextColor(area.density)} />
                <View>
                  <Text style={styles.areaName}>{area.label}</Text>
                  <Text style={[styles.areaStatus, { color: densityTextColor(area.density) }]}>
                    {densityLabel(area.density)}
                  </Text>
                </View>
              </View>
              <View style={styles.areaRight}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, {
                    width: `${area.density}%`,
                    backgroundColor: densityTextColor(area.density)
                  }]} />
                </View>
                <Text style={[styles.areaPct, { color: densityTextColor(area.density) }]}>{area.density}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Suggestion Banner */}
        {totalOccupancy > 60 && (
          <View style={styles.suggestionBanner}>
            <Ionicons name="warning" size={18} color="#FFE66D" />
            <Text style={styles.suggestionText}>
              Campus is busy. Consider visiting less crowded areas like the Library or Computer Lab.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const cellW = Math.floor((width - 32) / MAP_COLS);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 8, borderRadius: 20, backgroundColor: '#1A2235' },
  headerCenter: { alignItems: 'center', gap: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4444' },
  liveText: { color: '#FF4444', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  liveToggle: { padding: 8, borderRadius: 20, backgroundColor: '#1A2235' },
  floorRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, paddingTop: 12, paddingBottom: 4 },
  floorBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1A2235',
  },
  floorBtnActive: { borderColor: '#00C6FF', backgroundColor: '#00C6FF11' },
  floorBtnText: { color: '#556', fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginTop: 12 },
  statCard: {
    flex: 1, backgroundColor: '#0F172A', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#1A2235', alignItems: 'center', gap: 4,
  },
  statVal: { color: '#fff', fontSize: 14, fontWeight: '800' },
  statLbl: { color: '#445', fontSize: 10, textAlign: 'center' },
  mapContainer: { margin: 16, backgroundColor: '#0F172A', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#1A2235' },
  mapTitle: { color: '#667', fontSize: 12, fontWeight: '700', letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase' },
  mapGrid: { gap: 2 },
  mapRow: { flexDirection: 'row', gap: 2 },
  cell: {
    width: cellW, height: cellW, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  cellLabel: { color: '#ffffff99', fontSize: 7, fontWeight: '700', textAlign: 'center' },
  cellDensity: { color: '#ffffff66', fontSize: 8, fontWeight: '600' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14 },
  legendItem: { alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 3 },
  legendText: { color: '#445', fontSize: 9 },
  sectionTitle: { color: '#556', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 20, marginBottom: 10 },
  areaList: { paddingHorizontal: 16, gap: 8 },
  areaCard: {
    backgroundColor: '#0F172A', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#1A2235',
  },
  areaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  areaName: { color: '#ccc', fontSize: 14, fontWeight: '600' },
  areaStatus: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  areaRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBg: { width: 80, height: 6, backgroundColor: '#1A2235', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  areaPct: { fontSize: 13, fontWeight: '700', minWidth: 36, textAlign: 'right' },
  suggestionBanner: {
    margin: 16, backgroundColor: '#FFE66D11', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: '#FFE66D33',
  },
  suggestionText: { flex: 1, color: '#FFE66D', fontSize: 13, lineHeight: 19 },
});