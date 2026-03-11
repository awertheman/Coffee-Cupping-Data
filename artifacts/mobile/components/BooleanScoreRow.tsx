import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const C = Colors.light;

interface CupToggleProps {
  active: boolean;
  onPress: () => void;
}

function CupToggle({ active, onPress }: CupToggleProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress();
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      style={[styles.cup, active && styles.cupActive]}
      activeOpacity={0.8}
    >
      <View style={[styles.cupInner, active && styles.cupInnerActive]} />
    </TouchableOpacity>
  );
}

interface BooleanScoreRowProps {
  label: string;
  sublabel?: string;
  numCups?: number;
  activeCups: number;
  pointsPerCup?: number;
  onActiveCupsChange: (cups: number) => void;
}

export function BooleanScoreRow({
  label,
  sublabel,
  numCups = 5,
  activeCups,
  pointsPerCup = 2,
  onActiveCupsChange,
}: BooleanScoreRowProps) {
  const score = activeCups * pointsPerCup;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.label}>{label}</Text>
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
      <View style={styles.right}>
        <View style={styles.cupsRow}>
          {Array.from({ length: numCups }).map((_, i) => (
            <CupToggle
              key={i}
              active={i < activeCups}
              onPress={() => {
                const newVal = i < activeCups ? i : i + 1;
                onActiveCupsChange(newVal);
              }}
            />
          ))}
        </View>
        <Text style={styles.score}>{score.toFixed(0)} pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  sublabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  cupsRow: {
    flexDirection: "row",
    gap: 6,
  },
  cup: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.backgroundSecondary,
  },
  cupActive: {
    borderColor: C.caramel,
    backgroundColor: C.cream,
  },
  cupInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.border,
  },
  cupInnerActive: {
    backgroundColor: C.caramel,
  },
  score: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
  },
});
