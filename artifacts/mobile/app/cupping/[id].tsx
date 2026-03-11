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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { api } from "@/lib/api";
import type { CuppingSession, ScoreAttribute, BooleanAttribute, Defects, CreateCuppingSession } from "@/lib/api";
import { ScoreSlider } from "@/components/ScoreSlider";
import { BooleanScoreRow } from "@/components/BooleanScoreRow";
import { FormField } from "@/components/FormField";
import { SectionHeader } from "@/components/SectionHeader";
import { ScoreCard } from "@/components/ScoreCard";

const C = Colors.light;

function scoreLabel(score: number): string {
  if (score >= 90) return "Excepcional";
  if (score >= 85) return "Excelente";
  if (score >= 80) return "Muy Bueno";
  if (score >= 75) return "Bueno";
  return "Por Debajo del Promedio";
}

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function CuppingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cuppingId = parseInt(id);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: cupping,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["cupping", cuppingId],
    queryFn: () => api.getCupping(cuppingId),
  });

  const [fragranceAroma, setFragranceAroma] = useState<ScoreAttribute>({ score: 7.5, intensity: 3 });
  const [flavor, setFlavor] = useState<ScoreAttribute>({ score: 7.5, intensity: 3 });
  const [aftertaste, setAftertaste] = useState<ScoreAttribute>({ score: 7.5 });
  const [acidity, setAcidity] = useState<ScoreAttribute>({ score: 7.5, intensity: 3 });
  const [body, setBody] = useState<ScoreAttribute>({ score: 7.5, intensity: 3 });
  const [balance, setBalance] = useState<ScoreAttribute>({ score: 7.5 });
  const [uniformityCups, setUniformityCups] = useState(5);
  const [cleanCupCups, setCleanCupCups] = useState(5);
  const [sweetnessCups, setSweetnessCups] = useState(5);
  const [overall, setOverall] = useState<ScoreAttribute>({ score: 7.5 });
  const [defects, setDefects] = useState<Defects>({ taints: 0, faults: 0 });
  const [notes, setNotes] = useState("");
  const [editInitialized, setEditInitialized] = useState(false);

  const initEditState = useCallback((c: CuppingSession) => {
    setFragranceAroma((c.fragranceAroma as ScoreAttribute) ?? { score: 7.5, intensity: 3 });
    setFlavor((c.flavor as ScoreAttribute) ?? { score: 7.5, intensity: 3 });
    setAftertaste((c.aftertaste as ScoreAttribute) ?? { score: 7.5 });
    setAcidity((c.acidity as ScoreAttribute) ?? { score: 7.5, intensity: 3 });
    setBody((c.body as ScoreAttribute) ?? { score: 7.5, intensity: 3 });
    setBalance((c.balance as ScoreAttribute) ?? { score: 7.5 });
    const uniformityScore = (c.uniformity as BooleanAttribute)?.score ?? 10;
    setUniformityCups(uniformityScore / 2);
    const cleanCupScore = (c.cleanCup as BooleanAttribute)?.score ?? 10;
    setCleanCupCups(cleanCupScore / 2);
    const sweetnessScore = (c.sweetness as BooleanAttribute)?.score ?? 10;
    setSweetnessCups(sweetnessScore / 2);
    setOverall((c.overall as ScoreAttribute) ?? { score: 7.5 });
    setDefects((c.defects as Defects) ?? { taints: 0, faults: 0 });
    setNotes(c.notes ?? "");
  }, []);

  const handleStartEdit = useCallback(() => {
    if (cupping && !editInitialized) {
      initEditState(cupping);
      setEditInitialized(true);
    }
    setIsEditing(true);
  }, [cupping, editInitialized, initEditState]);

  const uniformity: BooleanAttribute = { score: uniformityCups * 2 };
  const cleanCup: BooleanAttribute = { score: cleanCupCups * 2 };
  const sweetness: BooleanAttribute = { score: sweetnessCups * 2 };

  const editedFinalScore = calculateFinalScore({
    fragranceAroma, flavor, aftertaste, acidity, body, balance,
    uniformity, cleanCup, sweetness, overall, defects,
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateCuppingSession) => api.updateCupping(cuppingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuppings"] });
      queryClient.invalidateQueries({ queryKey: ["cupping", cuppingId] });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setIsEditing(false);
    },
    onError: () => {
      Alert.alert("Error", "No se pudo actualizar la catación.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteCupping(cuppingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cuppings"] });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.back();
    },
    onError: () => {
      Alert.alert("Error", "No se pudo eliminar la catación.");
    },
  });

  const handleSave = useCallback(() => {
    if (!cupping) return;
    const data: CreateCuppingSession = {
      sampleId: cupping.sampleId,
      origin: cupping.origin,
      variety: cupping.variety,
      process: cupping.process,
      roastDate: cupping.roastDate,
      roastLevel: cupping.roastLevel,
      cuppingDate: cupping.cuppingDate,
      cupperName: cupping.cupperName,
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
      notes: notes.trim() || undefined,
      finalScore: editedFinalScore,
    };
    updateMutation.mutate(data);
  }, [cupping, fragranceAroma, flavor, aftertaste, acidity, body, balance, uniformity, cleanCup, sweetness, overall, defects, notes, editedFinalScore]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Eliminar Catación",
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={C.caramel} size="large" />
      </View>
    );
  }

  if (isError || !cupping) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={C.error} />
        <Text style={styles.errorText}>Error al cargar catación</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS !== "web" ? insets.top + 16 : insets.top + 67 + 16,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {cupping.sampleId}
          </Text>
          {cupping.origin && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {cupping.origin}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {isEditing ? (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveBtn}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity onPress={handleStartEdit} style={styles.iconBtn}>
                <Ionicons name="pencil-outline" size={20} color={C.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={C.error} />
              </TouchableOpacity>
            </>
          )}
          {isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(false)}
              style={styles.iconBtn}
            >
              <Ionicons name="close" size={22} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? insets.bottom + 34 : insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!isEditing ? (
          <>
            <View style={styles.metaCard}>
              <View style={styles.metaGrid}>
                <InfoRow label="Catador" value={cupping.cupperName} />
                <InfoRow label="Fecha de Cata" value={cupping.cuppingDate} />
                <InfoRow label="Proceso" value={cupping.process} />
                <InfoRow label="Variedad" value={cupping.variety} />
                <InfoRow label="Nivel Tostado" value={cupping.roastLevel} />
                <InfoRow label="Fecha Tostado" value={cupping.roastDate} />
                <InfoRow label="Registrado" value={formatDate(cupping.createdAt)} />
              </View>
              {cupping.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesLabel}>Notas</Text>
                  <Text style={styles.notesText}>{cupping.notes}</Text>
                </View>
              )}
            </View>

            <ScoreCard cupping={cupping} />

            {cupping.defects && (
              ((cupping.defects as Defects).taints ?? 0) > 0 ||
              ((cupping.defects as Defects).faults ?? 0) > 0
            ) ? (
              <View style={styles.defectCard}>
                <Text style={styles.defectCardTitle}>Defectos</Text>
                <View style={styles.defectCardRow}>
                  {((cupping.defects as Defects).taints ?? 0) > 0 && (
                    <View style={styles.defectBadge}>
                      <Text style={styles.defectBadgeNum}>{(cupping.defects as Defects).taints}</Text>
                      <Text style={styles.defectBadgeLabel}>tacha{((cupping.defects as Defects).taints ?? 0) > 1 ? "s" : ""}</Text>
                    </View>
                  )}
                  {((cupping.defects as Defects).faults ?? 0) > 0 && (
                    <View style={[styles.defectBadge, styles.defectBadgeFault]}>
                      <Text style={styles.defectBadgeNum}>{(cupping.defects as Defects).faults}</Text>
                      <Text style={styles.defectBadgeLabel}>falta{((cupping.defects as Defects).faults ?? 0) > 1 ? "s" : ""}</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.editBanner}>
              <Text style={styles.editBannerText}>
                Editando puntaje final: {editedFinalScore.toFixed(2)}
              </Text>
            </View>

            <SectionHeader step={1} title="Atributos de Calidad" />

            <ScoreSlider
              label="Fragancia / Aroma"
              value={fragranceAroma.score}
              onValueChange={(v) => setFragranceAroma((p) => ({ ...p, score: v }))}
              showIntensity
              intensity={fragranceAroma.intensity ?? 0}
              onIntensityChange={(v) => setFragranceAroma((p) => ({ ...p, intensity: v }))}
            />
            <ScoreSlider
              label="Sabor"
              value={flavor.score}
              onValueChange={(v) => setFlavor((p) => ({ ...p, score: v }))}
              showIntensity
              intensity={flavor.intensity ?? 0}
              onIntensityChange={(v) => setFlavor((p) => ({ ...p, intensity: v }))}
            />
            <ScoreSlider
              label="Retrogusto"
              value={aftertaste.score}
              onValueChange={(v) => setAftertaste((p) => ({ ...p, score: v }))}
            />
            <ScoreSlider
              label="Acidez"
              value={acidity.score}
              onValueChange={(v) => setAcidity((p) => ({ ...p, score: v }))}
              showIntensity
              intensity={acidity.intensity ?? 0}
              onIntensityChange={(v) => setAcidity((p) => ({ ...p, intensity: v }))}
            />
            <ScoreSlider
              label="Cuerpo"
              value={body.score}
              onValueChange={(v) => setBody((p) => ({ ...p, score: v }))}
              showIntensity
              intensity={body.intensity ?? 0}
              onIntensityChange={(v) => setBody((p) => ({ ...p, intensity: v }))}
            />
            <ScoreSlider
              label="Balance"
              value={balance.score}
              onValueChange={(v) => setBalance((p) => ({ ...p, score: v }))}
            />

            <SectionHeader step={2} title="Atributos por Taza" />

            <BooleanScoreRow
              label="Uniformidad"
              activeCups={uniformityCups}
              onActiveCupsChange={setUniformityCups}
            />
            <BooleanScoreRow
              label="Taza Limpia"
              activeCups={cleanCupCups}
              onActiveCupsChange={setCleanCupCups}
            />
            <BooleanScoreRow
              label="Dulzor"
              activeCups={sweetnessCups}
              onActiveCupsChange={setSweetnessCups}
            />

            <SectionHeader step={3} title="General & Defectos" />

            <ScoreSlider
              label="General"
              value={overall.score}
              onValueChange={(v) => setOverall((p) => ({ ...p, score: v }))}
            />

            <View style={styles.defectsContainer}>
              <View style={styles.defectItem}>
                <Text style={styles.defectLabel}>Tachas</Text>
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
                </View>
              </View>
              <View style={[styles.defectItem, { flex: 1, marginLeft: 12 }]}>
                <Text style={styles.defectLabel}>Faltas</Text>
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
                </View>
              </View>
            </View>

            <FormField
              label="Notas"
              placeholder="Notas de cata..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: C.backgroundSecondary,
    borderWidth: 1,
    borderColor: C.border,
  },
  saveBtn: {
    backgroundColor: C.caramel,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  metaCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 20,
  },
  metaGrid: {
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: C.textMuted,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: C.text,
    flex: 2,
    textAlign: "right",
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  notesLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: C.textSecondary,
    lineHeight: 20,
  },
  defectCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
  },
  defectCardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.textSecondary,
    marginBottom: 10,
  },
  defectCardRow: {
    flexDirection: "row",
    gap: 10,
  },
  defectBadge: {
    backgroundColor: "#FFF3CD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  defectBadgeFault: {
    backgroundColor: "#FDECEA",
  },
  defectBadgeNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: C.text,
  },
  defectBadgeLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: C.textMuted,
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
  editBanner: {
    backgroundColor: C.caramel,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  editBannerText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  defectsContainer: {
    flexDirection: "row",
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
  defectLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: C.text,
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
  notesInput: {
    minHeight: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
});
