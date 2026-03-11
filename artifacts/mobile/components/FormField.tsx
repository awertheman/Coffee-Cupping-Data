import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";
import Colors from "@/constants/colors";

const C = Colors.light;

interface FormFieldProps extends TextInputProps {
  label: string;
  hint?: string;
  error?: string;
}

export function FormField({ label, hint, error, style, ...props }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={C.textMuted}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: C.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: C.text,
    borderWidth: 1,
    borderColor: C.border,
  },
  inputError: {
    borderColor: C.error,
  },
  error: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: C.error,
    marginTop: 4,
  },
});
