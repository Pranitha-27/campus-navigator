import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getAllLocations } from '../../services/navigationService';

const { width } = Dimensions.get('window');
const SCAN_SIZE = width * 0.65;

export default function QRScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Animate the scan line up and down
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_SIZE - 4],
  });

  // Handle QR code scan
  const handleBarCodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      // QR code data should be a location ID e.g. "campus://location/iot-lab"
      // or just a plain location ID like "iot-lab"
      let locationId = data;

      // Handle deep link format
      if (data.includes('campus://location/')) {
        locationId = data.replace('campus://location/', '');
      }

      // Find the location from Firebase
      const response = await getAllLocations();
      const locations = response.data || [];
      const found = locations.find(
        (l) => l.id === locationId || l.name.toLowerCase() === locationId.toLowerCase()
      );

      if (found) {
        // Navigate to location detail
        navigation.replace('LocationDetail', { location: found });
      } else {
        Alert.alert(
          '❓ Unknown QR Code',
          `No location found for: "${locationId}"\n\nMake sure this QR code is from Campus Navigator.`,
          [{ text: 'Scan Again', onPress: () => setScanned(false) }]
        );
      }
    } catch (err) {
      console.error('QR scan error:', err);
      Alert.alert('Error', 'Failed to process QR code.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
    }
  };

  // ── Permission not yet determined ──
  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  // ── Permission denied ──
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permText}>
          Campus Navigator needs camera access to scan QR codes placed around
          the campus.
        </Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Camera view ──
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Dark overlay with cut-out */}
      <View style={styles.overlay}>
        {/* Top dark area */}
        <View style={styles.overlayTop} />

        {/* Middle row: dark | scan box | dark */}
        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />

          {/* Scan Box */}
          <View style={styles.scanBox}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Animated scan line */}
            {!scanned && (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLineY }] },
                ]}
              />
            )}

            {/* Scanned indicator */}
            {scanned && (
              <View style={styles.scannedOverlay}>
                <Text style={styles.scannedIcon}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.overlaySide} />
        </View>

        {/* Bottom dark area */}
        <View style={styles.overlayBottom}>
          <Text style={styles.scanHint}>
            {scanned ? '🔍 Looking up location...' : 'Point camera at a Campus QR code'}
          </Text>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setTorchOn((v) => !v)}
            >
              <Text style={styles.controlIcon}>{torchOn ? '🔦' : '💡'}</Text>
              <Text style={styles.controlLabel}>
                {torchOn ? 'Torch On' : 'Torch Off'}
              </Text>
            </TouchableOpacity>

            {scanned && (
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.controlIcon}>🔄</Text>
                <Text style={styles.controlLabel}>Scan Again</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 24,
  },

  // Overlay
  overlay: { flex: 1 },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlayMiddle: { flexDirection: 'row', height: SCAN_SIZE },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 24,
  },

  // Scan box
  scanBox: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },

  // Corner brackets
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00FF88',
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // Scanned state
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,255,136,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannedIcon: { fontSize: 64, color: '#00FF88' },

  // Hint & controls
  scanHint: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  controls: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  controlBtn: { alignItems: 'center' },
  controlIcon: { fontSize: 28 },
  controlLabel: { color: '#fff', fontSize: 12, marginTop: 4 },

  backBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  backBtnText: { color: '#fff', fontSize: 16 },

  // Permission screen
  permIcon: { fontSize: 64, marginBottom: 16 },
  permTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  permText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permBtn: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  permBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  backLink: { padding: 12 },
  backLinkText: { color: 'rgba(255,255,255,0.5)', fontSize: 15 },
});