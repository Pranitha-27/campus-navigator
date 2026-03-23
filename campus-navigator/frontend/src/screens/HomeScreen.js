// src/screens/HomeScreen.js
// Updated home screen with navigation to all new features

import React, { useRef, useEffect } from 'react';
import {
<<<<<<< HEAD
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import Screen from '../components/Screen';
import { COLORS, SPACING } from '../config';
=======
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, Platform, StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    icon: 'navigate',
    iconLib: 'Ionicons',
    label: 'Navigate',
    desc: 'Find any room on campus',
    screen: 'NavigationHome',
    color: '#00C6FF',
    gradient: ['#00C6FF22', '#0080FF11'],
  },
  {
    icon: 'layers',
    iconLib: 'Ionicons',
    label: 'AR Navigation',
    desc: 'Augmented reality directions',
    screen: 'ARNavigation',
    color: '#FF6B6B',
    gradient: ['#FF6B6B22', '#FF000011'],
  },
  {
    icon: 'flame',
    iconLib: 'Ionicons',
    label: 'Crowd Map',
    desc: 'Live crowd density heatmap',
    screen: 'CrowdHeatmap',
    color: '#FFE66D',
    gradient: ['#FFE66D22', '#FF8C0011'],
  },
  {
    icon: 'people',
    iconLib: 'Ionicons',
    label: 'Social Nav',
    desc: 'Navigate with friends',
    screen: 'SocialNavigation',
    color: '#4ECDC4',
    gradient: ['#4ECDC422', '#00C6FF11'],
  },
  {
    icon: 'volume-high',
    iconLib: 'Ionicons',
    label: 'Voice Settings',
    desc: 'Customize voice guidance',
    screen: 'VoiceSettings',
    color: '#A8E6CF',
    gradient: ['#A8E6CF22', '#4ECDC411'],
  }
];

const FeatureCard = ({ feature, onPress, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
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
>>>>>>> aa2f81e0d91b418f69d8dc2cac50178c13cb758a

export default function HomeScreen({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
<<<<<<< HEAD
    <Screen style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Campus Navigator</Text>
          <Text style={styles.subtitle}>Navigate your campus with ease</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('NavigationHome')}
          >
            <Text style={styles.buttonIcon}>🗺️</Text>
            <Text style={styles.buttonTitle}>Navigate Campus</Text>
            <Text style={styles.buttonSubtitle}>
              Find labs, rooms, and locations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.mapButton]}
            onPress={() => navigation.navigate('BuildingMap')}
          >
            <Text style={styles.buttonIcon}>🏢</Text>
            <Text style={styles.buttonTitle}>Building Map</Text>
            <Text style={styles.buttonSubtitle}>
              View floor plans for all floors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.qrButton]}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <Text style={styles.buttonIcon}>📷</Text>
            <Text style={styles.buttonTitle}>Scan QR Code</Text>
            <Text style={styles.buttonSubtitle}>
              Scan a room QR code to navigate instantly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.tertiaryButton]}
            onPress={() => alert('Coming soon!')}
          >
            <Text style={styles.buttonIcon}>⭐</Text>
            <Text style={styles.buttonTitle}>My Favorites</Text>
            <Text style={styles.buttonSubtitle}>
              Quick access to saved locations
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.liveButton]}
            onPress={() => navigation.navigate('LiveNavigation')}
          >
            <Text style={styles.buttonIcon}>📡</Text>
            <Text style={styles.buttonTitle}>Live Navigation</Text>
            <Text style={styles.buttonSubtitle}>
              GPS tracking + crowd heatmap
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for easier campus life
          </Text>
        </View>
      </ScrollView>
    </Screen>
=======
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0E1A', '#0F172A']} style={StyleSheet.absoluteFillObject} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Animated.View style={[styles.header, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
        }]}>
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

        {/* Quick Navigate CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('NavigationHome')}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#00C6FF', '#0080FF']} style={styles.ctaGrad}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.ctaText}>Search a Location</Text>
            <Ionicons name="chevron-forward" size={18} color="#ffffff88" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Feature Grid */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.label}
              feature={f}
              delay={i * 80}
              onPress={() => navigation.navigate(f.screen)}
            />
          ))}
        </View>

        {/* Status Cards */}
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
>>>>>>> aa2f81e0d91b418f69d8dc2cac50178c13cb758a
  );
}

const cardW = (width - 48) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  scroll: { paddingBottom: 20 },
  header: { marginBottom: 8 },
  headerGrad: { paddingTop: Platform.OS === 'ios' ? 60 : 46, paddingBottom: 24, paddingHorizontal: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  logoCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#00C6FF11',
    borderWidth: 1, borderColor: '#00C6FF44', alignItems: 'center', justifyContent: 'center',
  },
<<<<<<< HEAD
  scroll: {
    flex: 1,                  // ✅ key fix
  },
  scrollContent: {
    flexGrow: 1,              // ✅ key fix for web
    paddingBottom: 24,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
  },
  buttonsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  button: {
    padding: SPACING.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton:  { backgroundColor: COLORS.primary },
  mapButton:      { backgroundColor: '#059669' },
  qrButton:       { backgroundColor: '#1C1C1E' },
  tertiaryButton: { backgroundColor: COLORS.secondary },
  buttonIcon:     { fontSize: 40, marginBottom: SPACING.sm },
  buttonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  liveButton: { backgroundColor: '#EF4444' }
=======
  appName: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  appSub: { color: '#445', fontSize: 12, marginTop: 2 },
  welcomeText: { color: '#667', fontSize: 15 },
  ctaButton: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, gap: 12 },
  ctaText: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '700' },
  sectionTitle: { color: '#556', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginLeft: 20, marginBottom: 12 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12, marginBottom: 24 },
  featureCard: {
    width: cardW, borderRadius: 18, padding: 16, borderWidth: 1, gap: 8,
  },
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
>>>>>>> aa2f81e0d91b418f69d8dc2cac50178c13cb758a
});