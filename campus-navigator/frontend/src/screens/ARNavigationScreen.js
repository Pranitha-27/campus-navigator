// src/screens/ARNavigationScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Platform, StatusBar, Vibration, Modal, FlatList
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

// 🛑 IMPORTANT: These are the exact labs from your seed file.
// You MUST replace the latitude/longitude below with the real GPS coordinates of your college building for the AR compass to point correctly!
const CAMPUS_LABS = [
  // 1st Floor
  { id: '1', name: 'BOT Lab', floor: 1, latitude: 12.971598, longitude: 77.594562, icon: 'flask' },
  { id: '2', name: 'IoT Lab', floor: 1, latitude: 12.971600, longitude: 77.594600, icon: 'wifi' },
  // 2nd Floor
  { id: '3', name: 'Von Neumann Lab', floor: 2, latitude: 12.971605, longitude: 77.594605, icon: 'desktop' },
  // 5th Floor
  { id: '4', name: 'Kevin Ashton IoT Lab', floor: 5, latitude: 12.971610, longitude: 77.594610, icon: 'wifi' },
  { id: '5', name: 'Sahyadri AI Computing Lab', floor: 5, latitude: 12.971615, longitude: 77.594615, icon: 'brain' },
  { id: '6', name: 'John McCarthy Lab', floor: 5, latitude: 12.971620, longitude: 77.594620, icon: 'robot' },
  { id: '7', name: 'AIML Board Room', floor: 5, latitude: 12.971625, longitude: 77.594625, icon: 'users' },
  { id: '8', name: 'AIML Faculty Room', floor: 5, latitude: 12.971630, longitude: 77.594630, icon: 'chalkboard-teacher' },
  { id: '9', name: 'Staff Room', floor: 5, latitude: 12.971635, longitude: 77.594635, icon: 'user-tie' },
  { id: '10', name: 'MTech Cybersecurity Research Lab', floor: 5, latitude: 12.971640, longitude: 77.594640, icon: 'shield-alt' },
  { id: '11', name: 'Peter Naur Data Science Lab', floor: 5, latitude: 12.971645, longitude: 77.594645, icon: 'database' },
];

// Normalize angle difference to -180..180
const angleDiff = (target, current) => {
  let diff = ((target - current) % 360 + 360) % 360;
  if (diff > 180) diff -= 360;
  return diff;
};

// Calculate the true bearing (0-360 degrees) between two GPS coordinates
const calculateBearing = (startLat, startLon, endLat, endLon) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLonRad = (startLon * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLonRad = (endLon * Math.PI) / 180;

  const y = Math.sin(endLonRad - startLonRad) * Math.cos(endLatRad);
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
    Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLonRad - startLonRad);

  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
};

export default function ARNavigationScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  
  // Navigation State
  const [selectedLab, setSelectedLab] = useState(null);
  const [showPicker, setShowPicker] = useState(true);
  const [heading, setHeading] = useState(0);
  const [dynamicBearing, setDynamicBearing] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [distanceToTarget, setDistanceToTarget] = useState(0);

  // Animations
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const alignedFadeAnim = useRef(new Animated.Value(0)).current;

  // --- Permissions ---
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && locationStatus === 'granted');
    })();
  }, []);

  // --- Real-time GPS Location Tracking ---
  useEffect(() => {
    if (!hasPermission || !selectedLab) return;

    let locationSub;
    (async () => {
      locationSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 1 },
        (newLocation) => {
          const myLat = newLocation.coords.latitude;
          const myLon = newLocation.coords.longitude;
          
          // 1. Calculate direction (bearing)
          const bearing = calculateBearing(myLat, myLon, selectedLab.latitude, selectedLab.longitude);
          setDynamicBearing(bearing);

          // 2. Calculate rough distance in meters
          const R = 6371e3;
          const φ1 = myLat * Math.PI/180;
          const φ2 = selectedLab.latitude * Math.PI/180;
          const Δφ = (selectedLab.latitude - myLat) * Math.PI/180;
          const Δλ = (selectedLab.longitude - myLon) * Math.PI/180;
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          setDistanceToTarget(Math.round(R * c));
        }
      );
    })();

    return () => { if (locationSub) locationSub.remove(); };
  }, [hasPermission, selectedLab]);

  // --- Magnetometer for compass heading ---
  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHeading(Math.round(angle));
    });
    return () => sub.remove();
  }, []);

  // --- Compute arrow rotation ---
  useEffect(() => {
    if (!selectedLab) return;

    const diff = angleDiff(dynamicBearing, heading);
    const rotation = Math.max(-70, Math.min(70, diff * 0.9));
    
    Animated.spring(arrowAnim, { toValue: rotation, useNativeDriver: true, tension: 80, friction: 10 }).start();
    
    const aligned = Math.abs(diff) < 20;
    setIsAligned(aligned);
    
    Animated.timing(alignedFadeAnim, { toValue: aligned ? 1 : 0, duration: 300, useNativeDriver: true }).start();
  }, [heading, dynamicBearing, selectedLab]);

  // --- Idle Animations ---
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

  const selectLab = (lab) => {
    setSelectedLab(lab);
    setShowPicker(false);
    if (voiceEnabled) {
      Speech.stop();
      Speech.speak(`Navigating to ${lab.name}. Follow the arrow.`, { language: 'en-IN', rate: 0.9 });
    }
    Vibration.vibrate(100);
  };

  const handleEnd = () => {
    Speech.stop();
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permContainer}>
        <Ionicons name="location" size={48} color="#00C6FF" />
        <Text style={styles.permText}>Requesting camera & location access...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permContainer}>
        <Ionicons name="warning" size={48} color="#FF6B6B" />
        <Text style={styles.permText}>Permissions required for AR navigation.</Text>
      </View>
    );
  }

  const arrowColor = isAligned ? '#4ECDC4' : '#00C6FF';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* --- Destination Picker Modal --- */}
      <Modal visible={showPicker} animationType="slide" transparent={true}>
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Where are you going?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.modalClose}>
                <Ionicons name="close" size={24} color="#556" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CAMPUS_LABS}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.labCard} onPress={() => selectLab(item)}>
                  <View style={styles.labIconCircle}>
                    <FontAwesome5 name={item.icon} size={20} color="#00C6FF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.labName}>{item.name}</Text>
                    <Text style={styles.labFloor}>Floor {item.floor}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#556" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Camera Background */}
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      
      {/* Dark overlay for readability */}
      <LinearGradient
        colors={['rgba(10,14,26,0.6)', 'transparent', 'rgba(10,14,26,0.9)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleEnd} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerCenter} onPress={() => setShowPicker(true)}>
          <View style={styles.arBadge}>
            <Text style={styles.arBadgeText}>AR</Text>
          </View>
          <Text style={styles.headerDest} numberOfLines={1}>
            {selectedLab ? selectedLab.name : "Select Lab"}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#00C6FF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setVoiceEnabled(v => !v); Speech.stop(); }} style={styles.voiceBtn}>
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
      {selectedLab && (
        <View style={styles.arCenter}>
          <Animated.View style={[styles.glowRing, {
            borderColor: arrowColor,
            opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.6] }),
            transform: [{ scale: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.3] }) }],
          }]} />

          <Animated.View style={[styles.arrowContainer, {
            transform: [{ rotate: arrowAnim.interpolate({ inputRange: [-70, 70], outputRange: ['-70deg', '70deg'] }) }, { scale: pulseAnim }]
          }]}>
            <View style={[styles.arrowCircle, { borderColor: arrowColor + '88', backgroundColor: arrowColor + '22' }]}>
              <Ionicons name="arrow-up" size={52} color={arrowColor} />
            </View>
          </Animated.View>

          <Animated.View style={[styles.alignedBadge, { opacity: alignedFadeAnim }]}>
            <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
            <Text style={styles.alignedText}>Aligned</Text>
          </Animated.View>
        </View>
      )}

      {/* Bottom Info Panel */}
      {selectedLab && (
        <View style={styles.stepPanel}>
          <View style={styles.stepPanelInner}>
            <Text style={styles.stepInstruction}>Follow the arrow to {selectedLab.name}</Text>
            
            <View style={styles.distRow}>
              <FontAwesome5 name="walking" size={14} color="#00C6FF" />
              <Text style={styles.distText}>{distanceToTarget} meters away</Text>
            </View>

            <TouchableOpacity style={styles.arrivedBtn} onPress={handleEnd}>
              <LinearGradient colors={['#4ECDC4', '#00C6FF']} style={styles.arrivedBtnGrad}>
                <Text style={styles.arrivedBtnText}>🏁 End Navigation</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permContainer: { flex: 1, backgroundColor: '#0A0E1A', alignItems: 'center', justifyContent: 'center', gap: 16 },
  permText: { color: '#aaa', fontSize: 15 },
  header: {
    position: 'absolute', top: Platform.OS === 'ios' ? 54 : 40, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, zIndex: 10,
  },
  closeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  arBadge: { backgroundColor: '#00C6FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  arBadgeText: { color: '#0A0E1A', fontSize: 12, fontWeight: '900' },
  headerDest: { color: '#fff', fontSize: 15, fontWeight: '700', maxWidth: 160 },
  voiceBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
  compassRow: {
    position: 'absolute', top: Platform.OS === 'ios' ? 108 : 94, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 10,
  },
  compassText: { color: '#00C6FF', fontSize: 14, fontWeight: '800' },
  compassLabel: { color: '#667', fontSize: 12 },
  arCenter: { position: 'absolute', top: height * 0.22, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  glowRing: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 2 },
  arrowContainer: { alignItems: 'center', justifyContent: 'center' },
  arrowCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  alignedBadge: { position: 'absolute', bottom: -44, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#4ECDC411', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#4ECDC444' },
  alignedText: { color: '#4ECDC4', fontSize: 13, fontWeight: '700' },
  gridOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,198,255,0.08)' },
  stepPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  stepPanelInner: { margin: 16, backgroundColor: 'rgba(10,14,26,0.92)', borderRadius: 22, padding: 20, borderWidth: 1, borderColor: 'rgba(0,198,255,0.2)', gap: 14 },
  stepInstruction: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' },
  distRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  distText: { color: '#00C6FF', fontSize: 15, fontWeight: '600' },
  arrivedBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  arrivedBtnGrad: { paddingVertical: 15, alignItems: 'center' },
  arrivedBtnText: { color: '#0A0E1A', fontSize: 16, fontWeight: '800' },
  
  // Modal Styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#0A0E1A', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: height * 0.7 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  modalClose: { padding: 4 },
  labCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1A2235', gap: 14 },
  labIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#00C6FF11', alignItems: 'center', justifyContent: 'center' },
  labName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  labFloor: { color: '#556', fontSize: 13, marginTop: 2 }
});