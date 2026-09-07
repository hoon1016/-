import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppState, PenaltyItem } from "../types/domain";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SectionLabel } from "../components/SectionLabel";
import { colors } from "../theme/tokens";
import { penaltyRepository } from "../repositories/penaltyRepository";
import { errorText } from "../lib/errors";

const statusLabel = { assigned: "확인 필요", accepted: "수행 예정", completed: "완료" } as const;

export function PenaltiesScreen({ appState, userId }: { appState: AppState; userId?: string }) {
  const [items, setItems] = useState(appState.penaltyBoard);
  useEffect(() => setItems(appState.penaltyBoard), [appState.penaltyBoard]);

  const updateStatus = async (item: PenaltyItem) => {
    if (!item.id || item.userId !== userId || item.status === "completed") return;
    const status = item.status === "assigned" ? "accepted" : "completed";
    try {
      await penaltyRepository.updateStatus(item.id, status);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
    } catch (error) {
      Alert.alert("상태 변경 실패", errorText(error, "잠시 후 다시 시도해 주세요."));
    }
  };

  return (
    <Screen>
      <Card>
        <View style={styles.ruleHead}><View><SectionLabel>ROOM RULES</SectionLabel><Text style={styles.title}>우리 방의 약속</Text></View><View style={styles.ruleBadge}><Ionicons name="shield-checkmark" size={18} color={colors.good} /></View></View>
        <View style={styles.ruleGrid}>
          <View style={styles.rule}><Text style={styles.ruleIndex}>01</Text><Text style={styles.ruleTitle}>목표 미달</Text><Text style={styles.ruleValue}>하루 {appState.goalMinutes}분</Text><Text style={styles.rulePenalty}>{appState.goalPenaltyText}</Text></View>
          <View style={styles.rule}><Text style={styles.ruleIndex}>02</Text><Text style={styles.ruleTitle}>장시간 이탈</Text><Text style={styles.ruleValue}>{appState.awayLimitMinutes}분 초과</Text><Text style={styles.rulePenalty}>{appState.awayPenaltyText}</Text></View>
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHead}><View><SectionLabel>PENALTY BOX</SectionLabel><Text style={styles.title}>배정된 패널티</Text></View><Text style={styles.count}>{items.filter((item) => item.status !== "completed").length}건 진행 중</Text></View>
        {items.length ? items.map((item) => {
          const mine = item.userId === userId;
          const status = item.status ?? "assigned";
          return <View key={item.id ?? `${item.title}-${item.body}`} style={[styles.penalty, status === "completed" && styles.completed]}>
            <View style={styles.penaltyIcon}><Ionicons name={status === "completed" ? "checkmark" : "cafe"} size={19} color={status === "completed" ? colors.good : colors.brandDark} /></View>
            <View style={styles.penaltyCopy}><Text style={styles.penaltyTitle}>{item.title}</Text><Text style={styles.penaltyBody}>{item.body}</Text><Text style={styles.status}>{statusLabel[status]}</Text></View>
            {mine && status !== "completed" && <Pressable style={styles.statusButton} onPress={() => void updateStatus(item)}><Text style={styles.statusButtonLabel}>{status === "assigned" ? "확인" : "완료"}</Text></Pressable>}
          </View>;
        }) : <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name="sparkles" size={25} color={colors.good} /></View><Text style={styles.emptyTitle}>아직 패널티가 없어요</Text><Text style={styles.emptyText}>지금처럼 목표와 이탈 규칙을 지켜주세요.</Text></View>}
      </Card>

      {appState.friends.length > 1 && <Card><SectionLabel>LEADERBOARD</SectionLabel><Text style={styles.title}>집중 순위</Text>{[...appState.friends].sort((a, b) => b.focusMinutes - a.focusMinutes).map((friend, index) => <View key={friend.id} style={styles.rankRow}><Text style={styles.rankNumber}>{index + 1}</Text><View style={styles.rankAvatar}><Text style={styles.rankAvatarText}>{friend.name.slice(0, 1)}</Text></View><View style={styles.rankCopy}><Text style={styles.rankName}>{friend.name}</Text><Text style={styles.rankMeta}>집중 {friend.focusMinutes}분 · 이탈 {friend.awayMinutes}분</Text></View><Text style={styles.rankPenalty}>{friend.penalties}건</Text></View>)}</Card>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  ruleHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, ruleBadge: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.navySoft, alignItems: "center", justifyContent: "center" }, title: { marginTop: 5, color: colors.text, fontSize: 20, fontWeight: "900" },
  ruleGrid: { flexDirection: "row", gap: 10, marginTop: 17 }, rule: { flex: 1, padding: 15, borderRadius: 18, backgroundColor: colors.background }, ruleIndex: { color: colors.brand, fontSize: 10, fontWeight: "900" }, ruleTitle: { marginTop: 9, color: colors.text, fontSize: 13, fontWeight: "900" }, ruleValue: { marginTop: 4, color: colors.muted, fontSize: 11 }, rulePenalty: { marginTop: 12, color: colors.brandDark, fontSize: 12, fontWeight: "800" },
  sectionHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }, count: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.brandSoft, color: colors.brandDark, fontSize: 10, fontWeight: "800" },
  penalty: { marginTop: 13, padding: 13, borderRadius: 17, backgroundColor: "#FFF6F2", flexDirection: "row", alignItems: "center" }, completed: { backgroundColor: "#F1F6F3", opacity: 0.72 }, penaltyIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, penaltyCopy: { flex: 1, marginLeft: 11 }, penaltyTitle: { color: colors.text, fontSize: 13, fontWeight: "800" }, penaltyBody: { marginTop: 3, color: colors.muted, fontSize: 11 }, status: { marginTop: 6, color: colors.brandDark, fontSize: 10, fontWeight: "800" }, statusButton: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11, backgroundColor: colors.navy }, statusButtonLabel: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  empty: { paddingVertical: 30, alignItems: "center" }, emptyIcon: { width: 50, height: 50, borderRadius: 18, backgroundColor: colors.navySoft, alignItems: "center", justifyContent: "center" }, emptyTitle: { marginTop: 11, color: colors.text, fontSize: 14, fontWeight: "900" }, emptyText: { marginTop: 5, color: colors.muted, fontSize: 11 },
  rankRow: { marginTop: 15, flexDirection: "row", alignItems: "center" }, rankNumber: { width: 21, color: colors.muted, fontSize: 12, fontWeight: "800" }, rankAvatar: { width: 37, height: 37, borderRadius: 13, backgroundColor: colors.panel, alignItems: "center", justifyContent: "center" }, rankAvatarText: { color: colors.navy, fontWeight: "900" }, rankCopy: { flex: 1, marginLeft: 10 }, rankName: { color: colors.text, fontSize: 13, fontWeight: "800" }, rankMeta: { marginTop: 3, color: colors.muted, fontSize: 10 }, rankPenalty: { color: colors.bad, fontSize: 11, fontWeight: "800" },
});
