import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  ScrollView, Vibration, Dimensions, StatusBar, Platform
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Direction icons mapping
const DIRECTION_ICONS = {
  straight: 'arrow-up',
  left: 'arrow-back',
  right: 'arrow-forward',
  'slight-left': 'arrow-back',
  'slight-right': 'arrow-forward',
  'u-turn': 'refresh',
  stairs: 'layers',
  elevator: 'business',
  destination: 'location',
  start: 'navigate',
};

const DIRECTION_COLORS = {
  straight: '#00C6FF',
  left: '#FF6B6B',
  right: '#4ECDC4',
  stairs: '#FFE66D',
  elevator: '#A8E6CF',
  destination: '#FF6B6B',
  default: '#00C6FF',
};

export default function TurnByTurnScreen({ route, navigation }) {
  const { path = [], destination = 'IoT Lab', startLocation = 'Main Entrance' } = route?.params || {};

  // Demo steps if no path provided
  const steps = path.length > 0 ? path : [
    { instruction: 'Head straight from Main Entrance', direction: 'straight', distance: 30, landmark: 'Pass the reception desk' },
    { instruction: 'Turn left at the corridor', direction: 'left', distance: 15, landmark: 'Near the notice board' },
    { instruction: 'Take stairs to Floor 5', direction: 'stairs', distance: 0, landmark: 'BSN Block staircase' },
    { instruction: 'Turn right after stairs', direction: 'right', distance: 20, landmark: 'Near the water cooler' },
    { instruction: 'Slight left towards IoT Lab', direction: 'slight-left', distance: 10, landmark: 'Door labeled TR 501' },
    { instruction: 'You have arrived at IoT Lab', direction: 'destination', distance: 0, landmark: 'TR 501 - IoT Lab' },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [totalDistance] = useState(steps.reduce((acc, s) => acc + (s.distance || 0), 0));
  const [distanceCovered, setDistanceCovered] = useState(0);
  const [eta, setEta] = useState(Math.ceil(totalDistance / 50)); // ~50m/min walking

  // Animations
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startArrowAnimation();
    startPulseAnimation();
    speakStep(0);
  }, []);

  useEffect(() => {
    if (currentStep > 0) {
      animateStepChange();
      if (voiceEnabled) speakStep(currentStep);
      Vibration.vibrate(100);
      updateProgress();
    }
  }, [currentStep]);

  const startArrowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
        Animated.timing(arrowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const animateStepChange = () => {
    slideAnim.setValue(50);
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 100 }).start();
  };

  const updateProgress = () => {
    const covered = steps.slice(0, currentStep + 1).reduce((acc, s) => acc + (s.distance || 0), 0);
    setDistanceCovered(covered);
    const remaining = totalDistance - covered;
    setEta(Math.max(1, Math.ceil(remaining / 50)));
    Animated.timing(progressAnim, {
      toValue: covered / (totalDistance || 1),
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const speakStep = (stepIndex) => {
    if (!voiceEnabled) return;
    const step = steps[stepIndex];
    if (!step) return;
    Speech.stop();
    Speech.speak(step.instruction, {
      language: 'en-IN',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleEnd = () => {
    Speech.stop();
    navigation.goBack();
  };

  const currentStepData = steps[currentStep];
  const dirColor = DIRECTION_COLORS[currentStepData?.direction] || DIRECTION_COLORS.default;
  const iconName = DIRECTION_ICONS[currentStepData?.direction] || 'arrow-up';
  const isLastStep = currentStep === steps.length - 1;
  const progressPercent = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />

      {/* Header */}
      <LinearGradient colors={['#0A0E1A', '#0F172A']} style={styles.header}>
        <TouchableOpacity onPress={handleEnd} style={styles.backBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{destination}</Text>
          <Text style={styles.headerSub}>from {startLocation}</Text>
        </View>
        <TouchableOpacity onPress={() => { setVoiceEnabled(v => !v); Speech.stop(); }} style={styles.voiceBtn}>
          <Ionicons name={voiceEnabled ? 'volume-high' : 'volume-mute'} size={22} color={voiceEnabled ? '#00C6FF' : '#555'} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, {
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
          }]} />
        </View>
        <Text style={styles.progressText}>{currentStep}/{steps.length - 1} steps</Text>
      </View>

      {/* Main Direction Card */}
      <View style={styles.mainCard}>
        <LinearGradient
          colors={['#0F172A', '#1A2235']}
          style={styles.directionCard}
        >
          {/* Direction Icon */}
          <Animated.View style={[styles.iconCircle, {
            backgroundColor: dirColor + '22',
            borderColor: dirColor + '66',
            transform: [{ translateY: arrowAnim }, { scale: pulseAnim }]
          }]}>
            <Ionicons name={iconName} size={56} color={dirColor} />
          </Animated.View>

          {/* Instruction */}
          <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
            <Text style={[styles.instruction, { color: dirColor }]}>
              {currentStepData?.instruction}
            </Text>
          </Animated.View>

          {/* Distance Badge */}
          {currentStepData?.distance > 0 && (
            <View style={[styles.distanceBadge, { backgroundColor: dirColor + '22', borderColor: dirColor }]}>
              <FontAwesome5 name="walking" size={12} color={dirColor} />
              <Text style={[styles.distanceText, { color: dirColor }]}>
                {currentStepData.distance}m
              </Text>
            </View>
          )}

          {/* Landmark */}
          {currentStepData?.landmark && (
            <View style={styles.landmarkRow}>
              <Ionicons name="bookmark-outline" size={14} color="#888" />
              <Text style={styles.landmarkText}>{currentStepData.landmark}</Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <MaterialIcons name="timer" size={18} color="#00C6FF" />
          <Text style={styles.statValue}>{eta} min</Text>
          <Text style={styles.statLabel}>ETA</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <FontAwesome5 name="route" size={16} color="#4ECDC4" />
          <Text style={styles.statValue}>{totalDistance - distanceCovered}m</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Ionicons name="footsteps" size={18} color="#FFE66D" />
          <Text style={styles.statValue}>{distanceCovered}m</Text>
          <Text style={styles.statLabel}>Covered</Text>
        </View>
      </View>

      {/* Steps Timeline */}
      <View style={styles.timelineHeader}>
        <Text style={styles.timelineTitle}>All Steps</Text>
      </View>
      <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          const ic = DIRECTION_ICONS[step.direction] || 'arrow-up';
          const dc = DIRECTION_COLORS[step.direction] || DIRECTION_COLORS.default;
          return (
            <TouchableOpacity key={index} onPress={() => setCurrentStep(index)}>
              <View style={[styles.timelineItem, isActive && styles.timelineItemActive]}>
                <View style={[styles.timelineDot, {
                  backgroundColor: isDone ? '#4ECDC4' : isActive ? dc : '#2A3450',
                  borderColor: isActive ? dc : isDone ? '#4ECDC4' : '#3A4460',
                }]}>
                  {isDone
                    ? <Ionicons name="checkmark" size={12} color="#0A0E1A" />
                    : <Ionicons name={ic} size={12} color={isActive ? dc : '#555'} />
                  }
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: isDone ? '#4ECDC4' : '#2A3450' }]} />
                )}
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineText, isActive && { color: '#fff' }, isDone && { color: '#4ECDC4' }]}>
                    {step.instruction}
                  </Text>
                  {step.distance > 0 && (
                    <Text style={styles.timelineDistance}>{step.distance}m</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.ctrlBtn, currentStep === 0 && styles.ctrlBtnDisabled]}
          onPress={handlePrev}
          disabled={currentStep === 0}
        >
          <Ionicons name="chevron-back" size={24} color={currentStep === 0 ? '#333' : '#fff'} />
          <Text style={[styles.ctrlLabel, currentStep === 0 && { color: '#333' }]}>Prev</Text>
        </TouchableOpacity>

        {isLastStep ? (
          <TouchableOpacity style={styles.arriveBtn} onPress={handleEnd}>
            <LinearGradient colors={['#4ECDC4', '#00C6FF']} style={styles.arriveBtnGrad}>
              <Ionicons name="flag" size={22} color="#0A0E1A" />
              <Text style={styles.arriveBtnText}>Arrived!</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <LinearGradient colors={['#00C6FF', '#0080FF']} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>Next Step</Text>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.ctrlBtn} onPress={() => speakStep(currentStep)}>
          <Ionicons name="volume-medium" size={24} color="#00C6FF" />
          <Text style={[styles.ctrlLabel, { color: '#00C6FF' }]}>Repeat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 40,
    paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 8, borderRadius: 20, backgroundColor: '#1A2235' },
  headerCenter: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  headerSub: { color: '#556', fontSize: 12, marginTop: 2 },
  voiceBtn: { padding: 8, borderRadius: 20, backgroundColor: '#1A2235' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#1A2235', borderRadius: 2, marginRight: 10 },
  progressFill: { height: '100%', backgroundColor: '#00C6FF', borderRadius: 2 },
  progressText: { color: '#556', fontSize: 12 },
  mainCard: { paddingHorizontal: 16, marginBottom: 12 },
  directionCard: {
    borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#1A2235',
  },
  iconCircle: {
    width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, marginBottom: 20,
  },
  instruction: { fontSize: 20, fontWeight: '700', textAlign: 'center', letterSpacing: 0.3, lineHeight: 28 },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 12,
  },
  distanceText: { fontSize: 13, fontWeight: '700' },
  landmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  landmarkText: { color: '#667', fontSize: 13 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    marginHorizontal: 16, backgroundColor: '#0F172A', borderRadius: 16,
    paddingVertical: 14, marginBottom: 12, borderWidth: 1, borderColor: '#1A2235',
  },
  statBox: { alignItems: 'center', gap: 4 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  statLabel: { color: '#556', fontSize: 11 },
  statDivider: { width: 1, height: 30, backgroundColor: '#1A2235' },
  timelineHeader: { paddingHorizontal: 20, paddingBottom: 8 },
  timelineTitle: { color: '#667', fontSize: 13, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  timeline: { flex: 1, paddingHorizontal: 16 },
  timelineItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, paddingHorizontal: 4 },
  timelineItemActive: { backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 8 },
  timelineDot: {
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, zIndex: 2, marginTop: 2,
  },
  timelineLine: { position: 'absolute', left: 15, top: 26, width: 2, height: 24 },
  timelineContent: { flex: 1, marginLeft: 12 },
  timelineText: { color: '#556', fontSize: 14, fontWeight: '500' },
  timelineDistance: { color: '#3A4460', fontSize: 12, marginTop: 2 },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#0F172A',
  },
  ctrlBtn: { alignItems: 'center', gap: 4, padding: 8 },
  ctrlBtnDisabled: { opacity: 0.3 },
  ctrlLabel: { color: '#fff', fontSize: 11, fontWeight: '500' },
  nextBtn: { flex: 1, marginHorizontal: 12, borderRadius: 16, overflow: 'hidden' },
  nextBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  arriveBtn: { flex: 1, marginHorizontal: 12, borderRadius: 16, overflow: 'hidden' },
  arriveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  arriveBtnText: { color: '#0A0E1A', fontSize: 17, fontWeight: '800' },
});