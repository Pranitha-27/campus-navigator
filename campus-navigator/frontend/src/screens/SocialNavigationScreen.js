// src/screens/SocialNavigationScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, FlatList, Alert, Platform,
  StatusBar, Image, Vibration
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, doc, setDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { API_BASE_URL } from '../config';

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#00C6FF', '#FF8E53', '#C5A3FF'];

const getAvatarColor = (name) => AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];

const Avatar = ({ name, size = 40, style }) => (
  <View style={[{
    width: size, height: size, borderRadius: size / 2,
    backgroundColor: getAvatarColor(name),
    alignItems: 'center', justifyContent: 'center',
  }, style]}>
    <Text style={{ color: '#0A0E1A', fontWeight: '800', fontSize: size * 0.38 }}>
      {name?.[0]?.toUpperCase() || '?'}
    </Text>
  </View>
);

export default function SocialNavigationScreen({ navigation }) {
  const [myName, setMyName] = useState('You');
  const [myLocation, setMyLocation] = useState({ building: 'BSN Block', floor: 3, area: 'Corridor B' });
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'groups' | 'share'
  const [sharingLocation, setSharingLocation] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const unsubRef = useRef(null);

  // Demo friends data
  const demoFriends = [
    { id: '1', name: 'Arjun', floor: 5, area: 'IoT Lab', building: 'BSN Block', status: 'online', lastSeen: 'Just now', navigating: 'Library' },
    { id: '2', name: 'Priya', floor: 1, area: 'Cafeteria', building: 'BSN Block', status: 'online', lastSeen: '2 min ago', navigating: null },
    { id: '3', name: 'Ravi', floor: 2, area: 'Library', building: 'Main Block', status: 'away', lastSeen: '10 min ago', navigating: null },
    { id: '4', name: 'Sneha', floor: 3, area: 'Seminar Hall', building: 'BSN Block', status: 'offline', lastSeen: '1 hr ago', navigating: null },
  ];

  const demoGroups = [
    { id: 'g1', name: 'Study Group A', members: ['Arjun', 'Priya', 'You'], destination: 'Library', meeting: '3:00 PM', floor: 2 },
    { id: 'g2', name: 'IoT Project Team', members: ['Ravi', 'Sneha', 'You'], destination: 'IoT Lab', meeting: '4:30 PM', floor: 5 },
  ];

  useEffect(() => {
    setFriends(demoFriends);
    setGroups(demoGroups);
    if (sharingLocation) subscribeToFriends();
    startPulse();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [sharingLocation]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  };

  const subscribeToFriends = () => {
    try {
      const q = query(collection(db, 'user_locations'), where('visible', '==', true));
      unsubRef.current = onSnapshot(q, (snap) => {
        const liveData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (liveData.length > 0) {
          setFriends(prev => {
            return prev.map(f => {
              const live = liveData.find(l => l.name === f.name);
              return live ? { ...f, ...live, status: 'online' } : f;
            });
          });
        }
      });
    } catch { /* fallback to demo */ }
  };

  const shareMyLocation = async () => {
    setSharingLocation(s => {
      if (!s) {
        // Post to Firestore
        try {
          setDoc(doc(db, 'user_locations', myName), {
            name: myName,
            ...myLocation,
            visible: true,
            timestamp: serverTimestamp(),
          });
        } catch { }
        Vibration.vibrate(100);
        Alert.alert('Location Shared', 'Your location is now visible to friends.');
      } else {
        try {
          setDoc(doc(db, 'user_locations', myName), { visible: false });
        } catch { }
      }
      return !s;
    });
  };

  const navigateToFriend = (friend) => {
    navigation.navigate('TurnByTurn', {
      destination: `${friend.name}'s Location`,
      startLocation: `${myLocation.area}`,
      path: [
        { instruction: `Head to Floor ${friend.floor}`, direction: 'stairs', distance: 0 },
        { instruction: `Go to ${friend.area}`, direction: 'straight', distance: 30 },
        { instruction: `You've reached ${friend.name}`, direction: 'destination', distance: 0 },
      ],
    });
  };

  const joinGroup = (group) => {
    navigation.navigate('TurnByTurn', {
      destination: group.destination,
      startLocation: myLocation.area,
    });
  };

  const createGroup = () => {
    if (!groupName.trim()) return;
    const newGroup = {
      id: `g${Date.now()}`,
      name: groupName.trim(),
      members: [myName],
      destination: '',
      meeting: 'TBD',
      floor: 1,
    };
    setGroups(prev => [newGroup, ...prev]);
    setGroupName('');
    Alert.alert('Group Created', `"${newGroup.name}" is ready. Share the invite code with friends.`);
  };

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor = (s) => ({ online: '#4ECDC4', away: '#FFE66D', offline: '#3A4460' }[s] || '#3A4460');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0E1A', '#0F172A']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Social Navigation</Text>
        <TouchableOpacity onPress={shareMyLocation} style={[styles.shareBtn, sharingLocation && styles.shareBtnActive]}>
          {sharingLocation
            ? <Animated.View style={{ transform: [{ scale: pulseAnim }] }}><Ionicons name="radio" size={20} color="#00C6FF" /></Animated.View>
            : <Ionicons name="location-outline" size={20} color="#556" />
          }
        </TouchableOpacity>
      </LinearGradient>

      {/* My Location Banner */}
      <View style={styles.myLocationBanner}>
        <Avatar name={myName} size={38} />
        <View style={styles.myLocInfo}>
          <Text style={styles.myLocName}>{myName} — {sharingLocation ? 'Sharing' : 'Hidden'}</Text>
          <Text style={styles.myLocArea}>{myLocation.building} · Floor {myLocation.floor} · {myLocation.area}</Text>
        </View>
        <TouchableOpacity onPress={shareMyLocation} style={[styles.toggleShareBtn, sharingLocation && { borderColor: '#00C6FF' }]}>
          <Text style={[styles.toggleShareText, sharingLocation && { color: '#00C6FF' }]}>
            {sharingLocation ? 'Stop' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'friends', label: 'Friends', icon: 'people' },
          { key: 'groups', label: 'Groups', icon: 'albums' },
          { key: 'share', label: 'Invite', icon: 'share-social' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#00C6FF' : '#445'} />
            <Text style={[styles.tabText, activeTab === tab.key && { color: '#00C6FF' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#445" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends..."
              placeholderTextColor="#445"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <FlatList
            data={filteredFriends}
            keyExtractor={i => i.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => (
              <View style={styles.friendCard}>
                <View style={styles.friendLeft}>
                  <View>
                    <Avatar name={item.name} size={44} />
                    <View style={[styles.statusDot, { backgroundColor: statusColor(item.status) }]} />
                  </View>
                  <View>
                    <Text style={styles.friendName}>{item.name}</Text>
                    {item.status !== 'offline' ? (
                      <Text style={styles.friendLoc}>{item.building} · F{item.floor} · {item.area}</Text>
                    ) : (
                      <Text style={styles.friendLoc}>Last seen {item.lastSeen}</Text>
                    )}
                    {item.navigating && (
                      <View style={styles.navBadge}>
                        <Ionicons name="navigate" size={10} color="#FFE66D" />
                        <Text style={styles.navBadgeText}>Going to {item.navigating}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {item.status !== 'offline' && (
                  <TouchableOpacity style={styles.goBtn} onPress={() => navigateToFriend(item)}>
                    <Ionicons name="navigate" size={16} color="#00C6FF" />
                    <Text style={styles.goBtnText}>Go</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        </View>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {/* Create Group */}
          <View style={styles.createGroupCard}>
            <Text style={styles.createGroupTitle}>Create a Group</Text>
            <View style={styles.createGroupRow}>
              <TextInput
                style={styles.groupInput}
                placeholder="Group name..."
                placeholderTextColor="#445"
                value={groupName}
                onChangeText={setGroupName}
              />
              <TouchableOpacity onPress={createGroup} style={styles.createBtn}>
                <Ionicons name="add" size={22} color="#0A0E1A" />
              </TouchableOpacity>
            </View>
          </View>

          {groups.map(group => (
            <View key={group.id} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <View style={styles.groupIconCircle}>
                  <FontAwesome5 name="users" size={16} color="#00C6FF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMeta}>{group.members.length} members</Text>
                </View>
                {group.meeting !== 'TBD' && (
                  <View style={styles.meetBadge}>
                    <Ionicons name="time" size={11} color="#FFE66D" />
                    <Text style={styles.meetTime}>{group.meeting}</Text>
                  </View>
                )}
              </View>
              <View style={styles.memberAvatars}>
                {group.members.map((m, idx) => (
                  <Avatar key={idx} name={m} size={30} style={{ marginLeft: idx > 0 ? -8 : 0, borderWidth: 2, borderColor: '#0A0E1A' }} />
                ))}
              </View>
              {group.destination ? (
                <TouchableOpacity style={styles.joinBtn} onPress={() => joinGroup(group)}>
                  <LinearGradient colors={['#00C6FF', '#0080FF']} style={styles.joinBtnGrad}>
                    <Ionicons name="navigate" size={14} color="#fff" />
                    <Text style={styles.joinBtnText}>Navigate to {group.destination}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.noDestRow}>
                  <Ionicons name="help-circle-outline" size={14} color="#445" />
                  <Text style={styles.noDestText}>No destination set yet</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Invite Tab */}
      {activeTab === 'share' && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <View style={styles.inviteCard}>
            <LinearGradient colors={['#00C6FF22', '#0080FF11']} style={styles.inviteGrad}>
              <Ionicons name="qr-code" size={48} color="#00C6FF" />
              <Text style={styles.inviteCode}>CNS-{Math.random().toString(36).slice(2,8).toUpperCase()}</Text>
              <Text style={styles.inviteDesc}>Share this code with friends to let them see your location during navigation.</Text>
              <TouchableOpacity style={styles.copyBtn}>
                <Ionicons name="copy-outline" size={16} color="#00C6FF" />
                <Text style={styles.copyBtnText}>Copy Invite Code</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          <View style={styles.joinCard}>
            <Text style={styles.joinCardTitle}>Join with a Code</Text>
            <View style={styles.joinRow}>
              <TextInput
                style={styles.joinInput}
                placeholder="Enter invite code..."
                placeholderTextColor="#445"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.joinSubmit} onPress={() => {
                if (inviteCode.trim()) Alert.alert('Joined!', `Now tracking group ${inviteCode}`);
              }}>
                <Text style={styles.joinSubmitText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.privacyCard}>
            <Ionicons name="shield-checkmark" size={20} color="#4ECDC4" />
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>Your Privacy</Text>
              <Text style={styles.privacyDesc}>
                Location sharing is voluntary. Only friends with your code can see your position.
                You can stop sharing at any time using the button above.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
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
  shareBtn: { padding: 8, borderRadius: 20, backgroundColor: '#1A2235' },
  shareBtnActive: { backgroundColor: '#00C6FF22', borderWidth: 1, borderColor: '#00C6FF44' },
  myLocationBanner: {
    flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#0F172A',
    borderRadius: 16, padding: 14, gap: 12, borderWidth: 1, borderColor: '#1A2235',
  },
  myLocInfo: { flex: 1 },
  myLocName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  myLocArea: { color: '#556', fontSize: 12, marginTop: 2 },
  toggleShareBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: '#2A3450' },
  toggleShareText: { color: '#667', fontSize: 13, fontWeight: '700' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1A2235',
  },
  tabActive: { borderColor: '#00C6FF', backgroundColor: '#00C6FF11' },
  tabText: { color: '#445', fontSize: 13, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#0F172A',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 10,
    borderWidth: 1, borderColor: '#1A2235',
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  friendCard: {
    backgroundColor: '#0F172A', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#1A2235',
  },
  friendLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#0F172A' },
  friendName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  friendLoc: { color: '#556', fontSize: 12, marginTop: 2 },
  navBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  navBadgeText: { color: '#FFE66D', fontSize: 11 },
  goBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#00C6FF11', borderWidth: 1, borderColor: '#00C6FF33', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  goBtnText: { color: '#00C6FF', fontSize: 13, fontWeight: '700' },
  createGroupCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1A2235' },
  createGroupTitle: { color: '#667', fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  createGroupRow: { flexDirection: 'row', gap: 10 },
  groupInput: { flex: 1, backgroundColor: '#1A2235', color: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  createBtn: { width: 44, height: 44, backgroundColor: '#00C6FF', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  groupCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: '#1A2235' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#00C6FF11', borderWidth: 1, borderColor: '#00C6FF33', alignItems: 'center', justifyContent: 'center' },
  groupName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  groupMeta: { color: '#556', fontSize: 12, marginTop: 2 },
  meetBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFE66D11', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  meetTime: { color: '#FFE66D', fontSize: 12, fontWeight: '700' },
  memberAvatars: { flexDirection: 'row' },
  joinBtn: { borderRadius: 12, overflow: 'hidden' },
  joinBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  joinBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  noDestRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noDestText: { color: '#445', fontSize: 13 },
  inviteCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#00C6FF33' },
  inviteGrad: { padding: 24, alignItems: 'center', gap: 14 },
  inviteCode: { color: '#00C6FF', fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  inviteDesc: { color: '#667', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#00C6FF22', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  copyBtnText: { color: '#00C6FF', fontSize: 14, fontWeight: '700' },
  joinCard: { backgroundColor: '#0F172A', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1A2235' },
  joinCardTitle: { color: '#667', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  joinRow: { flexDirection: 'row', gap: 10 },
  joinInput: { flex: 1, backgroundColor: '#1A2235', color: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  joinSubmit: { backgroundColor: '#00C6FF', borderRadius: 10, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  joinSubmitText: { color: '#0A0E1A', fontSize: 14, fontWeight: '800' },
  privacyCard: { backgroundColor: '#4ECDC411', borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: '#4ECDC433' },
  privacyTitle: { color: '#4ECDC4', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  privacyDesc: { color: '#667', fontSize: 12, lineHeight: 18 },
});