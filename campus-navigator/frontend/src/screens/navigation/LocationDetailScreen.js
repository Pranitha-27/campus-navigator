import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Screen from '../../components/Screen';
import { COLORS, SPACING } from '../../config';

const { width } = Dimensions.get('window');

const FLOOR_5_ROOMS = [
  { id: 'front-lift',    label: 'Front\nLift',           x: 5,  y: 42, w: 8,  h: 10, color: '#5856D6', type: 'lift' },
  { id: 'kevin-ashton', label: 'Kevin\nAshton\nIoT 501', x: 16, y: 38, w: 13, h: 14, color: '#34C759', type: 'room' },
  { id: 'sahyadri-ai',  label: 'Sahyadri\nAI 507',       x: 32, y: 35, w: 13, h: 14, color: '#34C759', type: 'room' },
  { id: 'john-mccarthy',label: 'John\nMcCarthy\n506',    x: 48, y: 32, w: 13, h: 14, color: '#34C759', type: 'room' },
  { id: 'aiml-board',   label: 'AIML\nBoard\nRoom',      x: 48, y: 50, w: 13, h: 12, color: '#FF9500', type: 'room' },
  { id: 'aiml-faculty', label: 'AIML\nFaculty',          x: 64, y: 32, w: 13, h: 14, color: '#FF9500', type: 'room' },
  { id: 'staff-room',   label: 'Staff\nRoom',            x: 64, y: 50, w: 13, h: 12, color: '#FF9500', type: 'room' },
  { id: 'back-lift',    label: 'Back\nLift',             x: 87, y: 42, w: 8,  h: 10, color: '#5856D6', type: 'lift' },
  { id: 'cybersecurity',label: 'Cyber\nSec TR501',       x: 32, y: 62, w: 13, h: 14, color: '#34C759', type: 'room' },
  { id: 'peter-naur',   label: 'Peter\nNaur 502',        x: 48, y: 62, w: 13, h: 14, color: '#34C759', type: 'room' },
];

const CORRIDOR_Y = 47;

const START_POINTS = [
  {
    id: 'front-lift',
    label: '🛗 Front Lift',
    subtitle: 'Main entrance side',
    steps: {
      'Kevin Ashton IoT Lab': 10,
      'Sahyadri AI Computing Lab': 24,
      'John McCarthy Lab': 44,
      'AIML Board Room': 44,
      'AIML Faculty Room': 54,
      'Staff Room': 54,
      'MTech Cybersecurity Research Lab': 26,
      'Peter Naur Data Science Lab': 32,
    },
  },
  {
    id: 'back-lift',
    label: '🛗 Back Lift',
    subtitle: 'Back entrance side',
    steps: {
      'Kevin Ashton IoT Lab': 56,
      'Sahyadri AI Computing Lab': 38,
      'John McCarthy Lab': 21,
      'AIML Board Room': 23,
      'AIML Faculty Room': 11,
      'Staff Room': 23,
      'MTech Cybersecurity Research Lab': 66,
      'Peter Naur Data Science Lab': 72,
    },
  },
  {
    id: 'ground-entrance',
    label: '🚪 Ground Floor Entrance',
    subtitle: 'BSN Block main entrance',
    steps: {
      'Kevin Ashton IoT Lab': 85,
      'Sahyadri AI Computing Lab': 99,
      'John McCarthy Lab': 119,
      'AIML Board Room': 119,
      'AIML Faculty Room': 129,
      'Staff Room': 129,
      'MTech Cybersecurity Research Lab': 101,
      'Peter Naur Data Science Lab': 107,
    },
  },
];

const NAME_TO_MAP_ID = {
  'Kevin Ashton IoT Lab': 'kevin-ashton',
  'Sahyadri AI Computing Lab': 'sahyadri-ai',
  'John McCarthy Lab': 'john-mccarthy',
  'AIML Board Room': 'aiml-board',
  'AIML Faculty Room': 'aiml-faculty',
  'Staff Room': 'staff-room',
  'MTech Cybersecurity Research Lab': 'cybersecurity',
  'Peter Naur Data Science Lab': 'peter-naur',
};

function FloorMap({ locationName, startPointId }) {
  const MAP_W = width - SPACING.lg * 2;
  const MAP_H = MAP_W * 0.55;
  const targetMapId = NAME_TO_MAP_ID[locationName];

  return (
    <View style={[styles.mapContainer, { height: MAP_H }]}>
      <View style={[styles.corridor, { top: `${CORRIDOR_Y}%`, left: '5%', right: '5%' }]} />
      {FLOOR_5_ROOMS.map((room) => {
        const isTarget = room.id === targetMapId;
        const isStart =
          (startPointId === 'front-lift' && room.id === 'front-lift') ||
          (startPointId === 'back-lift' && room.id === 'back-lift');
        return (
          <View
            key={room.id}
            style={[
              styles.mapRoom,
              {
                left: `${room.x}%`,
                top: `${room.y}%`,
                width: `${room.w}%`,
                height: `${room.h}%`,
                backgroundColor: isTarget ? COLORS.danger : isStart ? '#5856D6' : room.type === 'lift' ? '#C7C7CC' : '#D1F0DC',
                borderColor: isTarget ? COLORS.danger : isStart ? '#3634A3' : room.color,
                borderWidth: isTarget || isStart ? 2 : 1,
                transform: isTarget ? [{ scale: 1.05 }] : [],
              },
            ]}
          >
            <Text
              style={[styles.mapRoomText, { color: isTarget || isStart ? COLORS.white : '#1C1C1E' }]}
              numberOfLines={3}
            >
              {room.label}
            </Text>
          </View>
        );
      })}
      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.legendText}>Destination</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#5856D6' }]} />
          <Text style={styles.legendText}>Start</Text>
        </View>
      </View>
    </View>
  );
}

export default function LocationDetailScreen({ navigation, route }) {
  const { location } = route.params || {};
  const [selectedStart, setSelectedStart] = useState(null);
  const [stepCount, setStepCount] = useState(null);
  const [recommendedLift, setRecommendedLift] = useState(null);

  useEffect(() => {
    if (!location) navigation.goBack();
  }, [location]);

  useEffect(() => {
    if (!selectedStart || !location) return;
    const startData = START_POINTS.find((s) => s.id === selectedStart);
    if (!startData) return;
    const steps = startData.steps[location.name];
    setStepCount(steps ?? null);
    if (selectedStart === 'ground-entrance') {
      const frontSteps = START_POINTS[0].steps[location.name];
      const backSteps = START_POINTS[1].steps[location.name];
      if (frontSteps !== undefined && backSteps !== undefined) {
        setRecommendedLift(frontSteps <= backSteps ? 'Front Lift' : 'Back Lift');
      }
    } else {
      setRecommendedLift(null);
    }
  }, [selectedStart, location]);

  if (!location) return null;

  const distanceMeters = stepCount ? (stepCount * 0.75).toFixed(0) : null;
  const walkMinutes = stepCount ? Math.ceil(stepCount / 100) : null;

  return (
    <Screen style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>
          {location.name}
        </Text>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Room Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏢</Text>
            <View>
              <Text style={styles.infoLabel}>Building</Text>
              <Text style={styles.infoValue}>{location.building || 'BSN Block'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🪜</Text>
            <View>
              <Text style={styles.infoLabel}>Floor</Text>
              <Text style={styles.infoValue}>
                {location.floor !== undefined ? `Floor ${location.floor}` : 'Floor 5'}
              </Text>
            </View>
          </View>
          {location.roomNumber ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🚪</Text>
                <View>
                  <Text style={styles.infoLabel}>Room Number</Text>
                  <Text style={styles.infoValue}>Room {location.roomNumber}</Text>
                </View>
              </View>
            </>
          ) : null}
          {location.description ? (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>About</Text>
                  <Text style={styles.infoValue}>{location.description}</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* ── 📡 Live Navigate Button ── */}
        {/* Placed prominently at top so users see it before scrolling */}
        <TouchableOpacity
          style={styles.liveNavBtn}
          onPress={() => navigation.navigate('LiveNavigation', { destination: location })}
        >
          <View style={styles.liveNavInner}>
            <Text style={styles.liveNavIcon}>📡</Text>
            <View>
              <Text style={styles.liveNavBtnText}>Live Navigate</Text>
              <Text style={styles.liveNavSubtext}>GPS tracking + crowd heatmap</Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.livePillDot} />
              <Text style={styles.livePillText}>LIVE</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Starting Point Picker */}
        <Text style={styles.sectionTitle}>📍 Where are you starting from?</Text>
        {START_POINTS.map((point) => (
          <TouchableOpacity
            key={point.id}
            style={[styles.startCard, selectedStart === point.id && styles.startCardSelected]}
            onPress={() => setSelectedStart(point.id)}
          >
            <View style={styles.startCardInner}>
              <Text style={styles.startLabel}>{point.label}</Text>
              <Text style={styles.startSubtitle}>{point.subtitle}</Text>
            </View>
            {selectedStart === point.id && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}

        {/* Navigation Guide */}
        {selectedStart && (
          <View style={styles.stepCard}>
            {stepCount !== null ? (
              <>
                <Text style={styles.stepCardTitle}>Navigation Guide</Text>
                <View style={styles.stepCountRow}>
                  <View style={styles.stepStat}>
                    <Text style={styles.stepNumber}>{stepCount}</Text>
                    <Text style={styles.stepUnit}>steps</Text>
                  </View>
                  <View style={styles.stepDividerV} />
                  <View style={styles.stepStat}>
                    <Text style={styles.stepNumber}>{distanceMeters}</Text>
                    <Text style={styles.stepUnit}>meters</Text>
                  </View>
                  <View style={styles.stepDividerV} />
                  <View style={styles.stepStat}>
                    <Text style={styles.stepNumber}>~{walkMinutes}</Text>
                    <Text style={styles.stepUnit}>min walk</Text>
                  </View>
                </View>

                {recommendedLift && (
                  <View style={styles.liftTip}>
                    <Text style={styles.liftTipIcon}>💡</Text>
                    <Text style={styles.liftTipText}>
                      Take the <Text style={styles.liftTipBold}>{recommendedLift}</Text> to Floor 5 — it's closer to {location.name}.
                    </Text>
                  </View>
                )}

                {selectedStart === 'front-lift' && (
                  <View style={styles.directionSteps}>
                    <Text style={styles.directionTitle}>Directions</Text>
                    <Text style={styles.directionStep}>1. Take the Front Lift to Floor 5</Text>
                    <Text style={styles.directionStep}>2. Exit the lift and walk along the corridor</Text>
                    <Text style={styles.directionStep}>
                      3. {location.name} is on your{' '}
                      {['Kevin Ashton IoT Lab','Sahyadri AI Computing Lab','John McCarthy Lab','AIML Faculty Room'].includes(location.name) ? 'left' : 'right'}{' '}
                      after ~{stepCount} steps
                    </Text>
                    {location.roomNumber && (
                      <Text style={styles.directionStep}>4. Look for Room {location.roomNumber}</Text>
                    )}
                  </View>
                )}

                {selectedStart === 'back-lift' && (
                  <View style={styles.directionSteps}>
                    <Text style={styles.directionTitle}>Directions</Text>
                    <Text style={styles.directionStep}>1. Take the Back Lift to Floor 5</Text>
                    <Text style={styles.directionStep}>2. Exit and walk towards the main corridor</Text>
                    <Text style={styles.directionStep}>3. {location.name} is ~{stepCount} steps ahead</Text>
                    {location.roomNumber && (
                      <Text style={styles.directionStep}>4. Look for Room {location.roomNumber}</Text>
                    )}
                  </View>
                )}

                {selectedStart === 'ground-entrance' && (
                  <View style={styles.directionSteps}>
                    <Text style={styles.directionTitle}>Directions</Text>
                    <Text style={styles.directionStep}>1. Enter BSN Block from the Main Entrance</Text>
                    <Text style={styles.directionStep}>
                      2. Take the <Text style={{ fontWeight: '700' }}>{recommendedLift}</Text> to Floor 5
                    </Text>
                    <Text style={styles.directionStep}>3. Walk ~{stepCount} steps to {location.name}</Text>
                    {location.roomNumber && (
                      <Text style={styles.directionStep}>4. Look for Room {location.roomNumber}</Text>
                    )}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noStepsContainer}>
                <Text style={styles.noStepsText}>⚠️ Step count unavailable for this route</Text>
              </View>
            )}
          </View>
        )}

        {/* Floor Map */}
        <Text style={styles.sectionTitle}>🗺️ Floor 5 Map</Text>
        <FloorMap locationName={location.name} startPointId={selectedStart} />

        <View style={{ height: SPACING.xl }} />
      </ScrollView>

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightGray },
  header: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: { marginBottom: SPACING.sm },
  backText: { fontSize: 18, color: COLORS.primary },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.black, lineHeight: 30 },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg, flexGrow: 1 },

  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: SPACING.sm, gap: SPACING.md },
  infoIcon: { fontSize: 22, width: 28, textAlign: 'center' },
  infoLabel: { fontSize: 12, color: COLORS.gray, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: '600', color: COLORS.black },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginLeft: 44 },

  // ── Live Navigate Button ──
  liveNavBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    elevation: 4,
  },
  liveNavInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  liveNavIcon: { fontSize: 28 },
  liveNavBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  liveNavSubtext: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  livePill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  livePillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  livePillText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: SPACING.md, marginTop: SPACING.sm },

  startCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
  },
  startCardSelected: { borderColor: COLORS.primary, backgroundColor: '#F0F8FF' },
  startCardInner: { flex: 1 },
  startLabel: { fontSize: 16, fontWeight: '600', color: COLORS.black, marginBottom: 2 },
  startSubtitle: { fontSize: 13, color: COLORS.gray },
  checkmark: { fontSize: 20, color: COLORS.primary, fontWeight: '700' },

  stepCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.lg,
    elevation: 6,
  },
  stepCardTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.md },
  stepCountRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
  stepStat: { alignItems: 'center' },
  stepNumber: { fontSize: 34, fontWeight: '800', color: COLORS.white },
  stepUnit: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  stepDividerV: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 4 },
  liftTip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: SPACING.md, marginBottom: SPACING.md, gap: SPACING.sm, alignItems: 'flex-start' },
  liftTipIcon: { fontSize: 16 },
  liftTipText: { flex: 1, color: COLORS.white, fontSize: 14, lineHeight: 20 },
  liftTipBold: { fontWeight: '700' },
  directionSteps: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: SPACING.md },
  directionTitle: { color: COLORS.white, fontWeight: '700', fontSize: 14, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  directionStep: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22, marginBottom: 4 },
  noStepsContainer: { alignItems: 'center', paddingVertical: SPACING.md },
  noStepsText: { color: COLORS.white, fontSize: 15 },

  mapContainer: { backgroundColor: '#E8F4FF', borderRadius: 16, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#C5DCF5', marginBottom: SPACING.md },
  corridor: { position: 'absolute', height: 8, backgroundColor: '#B0C4DE', borderRadius: 4, zIndex: 1 },
  mapRoom: { position: 'absolute', borderRadius: 6, justifyContent: 'center', alignItems: 'center', padding: 2, zIndex: 2 },
  mapRoomText: { fontSize: 6.5, fontWeight: '600', textAlign: 'center', lineHeight: 9 },
  mapLegend: { position: 'absolute', bottom: 6, right: 8, flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 9, color: '#1C1C1E', fontWeight: '600' },
});