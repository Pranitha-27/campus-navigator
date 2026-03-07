import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { getAllLocations, searchLocations } from "../../services/navigationService";

export default function SelectDestination({ route, navigation }) {
  const { startLocation } = route.params;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allLocations, setAllLocations] = useState([]);

  useEffect(() => {
    loadAllLocations();
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      searchLocations(query);
    } else {
      setResults(allLocations.filter((l) => l.id !== startLocation.id));
    }
  }, [query]);

  const loadAllLocations = async () => {
    try {
      setLoading(true);
      const result = await getAllLocations();
      const filtered = data.filter((l) => l.id !== startLocation.id);
      const data = result.data || [];
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchLocations = async (q) => {
    try {
      setLoading(true);
      const result = await searchLocations(q);
      setResults((result.data || []).filter((l) => l.id !== startLocation.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectDestination = (endLocation) => {
    navigation.navigate("PathResult", { startLocation, endLocation });
  };

  const getTypeColor = (type) => {
    const colors = {
      lab: "#7C3AED",
      room: "#2563EB",
      building: "#0891B2",
      landmark: "#059669",
    };
    return colors[type] || "#64748B";
  };

  const getTypeEmoji = (type) => {
    const emojis = {
      lab: "🔬",
      room: "🚪",
      building: "🏢",
      landmark: "📍",
    };
    return emojis[type] || "📌";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Destination</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* From Banner */}
      <View style={styles.fromBanner}>
        <Text style={styles.fromLabel}>📍 From:</Text>
        <Text style={styles.fromName}>{startLocation.name}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search destination..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          size="large"
          color="#2563EB"
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🗺️</Text>
              <Text style={styles.emptyText}>No locations found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.locationCard}
              onPress={() => selectDestination(item)}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: getTypeColor(item.type) + "20" },
                  ]}
                >
                  <Text style={styles.typeEmoji}>{getTypeEmoji(item.type)}</Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.locationName}>{item.name}</Text>
                <Text style={styles.locationMeta}>
                  {item.building} • Floor {item.floor}
                  {item.roomNumber ? ` • ${item.roomNumber}` : ""}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
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

  fromBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#BFDBFE",
  },
  fromLabel: { fontSize: 13, color: "#3B82F6", fontWeight: "600", marginRight: 6 },
  fromName: { fontSize: 13, color: "#1E40AF", fontWeight: "700" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: "#1E293B" },
  clearBtn: { fontSize: 16, color: "#94A3B8", padding: 4 },

  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: { marginRight: 12 },
  typeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  typeEmoji: { fontSize: 20 },
  cardContent: { flex: 1 },
  locationName: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  locationMeta: { fontSize: 12, color: "#64748B", marginTop: 2 },
  chevron: { fontSize: 22, color: "#CBD5E1" },

  empty: { alignItems: "center", marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#94A3B8" },
});