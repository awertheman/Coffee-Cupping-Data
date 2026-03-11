import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import type { CuppingSession } from "@/lib/api";

const C = Colors.light;

function scoreLabel(score: number): string {
  if (score >= 90) return "Excepcional";
  if (score >= 85) return "Excelente";
  if (score >= 80) return "Muy Bueno";
  if (score >= 75) return "Bueno";
  return "Por Debajo del Promedio";
}

function scoreColor(score: number): string {
  if (score >= 90) return "#4A7C59";
  if (score >= 85) return "#6B8F4E";
  if (score >= 80) return C.caramel;
  if (score >= 75) return C.textSecondary;
  return C.textMuted;
}

interface ScoreCardProps {
  cupping: CuppingSession;
}

export function ScoreCard({ cupping }: ScoreCardProps) {
  const score = cupping.finalScore ?? 0;

  const attributes = [
    { key: "fragranceAroma", label: "Fragancia/Aroma" },
    { key: "flavor", label: "Sabor" },
    { key: "aftertaste", label: "Retrogusto" },
    { key: "acidity", label: "Acidez" },
    { key: "body", label: "Cuerpo" },
    { key: "balance", label: "Balance" },
    { key: "uniformity", label: "Uniformidad" },
    { key: "cleanCup", label: "Taza Limpia" },
    { key: "sweetness", label: "Dulzor" },
    { key: "overall", label: "General" },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.finalScoreContainer}>
        <Text style={[styles.finalScore, { color: scoreColor(score) }]}>
          {score.toFixed(2)}
        </Text>
        <Text style={styles.finalScoreLabel}>{scoreLabel(score)}</Text>
      </View>
      <View style={styles.grid}>
        {attributes.map(({ key, label }) => {
          const attr = cupping[key] as { score?: number } | undefined;
          const attrScore = attr?.score ?? 0;
          return (
            <View key={key} style={styles.gridItem}>
              <Text style={styles.attrScore}>{attrScore.toFixed(key === "uniformity" || key === "cleanCup" || key === "sweetness" ? 0 : 2)}</Text>
              <Text style={styles.attrLabel}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  finalScoreContainer: {
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  finalScore: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    lineHeight: 64,
  },
  finalScoreLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    width: "18%",
    alignItems: "center",
  },
  attrScore: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  attrLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    textAlign: "center",
    marginTop: 2,
  },
});
