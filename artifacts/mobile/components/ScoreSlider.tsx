import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const C = Colors.light;

interface ScoreSliderProps {
  label: string;
  sublabel?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  showIntensity?: boolean;
  intensity?: number;
  onIntensityChange?: (value: number) => void;
}

const SCORE_STEPS_CUPPING = [6.0, 6.25, 6.5, 6.75, 7.0, 7.25, 7.5, 7.75, 8.0, 8.25, 8.5, 8.75, 9.0, 9.25, 9.5, 9.75, 10.0];

export function ScoreSlider({
  label,
  sublabel,
  value,
  onValueChange,
  showIntensity = false,
  intensity = 0,
  onIntensityChange,
}: ScoreSliderProps) {
  const scoreColor = () => {
    if (value >= 9.0) return "#4A7C59";
    if (value >= 8.5) return "#6B8F4E";
    if (value >= 8.0) return C.caramel;
    if (value >= 7.5) return C.textSecondary;
    return C.textMuted;
  };

  const handleScoreChange = useCallback((step: number) => {
    const newVal = Math.max(6.0, Math.min(10.0, value + step));
    const rounded = Math.round(newVal * 4) / 4;
    onValueChange(rounded);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [value, onValueChange]);

  const handleIntensityChange = useCallback((step: number) => {
    if (!onIntensityChange) return;
    const newVal = Math.max(0, Math.min(5, intensity + step));
    onIntensityChange(newVal);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [intensity, onIntensityChange]);

  const renderScorePips = () => {
    return SCORE_STEPS_CUPPING.map((step, i) => {
      const isActive = value >= step;
      const isCurrent = Math.abs(value - step) < 0.001;
      return (
        <TouchableOpacity
          key={i}
          onPress={() => {
            onValueChange(step);
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          style={[
            styles.pip,
            isActive && styles.pipActive,
            isCurrent && styles.pipCurrent,
          ]}
          activeOpacity={0.7}
        />
      );
    });
  };

  const renderIntensityDots = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <TouchableOpacity
        key={i}
        onPress={() => {
          if (onIntensityChange) {
            onIntensityChange(i + 1);
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
        }}
        style={[
          styles.intensityDot,
          i < intensity && styles.intensityDotFilled,
        ]}
        activeOpacity={0.7}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>{label}</Text>
          {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        </View>
        <View style={styles.scoreDisplay}>
          <View style={styles.scoreControls}>
            <TouchableOpacity
              onPress={() => handleScoreChange(-0.25)}
              style={styles.scoreBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.scoreBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.scoreValue, { color: scoreColor() }]}>
              {value.toFixed(2)}
            </Text>
            <TouchableOpacity
              onPress={() => handleScoreChange(0.25)}
              style={styles.scoreBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.scoreBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.pipsContainer}>{renderScorePips()}</View>

      {showIntensity && onIntensityChange && (
        <View style={styles.intensityRow}>
          <Text style={styles.intensityLabel}>Intensidad</Text>
          <View style={styles.intensityDots}>{renderIntensityDots()}</View>
          <View style={styles.intensityControls}>
            <TouchableOpacity
              onPress={() => handleIntensityChange(-1)}
              style={styles.intensityBtn}
            >
              <Text style={styles.intensityBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.intensityValue}>{intensity}</Text>
            <TouchableOpacity
              onPress={() => handleIntensityChange(1)}
              style={styles.intensityBtn}
            >
              <Text style={styles.intensityBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
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
  scoreDisplay: {
    alignItems: "flex-end",
  },
  scoreControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBtnText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    lineHeight: 22,
  },
  scoreValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    minWidth: 52,
    textAlign: "center",
  },
  pipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    marginTop: 4,
  },
  pip: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.border,
  },
  pipActive: {
    backgroundColor: C.caramel,
    opacity: 0.5,
  },
  pipCurrent: {
    backgroundColor: C.caramel,
    opacity: 1,
    height: 8,
  },
  intensityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  intensityLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: C.textMuted,
    width: 72,
  },
  intensityDots: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  intensityDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: "transparent",
  },
  intensityDotFilled: {
    backgroundColor: C.caramel,
    borderColor: C.caramel,
  },
  intensityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  intensityBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  intensityBtnText: {
    fontSize: 16,
    color: C.textSecondary,
    lineHeight: 20,
    fontFamily: "Inter_600SemiBold",
  },
  intensityValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
    minWidth: 16,
    textAlign: "center",
  },
} as const);
