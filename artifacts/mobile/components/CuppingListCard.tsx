import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import type { CuppingSession } from "@/lib/api";

const C = Colors.light;

function scoreColor(score: number): string {
  if (score >= 90) return "#4A7C59";
  if (score >= 85) return "#6B8F4E";
  if (score >= 80) return C.caramel;
  if (score >= 75) return C.textSecondary;
  return C.textMuted;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface CuppingListCardProps {
  cupping: CuppingSession;
  onPress: () => void;
}

export function CuppingListCard({ cupping, onPress }: CuppingListCardProps) {
  const score = cupping.finalScore ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.85}
    >
      <View style={[styles.scoreBar, { backgroundColor: scoreColor(score) }]} />
      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.titleArea}>
            <Text style={styles.sampleId} numberOfLines={1}>
              {cupping.sampleId}
            </Text>
            {cupping.origin && (
              <Text style={styles.origin} numberOfLines={1}>
                {cupping.origin}
                {cupping.variety ? ` · ${cupping.variety}` : ""}
              </Text>
            )}
          </View>
          <View style={styles.scoreArea}>
            <Text style={[styles.score, { color: scoreColor(score) }]}>
              {score > 0 ? score.toFixed(2) : "—"}
            </Text>
            <Text style={styles.scorePts}>pts</Text>
          </View>
        </View>
        <View style={styles.bottom}>
          <View style={styles.metaRow}>
            {cupping.process && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{cupping.process}</Text>
              </View>
            )}
            {cupping.roastLevel && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{cupping.roastLevel}</Text>
              </View>
            )}
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={11} color={C.textMuted} />
            <Text style={styles.date}>{formatDate(cupping.createdAt)}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={C.border} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  scoreBar: {
    width: 4,
    minHeight: 80,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleArea: {
    flex: 1,
    marginRight: 12,
  },
  sampleId: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  origin: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    marginTop: 2,
  },
  scoreArea: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  score: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  scorePts: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: C.cream,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: C.textSecondary,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  date: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
  },
  chevron: {
    alignSelf: "center",
    marginRight: 12,
  },
});
