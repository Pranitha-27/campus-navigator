import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import * as Location from 'expo-location';
import Screen from '../../components/Screen';
import { COLORS, SPACING } from '../../config';
import {
  CAMPUS_CENTER,
  BUILDINGS,
  ROOM_LOCATIONS,
  getDistance,
  getNearestRoom,
} from '../../utils/campusCoordinates';
import {
  updatePresence,
  removePresence,
  subscribeToPresence,
  getRoomCrowdCounts,
} from '../../services/presenceService';

const { width } = Dimensions.get('window');
const MAP_W = width - SPACING.lg * 2;
const MAP_H = MAP_W * 0.75;

// Convert GPS to map pixel position
const gpsToMap = (latitude, longitude) => {
  const LAT_SPAN = 0.002;
  const LNG_SPAN = 0.002;
  const x = ((longitude - (CAMPUS_CENTER.longitude - LNG_SPAN / 2)) / LNG_SPAN) * MAP_W;
  const y = (1 - (latitude - (CAMPUS_CENTER.latitude - LAT_SPAN / 2)) / LAT_SPAN) * MAP_H;
  return {
    x: Math.max(0, Math.min(MAP_W, x)),
    y: Math.max(0, Math.min(MAP_H, y)),
  };
};

// Crowd level color
const getCrowdColor = (count) => {
  if (!count || count === 0) return 'transparent';
  if (count <= 2) return 'rgba(34,197,94,0.35)';
  if (count <= 5) return 'rgba(251,191,36,0.45)';
  return 'rgba(239,68,68,0.55)';
};

const getCrowdLabel = (count) => {
  if (!count || count === 0) return '';
  if (count <= 2) return '🟢 Quiet';
  if (count <= 5) return '🟡 Moderate';
  return '🔴 Busy';
};

// ── Campus Map Component ────────────────────────────────────────────────────
function CampusMap({ userPosition, presenceList, destination, nearestRoom }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const userPos = userPosition ? gpsToMap(userPosition.latitude, userPosition.longitude) : null;
  const crowdCounts = getRoomCrowdCounts(presenceList);

  return (
    <View style={styles.mapContainer}>
      {/* Buildings */}
      {BUILDINGS.map((b) => {
        const pos = gpsToMap(b.latitude, b.longitude);
        const isDestBuilding = destination?.building === b.id;
        return (
          <View
            key={b.id}
            style={[
              styles.buildingBlock,
              {
                left: pos.x - 30,
                top: pos.y - 20,
                borderColor: isDestBuilding ? COLORS.danger : '#94A3B8',
                borderWidth: isDestBuilding ? 2 : 1,
              },
            ]}
          >
            <Text style={styles.buildingLabel} numberOfLines={1}>{b.name}</Text>
          </View>
        );
      })}

      {/* Room crowd heatmap dots */}
      {ROOM_LOCATIONS.map((room) => {
        const pos = gpsToMap(room.latitude, room.longitude);
        const count = crowdCounts[room.id] || 0;
        const color = getCrowdColor(count);
        if (color === 'transparent') return null;
        return (
          <View
            key={room.id}
            style={[
              styles.heatDot,
              {
                left: pos.x - 15,
                top: pos.y - 15,
                backgroundColor: color,
              },
            ]}
          />
        );
      })}

      {/* Destination marker */}
      {destination && (() => {
        const room = ROOM_LOCATIONS.find(r => r.id === destination.id || r.name === destination.name);
        if (!room) return null;
        const pos = gpsToMap(room.latitude, room.longitude);
        return (
          <View style={[styles.destinationPin, { left: pos.x - 10, top: pos.y - 24 }]}>
            <Text style={styles.destinationPinText}>📍</Text>
          </View>
        );
      })()}

      {/* Other users (presence) */}
      {presenceList.map((p, i) => {
        const pos = gpsToMap(p.latitude, p.longitude);
        return (
          <View
            key={p.sessionId || i}
            style={[styles.otherUser, { left: pos.x - 5, top: pos.y - 5 }]}
          />
        );
      })}

      {/* User's live location */}
      {userPos && (
        <View style={[styles.userDotContainer, { left: userPos.x - 12, top: userPos.y - 12 }]}>
          <Animated.View style={[styles.userPulse, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.userDot} />
        </View>
      )}

      {/* Map legend */}
      <View style={styles.mapLegend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(239,68,68,0.6)' }]} />
          <Text style={styles.legendText}>Busy</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: 'rgba(34,197,94,0.6)' }]} />
          <Text style={styles.legendText}>Quiet</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function LiveNavigationScreen({ navigation, route }) {
  const destination = route.params?.destination || null;

  const [userPosition, setUserPosition] = useState(null);
  const [nearestRoom, setNearestRoom] = useState(null);
  const [presenceList, setPresenceList] = useState([]);
  const [crowdCounts, setCrowdCounts] = useState({});
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'directions' | 'heatmap'
  const [directions, setDirections] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const locationSub = useRef(null);
  const presenceSub = useRef(null);
  const updateInterval = useRef(null);

  // ── Start GPS tracking ───────────────────────────────────────────────────
  const startTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Enable it in settings.');
        setLoading(false);
        return;
      }

      // Get initial position fast
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      handlePositionUpdate(initial.coords);
      setLoading(false);

      // Watch position continuously
      locationSub.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 2,
        },
        (loc) => handlePositionUpdate(loc.coords)
      );
    } catch (err) {
      console.error('GPS error:', err);
      setLocationError('Could not get location. Make sure GPS is enabled.');
      setLoading(false);
    }
  }, [destination]);

  const handlePositionUpdate = useCallback(async (coords) => {
    const { latitude, longitude } = coords;
    setUserPosition({ latitude, longitude });

    // Find nearest room
    const nearest = getNearestRoom(latitude, longitude);
    setNearestRoom(nearest);

    // Update Firebase presence every 30 seconds
    await updatePresence(latitude, longitude, nearest?.id);

    // Update directions if navigating
    if (destination) {
      updateDirections(latitude, longitude, nearest);
    }
  }, [destination]);

  // ── Generate step-by-step directions ────────────────────────────────────
  const updateDirections = useCallback((lat, lng, nearest) => {
    if (!destination) return;

    const destRoom = ROOM_LOCATIONS.find(
      r => r.id === destination.id || r.name === destination.name
    );
    if (!destRoom) return;

    const totalDist = getDistance(lat, lng, destRoom.latitude, destRoom.longitude);

    const steps = [];

    if (totalDist < 10) {
      steps.push({ text: `🎉 You have arrived at ${destination.name || destination}!`, done: true });
    } else if (totalDist < 30) {
      steps.push({ text: `📍 ${destination.name || destination} is just ${Math.round(totalDist)}m away`, done: false });
    } else {
      // Multi-step directions
      if (nearest) {
        steps.push({ text: `📌 You are near: ${nearest.name}`, done: true });
      }

      // Floor logic
      if (destRoom.floor > 0) {
        const nearLift = ROOM_LOCATIONS.find(r => r.id === 'front-lift');
        if (nearLift) {
          const liftDist = getDistance(lat, lng, nearLift.latitude, nearLift.longitude);
          steps.push({
            text: `🛗 Head to the ${liftDist < 20 ? 'Front' : 'nearest'} Lift (~${Math.round(liftDist)}m away)`,
            done: liftDist < 10,
          });
          steps.push({
            text: `⬆️ Take lift to Floor ${destRoom.floor}`,
            done: false,
          });
        }
      }

      steps.push({
        text: `🚶 Walk ${Math.round(totalDist)}m to ${destination.name || destination}`,
        done: false,
      });
    }

    setDirections(steps);

    // Auto-advance current step
    const firstUndonе = steps.findIndex(s => !s.done);
    setCurrentStep(firstUndonе === -1 ? steps.length - 1 : firstUndonе);
  }, [destination]);

  // ── Subscribe to presence heatmap ────────────────────────────────────────
  useEffect(() => {
    presenceSub.current = subscribeToPresence((list) => {
      setPresenceList(list);
      setCrowdCounts(getRoomCrowdCounts(list));
    });
    return () => {
      if (presenceSub.current) presenceSub.current();
    };
  }, []);

  // ── Start/stop GPS ───────────────────────────────────────────────────────
  useEffect(() => {
    startTracking();
    return () => {
      if (locationSub.current) locationSub.current.remove();
      removePresence();
    };
  }, []);

  // ── Build heatmap room list ──────────────────────────────────────────────
  const heatmapRooms = ROOM_LOCATIONS.map(r => ({
    ...r,
    count: crowdCounts[r.id] || 0,
  })).sort((a, b) => b.count - a.count);

  return (
    <Screen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Navigation</Text>
          {userPosition && (
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['map', 'directions', 'heatmap'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'map' ? '🗺️ Map' : tab === 'directions' ? '🧭 Directions' : '🔥 Heatmap'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading state */}
        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        )}

        {/* Error state */}
        {locationError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>📍</Text>
            <Text style={styles.errorText}>{locationError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={startTracking}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MAP TAB ── */}
        {activeTab === 'map' && !loading && (
          <View style={styles.tabContent}>
            {destination && (
              <View style={styles.destinationBanner}>
                <Text style={styles.destLabel}>📍 Navigating to:</Text>
                <Text style={styles.destName}>{destination.name || destination}</Text>
              </View>
            )}

            {/* Nearest room badge */}
            {nearestRoom && (
              <View style={styles.nearestBadge}>
                <Text style={styles.nearestIcon}>📡</Text>
                <Text style={styles.nearestText}>
                  Near: <Text style={styles.nearestBold}>{nearestRoom.name}</Text>
                  {' '}({nearestRoom.distance}m)
                </Text>
              </View>
            )}

            <CampusMap
              userPosition={userPosition}
              presenceList={presenceList}
              destination={destination}
              nearestRoom={nearestRoom}
            />

            {/* Active users count */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{presenceList.length}</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {nearestRoom ? `${nearestRoom.distance}m` : '--'}
                </Text>
                <Text style={styles.statLabel}>Nearest Point</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {destination && userPosition
                    ? `${Math.round(getDistance(
                        userPosition.latitude,
                        userPosition.longitude,
                        ROOM_LOCATIONS.find(r => r.name === destination.name)?.latitude || CAMPUS_CENTER.latitude,
                        ROOM_LOCATIONS.find(r => r.name === destination.name)?.longitude || CAMPUS_CENTER.longitude
                      ))}m`
                    : '--'}
                </Text>
                <Text style={styles.statLabel}>To Destination</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── DIRECTIONS TAB ── */}
        {activeTab === 'directions' && (
          <View style={styles.tabContent}>
            {!destination ? (
              <View style={styles.noDestCard}>
                <Text style={styles.noDestIcon}>🧭</Text>
                <Text style={styles.noDestTitle}>No Destination Set</Text>
                <Text style={styles.noDestText}>
                  Go to Navigate Campus, pick a location, and tap "Live Navigate" to get directions.
                </Text>
                <TouchableOpacity
                  style={styles.pickDestBtn}
                  onPress={() => navigation.navigate('NavigationHome')}
                >
                  <Text style={styles.pickDestBtnText}>Pick a Destination</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.destCard}>
                  <Text style={styles.destCardLabel}>Destination</Text>
                  <Text style={styles.destCardName}>{destination.name || destination}</Text>
                  {destination.floor !== undefined && (
                    <Text style={styles.destCardMeta}>Floor {destination.floor} • {destination.building}</Text>
                  )}
                </View>

                {directions.length === 0 ? (
                  <ActivityIndicator color={COLORS.primary} style={{ marginTop: 32 }} />
                ) : (
                  directions.map((step, i) => (
                    <View
                      key={i}
                      style={[
                        styles.stepCard,
                        i === currentStep && styles.stepCardActive,
                        step.done && styles.stepCardDone,
                      ]}
                    >
                      <View style={[
                        styles.stepCircle,
                        i === currentStep && { backgroundColor: COLORS.primary },
                        step.done && { backgroundColor: '#22C55E' },
                      ]}>
                        <Text style={styles.stepCircleText}>
                          {step.done ? '✓' : i + 1}
                        </Text>
                      </View>
                      <Text style={[
                        styles.stepText,
                        i === currentStep && styles.stepTextActive,
                        step.done && styles.stepTextDone,
                      ]}>
                        {step.text}
                      </Text>
                    </View>
                  ))
                )}
              </>
            )}
          </View>
        )}

        {/* ── HEATMAP TAB ── */}
        {activeTab === 'heatmap' && (
          <View style={styles.tabContent}>
            <Text style={styles.heatmapTitle}>🔥 Live Crowd Heatmap</Text>
            <Text style={styles.heatmapSubtitle}>
              {presenceList.length} {presenceList.length === 1 ? 'person' : 'people'} active on campus right now
            </Text>

            {heatmapRooms.map((room) => (
              <View key={room.id} style={styles.heatmapRow}>
                <View style={styles.heatmapLeft}>
                  <Text style={styles.heatmapRoomName}>{room.name}</Text>
                  <Text style={styles.heatmapRoomMeta}>Floor {room.floor} • {room.building}</Text>
                </View>
                <View style={styles.heatmapRight}>
                  {room.count > 0 ? (
                    <>
                      <View
                        style={[
                          styles.heatmapBar,
                          {
                            width: Math.max(8, (room.count / Math.max(...heatmapRooms.map(r => r.count), 1)) * 80),
                            backgroundColor: room.count <= 2 ? '#22C55E' : room.count <= 5 ? '#F59E0B' : '#EF4444',
                          },
                        ]}
                      />
                      <Text style={styles.heatmapCount}>{room.count}</Text>
                    </>
                  ) : (
                    <Text style={styles.heatmapEmpty}>—</Text>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.heatmapLegend}>
              <View style={styles.heatmapLegendItem}>
                <View style={[styles.heatmapLegendDot, { backgroundColor: '#22C55E' }]} />
                <Text style={styles.heatmapLegendText}>Quiet (1-2)</Text>
              </View>
              <View style={styles.heatmapLegendItem}>
                <View style={[styles.heatmapLegendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.heatmapLegendText}>Moderate (3-5)</Text>
              </View>
              <View style={styles.heatmapLegendItem}>
                <View style={[styles.heatmapLegendDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.heatmapLegendText}>Busy (6+)</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </Screen>
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
  backBtn: { fontSize: 16, color: COLORS.primary, fontWeight: '600' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B' },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#EF4444' },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: COLORS.primary },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  tabContent: { padding: 16 },

  // Loading / Error
  loadingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', margin: 16, padding: 16, borderRadius: 12 },
  loadingText: { fontSize: 15, color: '#64748B' },
  errorCard: { alignItems: 'center', margin: 16, padding: 24, backgroundColor: '#FFF7ED', borderRadius: 16 },
  errorIcon: { fontSize: 40, marginBottom: 8 },
  errorText: { fontSize: 14, color: '#92400E', textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '700' },

  // Destination banner
  destinationBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  destLabel: { fontSize: 13, color: '#3B82F6', fontWeight: '600' },
  destName: { fontSize: 13, color: '#1E40AF', fontWeight: '700', flex: 1 },

  // Nearest badge
  nearestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  nearestIcon: { fontSize: 16 },
  nearestText: { fontSize: 13, color: '#166534' },
  nearestBold: { fontWeight: '700' },

  // Map
  mapContainer: {
    width: MAP_W,
    height: MAP_H,
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  buildingBlock: {
    position: 'absolute',
    width: 60,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  buildingLabel: { fontSize: 7, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
  heatDot: { position: 'absolute', width: 30, height: 30, borderRadius: 15 },
  destinationPin: { position: 'absolute' },
  destinationPinText: { fontSize: 20 },
  otherUser: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#94A3B8' },
  userDotContainer: { position: 'absolute', width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  userPulse: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(59,130,246,0.3)' },
  userDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#3B82F6', borderWidth: 2, borderColor: '#fff' },
  mapLegend: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 8, padding: 6, gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, color: '#1E293B', fontWeight: '600' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 10, color: '#94A3B8', marginTop: 2 },

  // Directions
  noDestCard: { alignItems: 'center', padding: 32 },
  noDestIcon: { fontSize: 56, marginBottom: 16 },
  noDestTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  noDestText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  pickDestBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  pickDestBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  destCard: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, marginBottom: 16 },
  destCardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  destCardName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  destCardMeta: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  stepCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  stepCardActive: { borderColor: COLORS.primary, backgroundColor: '#EFF6FF' },
  stepCardDone: { opacity: 0.6 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  stepCircleText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },
  stepTextActive: { color: '#1E293B', fontWeight: '600' },
  stepTextDone: { textDecorationLine: 'line-through' },

  // Heatmap
  heatmapTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  heatmapSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  heatmapRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  heatmapLeft: { flex: 1 },
  heatmapRoomName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  heatmapRoomMeta: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  heatmapRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heatmapBar: { height: 8, borderRadius: 4 },
  heatmapCount: { fontSize: 13, fontWeight: '700', color: '#1E293B', minWidth: 20, textAlign: 'right' },
  heatmapEmpty: { fontSize: 13, color: '#CBD5E1' },
  heatmapLegend: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  heatmapLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heatmapLegendDot: { width: 10, height: 10, borderRadius: 5 },
  heatmapLegendText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
});