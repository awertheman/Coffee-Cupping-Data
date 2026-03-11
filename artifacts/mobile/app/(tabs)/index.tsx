import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { api } from "@/lib/api";
import { CuppingListCard } from "@/components/CuppingListCard";
import type { CuppingSession } from "@/lib/api";

const C = Colors.light;

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="cafe-outline" size={40} color={C.caramel} />
      </View>
      <Text style={styles.emptyTitle}>Sin cataciones</Text>
      <Text style={styles.emptySubtitle}>
        Crea tu primera sesión de cata{"\n"}usando el botón Nueva Cata
      </Text>
    </View>
  );
}

export default function CuppingsListScreen() {
  const insets = useSafeAreaInsets();

  const {
    data: cuppings = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["cuppings"],
    queryFn: api.listCuppings,
  });

  const renderItem = useCallback(
    ({ item }: { item: CuppingSession }) => (
      <CuppingListCard
        cupping={item}
        onPress={() =>
          router.push({ pathname: "/cupping/[id]", params: { id: item.id } })
        }
      />
    ),
    []
  );

  const avgScore =
    cuppings.length > 0
      ? cuppings
          .filter((c) => (c.finalScore ?? 0) > 0)
          .reduce((sum, c) => sum + (c.finalScore ?? 0), 0) /
        Math.max(
          1,
          cuppings.filter((c) => (c.finalScore ?? 0) > 0).length
        )
      : 0;

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? insets.top + 67 : 0 }]}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS !== "web" ? insets.top + 16 : 16 },
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>Cataciones CVA</Text>
          <Text style={styles.headerSubtitle}>
            Protocolo SCA · {cuppings.length}{" "}
            {cuppings.length === 1 ? "sesión" : "sesiones"}
          </Text>
        </View>
        {cuppings.length > 0 && avgScore > 0 && (
          <View style={styles.avgBadge}>
            <Text style={styles.avgScore}>{avgScore.toFixed(1)}</Text>
            <Text style={styles.avgLabel}>promedio</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={C.caramel} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color={C.error} />
          <Text style={styles.errorText}>Error al cargar cataciones</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cuppings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom:
                Platform.OS === "web"
                  ? insets.bottom + 34 + 84
                  : insets.bottom + 100,
            },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={C.caramel}
              colors={[C.caramel]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.card,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    marginTop: 2,
  },
  avgBadge: {
    backgroundColor: C.cream,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  avgScore: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: C.caramel,
  },
  avgLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: C.caramel,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});
