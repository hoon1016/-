import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/tokens";

export function HeaderBar({
  title,
  subtitle,
  status,
  camera,
  onOpenGroups,
  onOpenSettings,
}: {
  title: string;
  subtitle: string;
  status: string;
  camera: string;
  onOpenGroups?: () => void;
  onOpenSettings?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>S</Text></View><Text style={styles.wordmark}>STUDYBET</Text></View>
        <Pressable style={styles.iconButton} onPress={onOpenSettings}><Ionicons name="settings-outline" size={21} color={colors.text} /></Pressable>
      </View>
      <View style={styles.titleRow}>
        <View><Text style={styles.title}>{title}</Text><Pressable onPress={onOpenGroups} style={styles.groupButton}><Text style={styles.subtitle}>{subtitle}</Text><Ionicons name="chevron-down" size={14} color={colors.muted} /></Pressable></View>
        <View style={[styles.liveDot, status === "집중 중" && styles.liveDotActive]}><View style={styles.dot} /><Text style={styles.liveText}>{status === "집중 중" ? camera : status}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 17,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: { width: 27, height: 27, borderRadius: 9, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  wordmark: { color: colors.text, fontSize: 14, fontWeight: "900", letterSpacing: 1.5 },
  iconButton: { width: 40, height: 40, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.8,
  },
  groupButton: { marginTop: 5, flexDirection: "row", alignItems: "center", gap: 3 },
  subtitle: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 14,
  },
  liveDot: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.panel, flexDirection: "row", alignItems: "center", gap: 6 },
  liveDotActive: { backgroundColor: colors.navySoft },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.good },
  liveText: { color: colors.navy, fontSize: 11, fontWeight: "800" },
});
