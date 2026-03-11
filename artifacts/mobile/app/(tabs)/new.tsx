import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { api } from "@/lib/api";
import type { CreateCuppingSession, ScoreAttribute, BooleanAttribute, Defects } from "@/lib/api";
import { ScoreSlider } from "@/components/ScoreSlider";
import { BooleanScoreRow } from "@/components/BooleanScoreRow";
import { FormField } from "@/components/FormField";
import { SectionHeader } from "@/components/SectionHeader";

const C = Colors.light;

const defaultScore = (): ScoreAttribute => ({ score: 7.5, intensity: 3 });
const defaultBoolean = (): BooleanAttribute => ({ score: 10 });

function calculateFinalScore(form: Partial<CreateCuppingSession>): number {
  const scored = [
    form.fragranceAroma?.score ?? 0,
    form.flavor?.score ?? 0,
    form.aftertaste?.score ?? 0,
    form.acidity?.score ?? 0,
    form.body?.score ?? 0,
    form.balance?.score ?? 0,
    form.overall?.score ?? 0,
  ].reduce((a, b) => a + b, 0);

  const booleans =
    (form.uniformity?.score ?? 0) +
    (form.cleanCup?.score ?? 0) +
    (form.sweetness?.score ?? 0);

  const defectDeductions =
    ((form.defects?.taints ?? 0) * 2) + ((form.defects?.faults ?? 0) * 4);

  return Math.max(0, scored + booleans - defectDeductions);
}

export default function NewCuppingScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split("T")[0];

  const [sampleId, setSampleId] = useState("");
  const [origin, setOrigin] = useState("");
  const [variety, setVariety] = useState("");
  const [process, setProcess] = useState("");
  const [roastDate, setRoastDate] = useState("");
  const [roastLevel, setRoastLevel] = useState("");
  const [cuppingDate, setCuppingDate] = useState(today);
  const [cupperName, setCupperName] = useState("");
  const [notes, setNotes] = useState("");

  const [fragranceAroma, setFragranceAroma] = useState<ScoreAttribute>(defaultScore());
  const [flavor, setFlavor] = useState<ScoreAttribute>(defaultScore());
  const [aftertaste, setAftertaste] = useState<ScoreAttribute>(defaultScore());
  const [acidity, setAcidity] = useState<ScoreAttribute>(defaultScore());
  const [body, setBody] = useState<ScoreAttribute>(defaultScore());
  const [balance, setBalance] = useState<ScoreAttribute>(defaultScore());
  const [uniformityCups, setUniformityCups] = useState(5);
  const [cleanCupCups, setCleanCupCups] = useState(5);
  const [sweetnessCups, setSweetnessCups] = useState(5);
  const [overall, setOverall] = useState<ScoreAttribute>(defaultScore());
  const [defects, setDefects] = useState<Defects>({ taints: 0, faults: 0 });
  const [sampleIdError, setSampleIdError] = useState("");

  const uniformity: BooleanAttribute = { score: uniformityCups * 2 };
  const cleanCup: BooleanAttribute = { score: cleanCupCups * 2 };
  const sweetness: BooleanAttribute = { score: sweetnessCups * 2 };

  const formData: Partial<CreateCuppingSession> = {
    fragranceAroma,
    flavor,
    aftertaste,
    acidity,
    body,
    balance,
    uniformity,
    cleanCup,
    sweetness,
    overall,
    defects,
  };

  const finalScore = calculateFinalScore(formData);

  const mutation = useMutation({
    mutationFn: (data: CreateCuppingSession) => api.createCupping(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuppings"] });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.push("/");
    },
    onError: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert("Error", "No se pudo guardar la catación. Intenta de nuevo.");
    },
  });

  const handleSubmit = useCallback(() => {
    if (!sampleId.trim()) {
      setSampleIdError("El ID de muestra es obligatorio");
      return;
    }
    setSampleIdError("");

    const data: CreateCuppingSession = {
      sampleId: sampleId.trim(),
      origin: origin.trim() || undefined,
      variety: variety.trim() || undefined,
      process: process.trim() || undefined,
      roastDate: roastDate.trim() || undefined,
      roastLevel: roastLevel.trim() || undefined,
      cuppingDate: cuppingDate.trim() || undefined,
      cupperName: cupperName.trim() || undefined,
      notes: notes.trim() || undefined,
      fragranceAroma,
      flavor,
      aftertaste,
      acidity,
      body,
      balance,
      uniformity,
      cleanCup,
      sweetness,
      overall,
      defects,
      finalScore,
    };

    mutation.mutate(data);
  }, [sampleId, origin, variety, process, roastDate, roastLevel, cuppingDate, cupperName, notes, fragranceAroma, flavor, aftertaste, acidity, body, balance, uniformity, cleanCup, sweetness, overall, defects, finalScore]);

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? insets.top + 67 : 0 }]}>
      <View
        style={[
          styles.header,
          { paddingTop: Platform.OS !== "web" ? insets.top + 16 : 16 },
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>Nueva Catación</Text>
          <Text style={styles.headerSubtitle}>Protocolo CVA · SCA</Text>
        </View>
        <View style={styles.liveScore}>
          <Text style={styles.liveScoreValue}>{finalScore.toFixed(2)}</Text>
          <Text style={styles.liveScoreLabel}>puntaje</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Platform.OS === "web"
                ? insets.bottom + 34 + 84
                : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader step={1} title="Información de Muestra" subtitle="Identificación del café" />

        <FormField
          label="ID de Muestra *"
          placeholder="p. ej. ETH-2025-001"
          value={sampleId}
          onChangeText={(v) => { setSampleId(v); setSampleIdError(""); }}
          error={sampleIdError}
          autoCapitalize="characters"
        />
        <View style={styles.row}>
          <View style={styles.halfField}>
            <FormField
              label="Origen"
              placeholder="p. ej. Yirgacheffe"
              value={origin}
              onChangeText={setOrigin}
            />
          </View>
          <View style={styles.halfField}>
            <FormField
              label="Variedad"
              placeholder="p. ej. Heirloom"
              value={variety}
              onChangeText={setVariety}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <FormField
              label="Proceso"
              placeholder="p. ej. Lavado"
              value={process}
              onChangeText={setProcess}
            />
          </View>
          <View style={styles.halfField}>
            <FormField
              label="Nivel de Tostado"
              placeholder="p. ej. Claro"
              value={roastLevel}
              onChangeText={setRoastLevel}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <FormField
              label="Fecha de Tostado"
              placeholder="AAAA-MM-DD"
              value={roastDate}
              onChangeText={setRoastDate}
            />
          </View>
          <View style={styles.halfField}>
            <FormField
              label="Fecha de Cata"
              placeholder="AAAA-MM-DD"
              value={cuppingDate}
              onChangeText={setCuppingDate}
            />
          </View>
        </View>
        <FormField
          label="Catador"
          placeholder="Nombre del catador"
          value={cupperName}
          onChangeText={setCupperName}
        />

        <SectionHeader step={2} title="Atributos de Calidad" subtitle="Escala 6.00 – 10.00 en pasos de 0.25" />

        <ScoreSlider
          label="Fragancia / Aroma"
          sublabel="Evaluado en seco y en húmedo"
          value={fragranceAroma.score}
          onValueChange={(v) => setFragranceAroma((prev) => ({ ...prev, score: v }))}
          showIntensity
          intensity={fragranceAroma.intensity ?? 0}
          onIntensityChange={(v) => setFragranceAroma((prev) => ({ ...prev, intensity: v }))}
        />
        <ScoreSlider
          label="Sabor"
          sublabel="Impresión principal del sabor"
          value={flavor.score}
          onValueChange={(v) => setFlavor((prev) => ({ ...prev, score: v }))}
          showIntensity
          intensity={flavor.intensity ?? 0}
          onIntensityChange={(v) => setFlavor((prev) => ({ ...prev, intensity: v }))}
        />
        <ScoreSlider
          label="Retrogusto"
          sublabel="Sabor residual post-deglución"
          value={aftertaste.score}
          onValueChange={(v) => setAftertaste((prev) => ({ ...prev, score: v }))}
        />
        <ScoreSlider
          label="Acidez"
          sublabel="Brillo y vivacidad"
          value={acidity.score}
          onValueChange={(v) => setAcidity((prev) => ({ ...prev, score: v }))}
          showIntensity
          intensity={acidity.intensity ?? 0}
          onIntensityChange={(v) => setAcidity((prev) => ({ ...prev, intensity: v }))}
        />
        <ScoreSlider
          label="Cuerpo"
          sublabel="Textura y peso en boca"
          value={body.score}
          onValueChange={(v) => setBody((prev) => ({ ...prev, score: v }))}
          showIntensity
          intensity={body.intensity ?? 0}
          onIntensityChange={(v) => setBody((prev) => ({ ...prev, intensity: v }))}
        />
        <ScoreSlider
          label="Balance"
          sublabel="Armonía entre atributos"
          value={balance.score}
          onValueChange={(v) => setBalance((prev) => ({ ...prev, score: v }))}
        />

        <SectionHeader step={3} title="Atributos por Taza" subtitle="Cada taza aporta 2 puntos (5 tazas = 10 pts)" />

        <BooleanScoreRow
          label="Uniformidad"
          sublabel="Consistencia entre tazas"
          activeCups={uniformityCups}
          onActiveCupsChange={setUniformityCups}
        />
        <BooleanScoreRow
          label="Taza Limpia"
          sublabel="Ausencia de sabores negativos"
          activeCups={cleanCupCups}
          onActiveCupsChange={setCleanCupCups}
        />
        <BooleanScoreRow
          label="Dulzor"
          sublabel="Presencia de dulzor agradable"
          activeCups={sweetnessCups}
          onActiveCupsChange={setSweetnessCups}
        />

        <SectionHeader step={4} title="Impresión General" subtitle="Puntuación holística del catador" />

        <ScoreSlider
          label="General"
          sublabel="Impresión holística del café"
          value={overall.score}
          onValueChange={(v) => setOverall((prev) => ({ ...prev, score: v }))}
        />

        <SectionHeader step={5} title="Defectos" subtitle="Tachas: 2 pts · Faltas: 4 pts por taza" />

        <View style={styles.defectsContainer}>
          <View style={styles.defectItem}>
            <Text style={styles.defectLabel}>Tachas (Taints)</Text>
            <Text style={styles.defectSublabel}>Sabor desagradable leve</Text>
            <View style={styles.defectCounter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setDefects((d) => ({ ...d, taints: Math.max(0, (d.taints ?? 0) - 1) }))}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{defects.taints ?? 0}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setDefects((d) => ({ ...d, taints: Math.min(5, (d.taints ?? 0) + 1) }))}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.defectPoints}>−{(defects.taints ?? 0) * 2} pts</Text>
            </View>
          </View>
          <View style={[styles.defectItem, styles.defectItemRight]}>
            <Text style={styles.defectLabel}>Faltas (Faults)</Text>
            <Text style={styles.defectSublabel}>Sabor ofensivo intenso</Text>
            <View style={styles.defectCounter}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setDefects((d) => ({ ...d, faults: Math.max(0, (d.faults ?? 0) - 1) }))}
              >
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{defects.faults ?? 0}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setDefects((d) => ({ ...d, faults: Math.min(5, (d.faults ?? 0) + 1) }))}
              >
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.defectPoints}>−{(defects.faults ?? 0) * 4} pts</Text>
            </View>
          </View>
        </View>

        <SectionHeader step={6} title="Notas" subtitle="Observaciones adicionales" />

        <FormField
          label="Notas de Cata"
          placeholder="Descriptores de sabor, observaciones, contexto..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          style={styles.notesInput}
        />

        <View style={styles.finalScorePreview}>
          <Text style={styles.finalScorePreviewLabel}>Puntaje Final Calculado</Text>
          <Text style={styles.finalScorePreviewValue}>{finalScore.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, mutation.isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={mutation.isPending}
          activeOpacity={0.85}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Guardar Catación</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  liveScore: {
    backgroundColor: C.caramel,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    minWidth: 72,
  },
  liveScoreValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  liveScoreLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  defectsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  defectItem: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  defectItemRight: {},
  defectLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
  },
  defectSublabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  defectCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBtnText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    lineHeight: 22,
  },
  counterValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: C.text,
    minWidth: 20,
    textAlign: "center",
  },
  defectPoints: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.error,
    marginLeft: 4,
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  finalScorePreview: {
    backgroundColor: C.brown800,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  finalScorePreviewLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  finalScorePreviewValue: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: C.caramelLight,
  },
  submitBtn: {
    backgroundColor: C.caramel,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: C.caramel,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
