import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

const C = Colors.light;

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  step?: number;
}

export function SectionHeader({ title, subtitle, step }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      {step !== undefined && (
        <View style={styles.stepBadge}>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    gap: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.caramel,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    marginTop: 1,
  },
});
