import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StudyGroupRow } from "../types/supabase";
import { groupRepository } from "../repositories/groupRepository";
import { colors, shadows } from "../theme/tokens";

type SetupMode = "create" | "join";

export function GroupSetupScreen({ groups, onSelect, defaultNickname = "" }: { groups: StudyGroupRow[]; onSelect: (group: StudyGroupRow) => void; defaultNickname?: string }) {
  const [mode, setMode] = useState<SetupMode>(groups.length ? "join" : "create");
  const [nickname, setNickname] = useState(defaultNickname);
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [goalMinutes, setGoalMinutes] = useState("180");
  const [awayLimitMinutes, setAwayLimitMinutes] = useState("15");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const validNickname = () => {
    const value = nickname.trim();
    if (value.length >= 2) return value;
    setMessage("친구들이 알아볼 닉네임을 2글자 이상 입력해 주세요.");
    return null;
  };

  const run = async (action: () => Promise<void>, fallback: string) => {
    setMessage(null); setIsSaving(true);
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : fallback); } finally { setIsSaving(false); }
  };

  const createGroup = () => {
    const name = groupName.trim();
    const memberName = validNickname();
    const goal = Number(goalMinutes);
    const away = Number(awayLimitMinutes);
    if (!memberName) return;
    if (name.length < 2 || name.length > 40) return setMessage("방 이름은 2글자 이상 40글자 이하로 입력해 주세요.");
    if (!Number.isInteger(goal) || goal < 10 || goal > 1440) return setMessage("목표시간은 10분부터 1,440분 사이로 입력해 주세요.");
    if (!Number.isInteger(away) || away < 1 || away > 180) return setMessage("이탈 기준은 1분부터 180분 사이로 입력해 주세요.");
    return run(async () => onSelect(await groupRepository.createGroup({ name, dailyGoalMinutes: goal, awayLimitMinutes: away, nickname: memberName })), "방을 만들지 못했습니다.");
  };

  const joinGroup = () => {
    const memberName = validNickname();
    if (!memberName) return;
    if (!inviteCode.trim()) return setMessage("친구에게 받은 초대코드를 입력해 주세요.");
    return run(async () => {
      const member = await groupRepository.joinByInviteCode(inviteCode, memberName);
      const group = await groupRepository.getGroupById(member.group_id);
      if (!group) throw new Error("스터디방을 찾지 못했습니다.");
      onSelect(group);
    }, "초대코드를 확인해 주세요.");
  };

  return <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
    <View style={styles.brand}><View style={styles.brandMark}><Text style={styles.brandMarkText}>S</Text></View><Text style={styles.wordmark}>STUDYBET</Text></View>
    <Text style={styles.title}>함께하면, 더 오래 집중해요.</Text>
    <Text style={styles.body}>친구와 목표를 정하고 캠을 켜세요. 결과와 패널티는 StudyBet이 정리해 드려요.</Text>

    {!!groups.length && <View style={styles.recentWrap}><Text style={styles.sectionLabel}>내 스터디방</Text>{groups.map((group) => <Pressable key={group.id} style={styles.groupRow} onPress={() => onSelect(group)}><View style={styles.groupIcon}><Ionicons name="people" size={20} color={colors.navy} /></View><View style={styles.groupCopy}><Text style={styles.groupName}>{group.name}</Text><Text style={styles.groupMeta}>목표 {group.daily_goal_minutes}분 · {group.invite_code}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} /></Pressable>)}</View>}

    <View style={styles.card}>
      <View style={styles.tabs}><Pressable style={[styles.tab, mode === "create" && styles.activeTab]} onPress={() => { setMode("create"); setMessage(null); }}><Text style={[styles.tabLabel, mode === "create" && styles.activeTabLabel]}>새 방 만들기</Text></Pressable><Pressable style={[styles.tab, mode === "join" && styles.activeTab]} onPress={() => { setMode("join"); setMessage(null); }}><Text style={[styles.tabLabel, mode === "join" && styles.activeTabLabel]}>코드로 참가</Text></Pressable></View>
      <Text style={styles.inputLabel}>내 닉네임</Text><TextInput style={styles.input} placeholder="예: 후니" placeholderTextColor="#A3ACA6" value={nickname} onChangeText={setNickname} />
      {mode === "create" ? <>
        <Text style={styles.inputLabel}>스터디방 이름</Text><TextInput style={styles.input} placeholder="예: 토익 800 챌린지" placeholderTextColor="#A3ACA6" value={groupName} onChangeText={setGroupName} />
        <View style={styles.inputGrid}><View style={styles.inputCell}><Text style={styles.inputLabel}>하루 목표 (분)</Text><TextInput style={styles.input} keyboardType="number-pad" value={goalMinutes} onChangeText={setGoalMinutes} /></View><View style={styles.inputCell}><Text style={styles.inputLabel}>이탈 기준 (분)</Text><TextInput style={styles.input} keyboardType="number-pad" value={awayLimitMinutes} onChangeText={setAwayLimitMinutes} /></View></View>
        <Pressable style={[styles.primary, isSaving && styles.disabled]} onPress={() => void createGroup()} disabled={isSaving}><Ionicons name="add-circle" size={20} color="#FFFFFF" /><Text style={styles.primaryLabel}>{isSaving ? "만드는 중" : "스터디방 만들기"}</Text></Pressable>
      </> : <>
        <Text style={styles.inputLabel}>초대코드</Text><TextInput autoCapitalize="characters" style={[styles.input, styles.codeInput]} placeholder="STB-XXXXXXXX" placeholderTextColor="#A3ACA6" value={inviteCode} onChangeText={setInviteCode} />
        <Pressable style={[styles.primary, isSaving && styles.disabled]} onPress={() => void joinGroup()} disabled={isSaving}><Ionicons name="enter" size={20} color="#FFFFFF" /><Text style={styles.primaryLabel}>{isSaving ? "입장 중" : "스터디방 입장하기"}</Text></Pressable>
      </>}
      {message && <View style={styles.message}><Ionicons name="information-circle" size={17} color={colors.brandDark} /><Text style={styles.messageText}>{message}</Text></View>}
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40, backgroundColor: colors.background, flexGrow: 1 }, brand: { flexDirection: "row", alignItems: "center", gap: 9 }, brandMark: { width: 29, height: 29, borderRadius: 10, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }, brandMarkText: { color: "#FFFFFF", fontWeight: "900" }, wordmark: { color: colors.text, fontSize: 15, fontWeight: "900", letterSpacing: 1.5 },
  title: { marginTop: 29, color: colors.text, fontSize: 30, lineHeight: 39, fontWeight: "900", letterSpacing: -1 }, body: { marginTop: 10, color: colors.muted, fontSize: 14, lineHeight: 21 }, sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.5, marginBottom: 9 }, recentWrap: { marginTop: 25 }, groupRow: { marginBottom: 8, padding: 13, borderRadius: 18, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line }, groupIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.navySoft, alignItems: "center", justifyContent: "center" }, groupCopy: { flex: 1, marginLeft: 11 }, groupName: { color: colors.text, fontSize: 14, fontWeight: "900" }, groupMeta: { marginTop: 3, color: colors.muted, fontSize: 10 },
  card: { marginTop: 22, padding: 18, borderRadius: 27, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, ...shadows.card }, tabs: { padding: 4, borderRadius: 15, flexDirection: "row", backgroundColor: colors.background }, tab: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 12 }, activeTab: { backgroundColor: colors.navy }, tabLabel: { color: colors.muted, fontSize: 12, fontWeight: "800" }, activeTabLabel: { color: "#FFFFFF" },
  inputLabel: { marginTop: 15, marginBottom: 7, color: colors.muted, fontSize: 11, fontWeight: "800" }, input: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 15, paddingHorizontal: 14, backgroundColor: "#FCFDFC", color: colors.text, fontSize: 14, fontWeight: "700" }, codeInput: { letterSpacing: 1, fontWeight: "900" }, inputGrid: { flexDirection: "row", gap: 10 }, inputCell: { flex: 1 }, primary: { marginTop: 19, minHeight: 54, borderRadius: 17, backgroundColor: colors.brand, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, primaryLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, disabled: { opacity: 0.55 }, message: { marginTop: 13, padding: 12, borderRadius: 14, backgroundColor: colors.brandSoft, flexDirection: "row", gap: 7 }, messageText: { flex: 1, color: colors.brandDark, fontSize: 11, lineHeight: 17, fontWeight: "600" },
});
