// src/screens/ARNavigationScreen.js
// AR Navigation using expo-camera + expo-sensors for compass heading + arrow overlays

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Platform, StatusBar, Vibration, Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import { Magnetometer } from 'expo-sensors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

const DEMO_STEPS = [
  { instruction: 'Walk straight ahead', bearing: 0, distance: 30, type: 'straight', floor: 1 },
  { instruction: 'Turn left at the notice board', bearing: 270, distance: 15, type: 'left', floor: 1 },
  { instruction: 'Take stairs to Floor 5', bearing: 0, distance: 0, type: 'stairs', floor: 5 },
  { instruction: 'Turn right — IoT Lab ahead', bearing: 90, distance: 20, type: 'right', floor: 5 },
  { instruction: "You've arrived at IoT Lab", bearing: 0, distance: 0, type: 'destination', floor: 5 },
];

// Normalize angle difference to -180..180
const angleDiff = (target, current) => {
  let diff = ((target - current) % 360 + 360) % 360;
  if (diff > 180) diff -= 360;
  return diff;
};

export default function ARNavigationScreen({ route, navigation }) {
  const { destination = 'IoT Lab', steps = DEMO_STEPS } = route?.params || {};

  const [hasPermission, setHasPermission] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [heading, setHeading] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const arrowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const alignedFadeAnim = useRef(new Animated.Value(0)).current;

  const step = steps[currentStep] || DEMO_STEPS[0];
  const isLastStep = currentStep === steps.length - 1;

  // --- Permissions ---
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // --- Magnetometer for compass heading ---
  useEffect(() => {
    Magnetometer.setUpdateInterval(200);
    const sub = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(Math.round(angle));
    });
    return () => sub.remove();
  }, []);

  // --- Compute arrow rotation from heading vs target bearing ---
  useEffect(() => {
    const diff = angleDiff(step.bearing, heading);
    const rotation = Math.max(-70, Math.min(70, diff * 0.9));
    Animated.spring(arrowAnim, { toValue: rotation, useNativeDriver: true, tension: 80, friction: 10 }).start();
    const aligned = Math.abs(diff) < 20;
    setIsAligned(aligned);
    Animated.timing(alignedFadeAnim, { toValue: aligned ? 1 : 0, duration: 300, useNativeDriver: true }).start();
    if (aligned && voiceEnabled && step.type !== 'destination') {
      // Subtle gentle confirmation — speak once when aligned
    }
  }, [heading, currentStep]);

  // --- Pulse arrow ---
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Announce step on change
  useEffect(() => {
    if (voiceEnabled) Speech.speak(step.instruction, { language: 'en-IN', rate: 0.9 });
    Vibration.vibrate(80);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(p => p + 1);
    else { Speech.stop(); navigation.goBack(); }
  };

  const handleEnd = () => {
    Speech.stop();
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permContainer}>
        <Ionicons name="camera" size={48} color="#00C6FF" />
        <Text style={styles.permText}>Requesting camera access...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permContainer}>
        <Ionicons name="camera-off" size={48} color="#FF6B6B" />
        <Text style={styles.permText}>Camera permission required for AR navigation.</Text>
        <TouchableOpacity style={styles.fallbackBtn} onPress={() => navigation.navigate('TurnByTurn', { destination, steps })}>
          <Text style={styles.fallbackBtnText}>Use Turn-by-Turn instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const arrowColor = isAligned ? '#4ECDC4' : '#00C6FF';
  const stepTypeIcon = {
    straight: 'arrow-up', left: 'arrow-back', right: 'arrow-forward',
    stairs: 'layers', destination: 'location', 'slight-left': 'arrow-back',
    'slight-right': 'arrow-forward',
  }[step.type] || 'arrow-up';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Camera Background */}
      <Camera style={StyleSheet.absoluteFillObject} type={Camera.Constants?.Type?.back || 'back'} />

      {/* Dark overlay for readability */}
      <LinearGradient
        colors={['rgba(10,14,26,0.5)', 'transparent', 'rgba(10,14,26,0.85)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEnd} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.arBadge}>
            <Text style={styles.arBadgeText}>AR</Text>
          </View>
          <Text style={styles.headerDest} numberOfLines={1}>{destination}</Text>
        </View>
        <TouchableOpacity
          onPress={() => { setVoiceEnabled(v => !v); if (voiceEnabled) Speech.stop(); }}
          style={styles.voiceBtn}
        >
          <Ionicons name={voiceEnabled ? 'volume-high' : 'volume-mute'} size={20} color={voiceEnabled ? '#00C6FF' : '#667'} />
        </TouchableOpacity>
      </View>

      {/* Compass Heading */}
      <View style={styles.compassRow}>
        <Ionicons name="compass" size={14} color="#00C6FF" />
        <Text style={styles.compassText}>{heading}°</Text>
        <Text style={styles.compassLabel}>
          {heading < 22 || heading > 338 ? 'N' : heading < 68 ? 'NE' : heading < 112 ? 'E' : heading < 157 ? 'SE' : heading < 202 ? 'S' : heading < 247 ? 'SW' : heading < 292 ? 'W' : 'NW'}
        </Text>
      </View>

      {/* Main AR Arrow */}
      <View style={styles.arCenter}>
        {/* Glow ring */}
        <Animated.View style={[styles.glowRing, {
          borderColor: arrowColor,
          opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
          transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.3] }) }],
        }]} />

        {/* Arrow */}
        <Animated.View style={[styles.arrowContainer, {
          transform: [{ rotate: arrowAnim.interpolate({ inputRange: [-70, 70], outputRange: ['-70deg', '70deg'] }) }, { scale: pulseAnim }]
        }]}>
          <View style={[styles.arrowCircle, { borderColor: arrowColor + '88', backgroundColor: arrowColor + '22' }]}>
            <Ionicons name={stepTypeIcon} size={52} color={arrowColor} />
          </View>
        </Animated.View>

        {/* Aligned Checkmark */}
        <Animated.View style={[styles.alignedBadge, { opacity: alignedFadeAnim }]}>
          <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
          <Text style={styles.alignedText}>Aligned</Text>
        </Animated.View>
      </View>

      {/* AR Grid Lines (purely decorative) */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {[0.3, 0.5, 0.7].map(y => (
          <View key={y} style={[styles.gridLine, { top: `${y * 100}%` }]} />
        ))}
      </View>

      {/* Step Info Panel */}
      <View style={styles.stepPanel}>
        <View style={styles.stepPanelInner}>
          {/* Progress dots */}
          <View style={styles.progressDots}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i === currentStep && styles.dotActive, i < currentStep && styles.dotDone]} />
            ))}
          </View>

          <Text style={styles.stepInstruction}>{step.instruction}</Text>

          {step.distance > 0 && (
            <View style={styles.distRow}>
              <FontAwesome5 name="walking" size={12} color="#00C6FF" />
              <Text style={styles.distText}>{step.distance}m ahead</Text>
            </View>
          )}

          {step.type === 'stairs' && (
            <View style={styles.floorBanner}>
              <Ionicons name="layers" size={14} color="#FFE66D" />
              <Text style={styles.floorBannerText}>Proceed to Floor {step.floor}</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleNext} style={[styles.nextBtn, isLastStep && styles.arrivedBtn]}>
            <LinearGradient
              colors={isLastStep ? ['#4ECDC4', '#00C6FF'] : ['#00C6FF', '#0080FF']}
              style={styles.nextBtnGrad}
            >
              <Text style={styles.nextBtnText}>{isLastStep ? '🏁 Arrived!' : 'Next Step'}</Text>
              {!isLastStep && <Ionicons name="chevron-forward" size={18} color="#fff" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permContainer: { flex: 1, backgroundColor: '#0A0E1A', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  permText: { color: '#aaa', fontSize: 15, textAlign: 'center' },
  fallbackBtn: { backgroundColor: '#00C6FF', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  fallbackBtnText: { color: '#0A0E1A', fontSize: 15, fontWeight: '700' },
  header: {
    position: 'absolute', top: Platform.OS === 'ios' ? 54 : 40, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, zIndex: 10,
  },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  arBadge: { backgroundColor: '#00C6FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  arBadgeText: { color: '#0A0E1A', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  headerDest: { color: '#fff', fontSize: 15, fontWeight: '700', maxWidth: 160 },
  voiceBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  compassRow: {
    position: 'absolute', top: Platform.OS === 'ios' ? 108 : 94, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10,
  },
  compassText: { color: '#00C6FF', fontSize: 14, fontWeight: '800' },
  compassLabel: { color: '#667', fontSize: 12 },
  arCenter: {
    position: 'absolute', top: height * 0.22, left: 0, right: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 5,
  },
  glowRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2 },
  arrowContainer: { alignItems: 'center', justifyContent: 'center' },
  arrowCircle: {
    width: 130, height: 130, borderRadius: 65, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  alignedBadge: {
    position: 'absolute', bottom: -44, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#4ECDC411', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#4ECDC444',
  },
  alignedText: { color: '#4ECDC4', fontSize: 13, fontWeight: '700' },
  gridOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,198,255,0.08)' },
  stepPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  stepPanelInner: {
    margin: 16, backgroundColor: 'rgba(10,14,26,0.92)', borderRadius: 22, padding: 20,
    borderWidth: 1, borderColor: 'rgba(0,198,255,0.2)', gap: 10,
  },
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2A3450' },
  dotActive: { backgroundColor: '#00C6FF', width: 20, borderRadius: 3 },
  dotDone: { backgroundColor: '#4ECDC4' },
  stepInstruction: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 25 },
  distRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  distText: { color: '#00C6FF', fontSize: 13, fontWeight: '600' },
  floorBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFE66D11', borderRadius: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: '#FFE66D33',
  },
  floorBannerText: { color: '#FFE66D', fontSize: 13, fontWeight: '700' },
  nextBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  arrivedBtn: {},
  nextBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});