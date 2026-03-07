import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { findPath } from "../../services/navigationService";

export default function PathResult({ route, navigation }) {
  const { startLocation, endLocation } = route.params;
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPath();
  }, []);

  const fetchPath = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await findPath(
        startLocation.id,
        endLocation.id
      );
      setPath(result);
    } catch (err) {
      setError("Could not find a path. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step, index, total) => {
    if (index === 0) return "🚶 Start";
    if (index === total - 1) return "📍 Arrive";
    if (step.toLowerCase().includes("elevator")) return "🛗 Elevator";
    if (step.toLowerCase().includes("stair")) return "🪜 Stairs";
    if (step.toLowerCase().includes("corridor")) return "➡️ Walk";
    return `${index}️⃣ Next`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Finding best route...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchPath}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Route Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.routeRow}>
          <View style={styles.routePoint}>
            <View style={[styles.dot, { backgroundColor: "#22C55E" }]} />
            <Text style={styles.routeLabel} numberOfLines={1}>
              {startLocation.name}
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.routePoint}>
            <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.routeLabel} numberOfLines={1}>
              {endLocation.name}
            </Text>
          </View>
        </View>

        {path && (
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{path.steps?.length || 0}</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {Math.abs(
                  (endLocation.floor || 0) - (startLocation.floor || 0)
                )}
              </Text>
              <Text style={styles.statLabel}>Floors</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                ~{Math.max(1, Math.round((path.steps?.length || 1) * 0.5))} min
              </Text>
              <Text style={styles.statLabel}>Est. Time</Text>
            </View>
          </View>
        )}
      </View>

      {/* Steps List */}
      <Text style={styles.sectionTitle}>Step-by-Step Directions</Text>
      <ScrollView
        style={styles.stepsContainer}
        showsVerticalScrollIndicator={false}
      >
        {path?.steps?.map((step, index) => (
          <View key={index} style={styles.stepCard}>
            {/* Vertical line connector */}
            {index < path.steps.length - 1 && (
              <View style={styles.connector} />
            )}

            <View style={styles.stepLeft}>
              <View
                style={[
                  styles.stepCircle,
                  index === 0 && { backgroundColor: "#22C55E" },
                  index === path.steps.length - 1 && {
                    backgroundColor: "#EF4444",
                  },
                ]}
              >
                <Text style={styles.stepNum}>
                  {index === 0
                    ? "S"
                    : index === path.steps.length - 1
                    ? "E"
                    : index}
                </Text>
              </View>
            </View>

            <View style={styles.stepContent}>
              <Text style={styles.stepTag}>
                {getStepIcon(step, index, path.steps.length)}
              </Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          </View>
        ))}

        {/* Arrived Banner */}
        <View style={styles.arrivedBanner}>
          <Text style={styles.arrivedText}>🎉 You've arrived!</Text>
          <Text style={styles.arrivedSub}>{endLocation.name}</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { fontSize: 16, color: "#2563EB", fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },

  // Summary Card
  summaryCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  routePoint: { flexDirection: "row", alignItems: "center", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  routeLabel: { fontSize: 13, fontWeight: "600", color: "#1E293B", flex: 1 },
  arrow: { fontSize: 18, color: "#94A3B8", marginHorizontal: 8 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: "#2563EB" },
  statLabel: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#E2E8F0" },

  // Steps
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  stepsContainer: { flex: 1, paddingHorizontal: 16 },
  stepCard: {
    flexDirection: "row",
    marginBottom: 4,
    position: "relative",
  },
  connector: {
    position: "absolute",
    left: 15,
    top: 36,
    width: 2,
    height: "100%",
    backgroundColor: "#E2E8F0",
    zIndex: 0,
  },
  stepLeft: { alignItems: "center", marginRight: 12 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  stepNum: { color: "#fff", fontWeight: "700", fontSize: 12 },
  stepContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stepTag: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  stepText: { fontSize: 14, color: "#1E293B", fontWeight: "500" },

  // Arrived
  arrivedBanner: {
    backgroundColor: "#DCFCE7",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  arrivedText: { fontSize: 20, fontWeight: "700", color: "#15803D" },
  arrivedSub: { fontSize: 14, color: "#16A34A", marginTop: 4 },

  // Loading / Error
  loadingText: { marginTop: 16, fontSize: 16, color: "#64748B" },
  errorIcon: { fontSize: 48, marginBottom: 12 },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});