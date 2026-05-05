import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ScrollView, Platform, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
// FIX: correct relative path (VoiceSettingsScreen is in src/screens/, service is in src/services/)
import voiceGuidance, { VOICE_PROFILES } from '../services/voiceGuidanceService';

const PROFILE_OPTIONS = [
  { key: 'default', label: 'Standard', icon: 'person', desc: 'Normal pace, clear voice' },
  { key: 'fast', label: 'Fast', icon: 'flash', desc: 'Quick guidance for experts' },
  { key: 'slow', label: 'Slow', icon: 'hourglass', desc: 'Gentle, easy to follow' },
  { key: 'friendly', label: 'Friendly', icon: 'happy', desc: 'Warm and encouraging tone' },
];

// FIX: Extracted announcement items to a constant so useState is NOT called inside .map()
// Calling useState inside .map() is an invalid hook call and crashes React
const ANNOUNCEMENT_ITEMS = [
  { label: 'Direction change', icon: 'git-branch', defaultOn: true },
  { label: 'Approaching turn', icon: 'navigate', defaultOn: true },
  { label: 'Floor change', icon: 'layers', defaultOn: true },
  { label: 'Crowded areas', icon: 'people', defaultOn: false },
  { label: 'Arrival', icon: 'flag', defaultOn: true },
];

export default function VoiceSettingsScreen({ navigation }) {
  const [enabled, setEnabled] = useState(voiceGuidance.enabled);
  const [selectedProfile, setSelectedProfile] = useState('default');
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(0.9);

  // FIX: All announcement toggles declared at top level as a single state object
  const [announcementToggles, setAnnouncementToggles] = useState(
    Object.fromEntries(ANNOUNCEMENT_ITEMS.map(i => [i.label, i.defaultOn]))
  );

  useEffect(() => {
    voiceGuidance.setEnabled(enabled);
  }, [enabled]);

  const applyProfile = (profileKey) => {
    setSelectedProfile(profileKey);
    const p = VOICE_PROFILES[profileKey];
    setPitch(p.pitch);
    setRate(p.rate);
    voiceGuidance.setProfile(profileKey);
  };

  const toggleAnnouncement = (label) => {
    setAnnouncementToggles(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const testVoice = () => {
    voiceGuidance.speak(
      "Turn left at the corridor, near the notice board. You are 20 metres from your destination.",
      true
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0E1A', '#0F172A']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Guidance</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Master Toggle */}
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons name="volume-high" size={22} color="#00C6FF" />
              <View>
                <Text style={styles.toggleTitle}>Voice Guidance</Text>
                <Text style={styles.toggleDesc}>Announce directions aloud</Text>
              </View>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: '#1A2235', true: '#00C6FF44' }}
              thumbColor={enabled ? '#00C6FF' : '#334'}
            />
          </View>
        </View>

        {/* Voice Profiles */}
        <Text style={styles.sectionTitle}>Voice Profile</Text>
        <View style={styles.profileGrid}>
          {PROFILE_OPTIONS.map(p => (
            <TouchableOpacity
              key={p.key}
              style={[styles.profileCard, selectedProfile === p.key && styles.profileCardActive]}
              onPress={() => applyProfile(p.key)}
              disabled={!enabled}
            >
              <Ionicons name={p.icon} size={26} color={selectedProfile === p.key ? '#00C6FF' : '#445'} />
              <Text style={[styles.profileLabel, selectedProfile === p.key && { color: '#00C6FF' }]}>
                {p.label}
              </Text>
              <Text style={styles.profileDesc}>{p.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fine Tuning */}
        <Text style={styles.sectionTitle}>Fine Tuning</Text>
        <View style={styles.card}>
          <View style={styles.sliderRow}>
            <Ionicons name="musical-note" size={18} color="#4ECDC4" />
            <Text style={styles.sliderLabel}>Pitch</Text>
            <Text style={styles.sliderValue}>{pitch.toFixed(1)}</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5} maximumValue={2.0} step={0.1}
            value={pitch} onValueChange={setPitch}
            minimumTrackTintColor="#00C6FF" maximumTrackTintColor="#1A2235"
            thumbTintColor="#00C6FF" disabled={!enabled}
          />
          <View style={styles.sliderRow}>
            <Ionicons name="speedometer" size={18} color="#FFE66D" />
            <Text style={styles.sliderLabel}>Speed</Text>
            <Text style={styles.sliderValue}>{rate.toFixed(1)}x</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0.5} maximumValue={1.5} step={0.1}
            value={rate} onValueChange={setRate}
            minimumTrackTintColor="#FFE66D" maximumTrackTintColor="#1A2235"
            thumbTintColor="#FFE66D" disabled={!enabled}
          />
        </View>

        {/* Announcement Types */}
        <Text style={styles.sectionTitle}>Announce When</Text>
        <View style={styles.card}>
          {/* FIX: No useState inside .map() — use announcementToggles state object instead */}
          {ANNOUNCEMENT_ITEMS.map((item, i) => (
            <View key={item.label} style={[styles.toggleRow, i > 0 && styles.borderTop]}>
              <View style={styles.toggleLeft}>
                <Ionicons name={item.icon} size={18} color="#667" />
                <Text style={styles.toggleTitle}>{item.label}</Text>
              </View>
              <Switch
                value={announcementToggles[item.label]}
                onValueChange={() => toggleAnnouncement(item.label)}
                trackColor={{ false: '#1A2235', true: '#00C6FF44' }}
                thumbColor={announcementToggles[item.label] ? '#00C6FF' : '#334'}
                disabled={!enabled}
              />
            </View>
          ))}
        </View>

        {/* Test Button */}
        <TouchableOpacity
          onPress={testVoice}
          style={[styles.testBtn, !enabled && { opacity: 0.4 }]}
          disabled={!enabled}
        >
          <LinearGradient colors={['#00C6FF', '#0080FF']} style={styles.testBtnGrad}>
            <Ionicons name="play-circle" size={22} color="#fff" />
            <Text style={styles.testBtnText}>Test Voice</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E1A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 8, borderRadius: 20, backgroundColor: '#1A2235' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    color: '#556', fontSize: 12, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', marginTop: 20, marginBottom: 10, marginLeft: 4,
  },
  card: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1A2235' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  borderTop: { borderTopWidth: 1, borderTopColor: '#1A2235' },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { color: '#ccc', fontSize: 15, fontWeight: '500' },
  toggleDesc: { color: '#556', fontSize: 12, marginTop: 2 },
  profileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  profileCard: {
    width: '47%', backgroundColor: '#0F172A', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#1A2235', alignItems: 'center', gap: 6,
  },
  profileCardActive: { borderColor: '#00C6FF', backgroundColor: '#00C6FF11' },
  profileLabel: { color: '#aaa', fontSize: 14, fontWeight: '700' },
  profileDesc: { color: '#445', fontSize: 11, textAlign: 'center' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sliderLabel: { flex: 1, color: '#aaa', fontSize: 14 },
  sliderValue: { color: '#fff', fontSize: 13, fontWeight: '700', minWidth: 32, textAlign: 'right' },
  slider: { width: '100%', height: 36, marginBottom: 8 },
  testBtn: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  testBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  testBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});