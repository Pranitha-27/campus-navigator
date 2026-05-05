import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, Platform, StatusBar, Modal
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ─── Feature cards ───────────────────────────────────────────────────────────
const FEATURES = [
  { icon: 'navigate',     label: 'Navigate',      desc: 'Find any lab or room',         screen: 'NavigationHome', color: '#00C6FF', gradient: ['#00C6FF22', '#0080FF11'] },
  { icon: 'layers',       label: 'AR View',        desc: 'Augmented reality compass',    screen: 'ARNavigation',   color: '#FF6B6B', gradient: ['#FF6B6B22', '#FF000011'] },
  { icon: 'flame',        label: 'Crowd Map',      desc: 'Live crowd density heatmap',   screen: 'CrowdHeatmap',   color: '#FFE66D', gradient: ['#FFE66D22', '#FF8C0011'] },
  { icon: 'people',       label: 'Social Nav',     desc: 'Navigate with friends',        screen: 'SocialNavigation', color: '#4ECDC4', gradient: ['#4ECDC422', '#00C6FF11'] },
  { icon: 'map-outline',  label: 'Building Map',   desc: 'Interactive floor plans',      screen: 'BuildingMap',    color: '#C5A3FF', gradient: ['#C5A3FF22', '#8B5CF611'] },
  { icon: 'volume-high',  label: 'Voice',          desc: 'Customize voice guidance',     screen: 'VoiceSettings',  color: '#A8E6CF', gradient: ['#A8E6CF22', '#4ECDC411'] },
];

// ─── Navigation Mode Modal ───────────────────────────────────────────────────
function NavModeModal({ visible, onClose, onSelect }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 8 }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const OPTIONS = [
    {
      key: 'browse',
      icon: 'search',
      color: '#00C6FF',
      title: 'Browse & Navigate',
      desc: 'Search for labs, rooms, and buildings from a list. Tap any location to get directions.',
    },
    {
      key: 'qr',
      icon: 'qr-code',
      color: '#4ECDC4',
      title: 'Scan QR Code',
      desc: 'Point your camera at a QR code placed near a room entrance to jump straight to it.',
    },
  ];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.modalTitle}>How do you want to navigate?</Text>
          <Text style={styles.modalSub}>Choose a method to find your destination</Text>

          {OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.optionBtn, { borderColor: opt.color + '44' }]}
              onPress={() => { onClose(); onSelect(opt.key); }}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIcon, { backgroundColor: opt.color + '22' }]}>
                <Ionicons name={opt.icon} size={26} color={opt.color} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={opt.color} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Feature Card ────────────────────────────────────────────────────────────
const FeatureCard = ({ feature, onPress, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
      width: (width - 48) / 2,
    }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <LinearGradient colors={feature.gradient} style={[styles.featureCard, { borderColor: feature.color + '33' }]}>
          <View style={[styles.featureIcon, { backgroundColor: feature.color + '22' }]}>
            <Ionicons name={feature.icon} size={26} color={feature.color} />
          </View>
          <Text style={styles.featureLabel}>{feature.label}</Text>
          <Text style={styles.featureDesc}>{feature.desc}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const headerAnim   = useRef(new Animated.Value(0)).current;
  const [showNavModal, setShowNavModal] = useState(false);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleNavSelect = (mode) => {
    if (mode === 'qr')     navigation.navigate('QRScanner');
    if (mode === 'browse') navigation.navigate('NavigationHome');
  };

  const handleFeaturePress = (screen) => {
    // Navigate and Browse Map both show the choice modal
    if (screen === 'NavigationHome') {
      setShowNavModal(true);
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0E1A', '#0F172A']} style={StyleSheet.absoluteFillObject} />

      <NavModeModal
        visible={showNavModal}
        onClose={() => setShowNavModal(false)}
        onSelect={handleNavSelect}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View style={{
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
        }}>
          <LinearGradient colors={['#00C6FF22', 'transparent']} style={styles.headerGrad}>
            <View style={styles.logoRow}>
              <View style={styles.logoCircle}>
                <FontAwesome5 name="university" size={22} color="#00C6FF" />
              </View>
              <View>
                <Text style={styles.appName}>Campus Navigator</Text>
                <Text style={styles.appSub}>Smart indoor navigation system</Text>
              </View>
            </View>
            <Text style={styles.welcomeText}>Where do you want to go?</Text>
          </LinearGradient>
        </Animated.View>

        {/* Big CTA — shows modal */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => setShowNavModal(true)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#00C6FF', '#0080FF']} style={styles.ctaGrad}>
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.ctaText}>Find a Location</Text>
            <Ionicons name="chevron-forward" size={18} color="#ffffff88" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick access row */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('NavigationHome')}>
            <Ionicons name="search" size={18} color="#00C6FF" />
            <Text style={styles.quickLabel}>Browse Labs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('QRScanner')}>
            <Ionicons name="qr-code" size={18} color="#4ECDC4" />
            <Text style={styles.quickLabel}>Scan QR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('BuildingMap')}>
            <Ionicons name="map-outline" size={18} color="#C5A3FF" />
            <Text style={styles.quickLabel}>Floor Map</Text>
          </TouchableOpacity>
        </View>

        {/* Feature Grid */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.label}
              feature={f}
              delay={i * 70}
              onPress={() => handleFeaturePress(f.screen)}
            />
          ))}
        </View>

        {/* Status Row */}
        <Text style={styles.sectionTitle}>Campus Status</Text>
        <View style={styles.statusRow}>
          <TouchableOpacity style={styles.statusCard} onPress={() => navigation.navigate('CrowdHeatmap')}>
            <Ionicons name="people" size={20} color="#FFE66D" />
            <Text style={styles.statusVal}>Moderate</Text>
            <Text style={styles.statusLbl}>Crowd Level</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statusCard} onPress={() => navigation.navigate('SocialNavigation')}>
            <Ionicons name="radio" size={20} color="#4ECDC4" />
            <Text style={styles.statusVal}>3 Online</Text>
            <Text style={styles.statusLbl}>Friends Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statusCard} onPress={() => navigation.navigate('VoiceSettings')}>
            <Ionicons name="volume-high" size={20} color="#00C6FF" />
            <Text style={styles.statusVal}>On</Text>
            <Text style={styles.statusLbl}>Voice Guide</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  scroll: { paddingBottom: 20 },

  headerGrad: { paddingTop: Platform.OS === 'ios' ? 60 : 46, paddingBottom: 24, paddingHorizontal: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  logoCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#00C6FF11',
    borderWidth: 1, borderColor: '#00C6FF44', alignItems: 'center', justifyContent: 'center',
  },
  appName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  appSub: { color: '#445', fontSize: 12, marginTop: 2 },
  welcomeText: { color: '#667', fontSize: 15 },

  ctaButton: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, gap: 12 },
  ctaText: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '700' },

  quickRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  quickBtn: {
    flex: 1, backgroundColor: '#0F172A', borderRadius: 14,
    paddingVertical: 12, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#1A2235',
  },
  quickLabel: { color: '#aaa', fontSize: 11, fontWeight: '600' },

  sectionTitle: {
    color: '#556', fontSize: 12, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', marginLeft: 20, marginBottom: 12,
  },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  featureCard: { borderRadius: 18, padding: 16, borderWidth: 1, gap: 8 },
  featureIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  featureLabel: { color: '#fff', fontSize: 15, fontWeight: '700' },
  featureDesc: { color: '#556', fontSize: 12, lineHeight: 17 },

  statusRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  statusCard: {
    flex: 1, backgroundColor: '#0F172A', borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#1A2235',
  },
  statusVal: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statusLbl: { color: '#445', fontSize: 10, textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F172A', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    borderTopWidth: 1, borderColor: '#1A2235',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalSub: { color: '#556', fontSize: 13, marginBottom: 20 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1A2235', borderRadius: 18, padding: 16,
    marginBottom: 12, borderWidth: 1,
  },
  optionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1 },
  optionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 3 },
  optionDesc: { color: '#667', fontSize: 12, lineHeight: 17 },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { color: '#445', fontSize: 15, fontWeight: '600' },
});