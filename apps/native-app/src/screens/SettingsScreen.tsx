import { useEffect, useState } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SectionLabel } from "../components/SectionLabel";
import { groupRepository } from "../repositories/groupRepository";
import { authService } from "../services/authService";
import { colors } from "../theme/tokens";
import { StudyGroupRow } from "../types/supabase";
import { errorText } from "../lib/errors";

type Props = {
  email: string;
  group: StudyGroupRow;
  groups: StudyGroupRow[];
  isOwner: boolean;
  isSessionRunning: boolean;
  onSelectGroup: (group: StudyGroupRow) => void;
  onUpdateGroup: (group: StudyGroupRow) => void;
  onAddGroup: () => void;
};

export function SettingsScreen({ email, group, groups, isOwner, isSessionRunning, onSelectGroup, onUpdateGroup, onAddGroup }: Props) {
  const [goal, setGoal] = useState(String(group.daily_goal_minutes));
  const [awayLimit, setAwayLimit] = useState(String(group.away_limit_minutes));
  const [goalPenalty, setGoalPenalty] = useState(group.goal_penalty_text ?? "아메리카노 사기");
  const [awayPenalty, setAwayPenalty] = useState(group.away_penalty_text ?? "편의점 간식 사기");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setGoal(String(group.daily_goal_minutes));
    setAwayLimit(String(group.away_limit_minutes));
    setGoalPenalty(group.goal_penalty_text ?? "아메리카노 사기");
    setAwayPenalty(group.away_penalty_text ?? "편의점 간식 사기");
  }, [group]);

  const shareInvite = () => Share.share({
    title: `${group.name} 초대`,
    message: `StudyBet에서 같이 공부하자!\n방 이름: ${group.name}\n초대 코드: ${group.invite_code}`,
  });

  const saveRules = async () => {
    const dailyGoalMinutes = Number(goal);
    const awayLimitMinutes = Number(awayLimit);
    if (!Number.isInteger(dailyGoalMinutes) || dailyGoalMinutes < 10 || dailyGoalMinutes > 1440) {
      Alert.alert("목표시간 확인", "하루 목표는 10분부터 1,440분 사이로 입력해 주세요.");
      return;
    }
    if (!Number.isInteger(awayLimitMinutes) || awayLimitMinutes < 1 || awayLimitMinutes > 180) {
      Alert.alert("이탈시간 확인", "이탈 기준은 1분부터 180분 사이로 입력해 주세요.");
      return;
    }
    if (!goalPenalty.trim() || !awayPenalty.trim()) {
      Alert.alert("패널티 확인", "두 패널티 내용을 모두 입력해 주세요.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await groupRepository.updateRules(group.id, {
        dailyGoalMinutes,
        awayLimitMinutes,
        goalPenaltyText: goalPenalty.trim(),
        awayPenaltyText: awayPenalty.trim(),
      });
      onUpdateGroup(updated);
      Alert.alert("저장 완료", "새 규칙은 다음 정산부터 적용됩니다.");
    } catch (error) {
      Alert.alert("저장 실패", errorText(error, "규칙을 저장하지 못했습니다."));
    } finally {
      setIsSaving(false);
    }
  };

  const signOut = () => Alert.alert("로그아웃", "이 기기에서 로그아웃할까요?", [
    { text: "취소", style: "cancel" },
    { text: "로그아웃", style: "destructive", onPress: () => void authService.signOut() },
  ]);

  const selectGroup = (nextGroup: StudyGroupRow) => {
    if (nextGroup.id === group.id) return;
    if (isSessionRunning) {
      Alert.alert("스터디 진행 중", "현재 세션을 마감한 뒤 다른 방으로 이동해 주세요.");
      return;
    }
    onSelectGroup(nextGroup);
  };

  const addGroup = () => {
    if (isSessionRunning) {
      Alert.alert("스터디 진행 중", "현재 세션을 마감한 뒤 새 방을 추가할 수 있어요.");
      return;
    }
    onAddGroup();
  };

  return (
    <Screen>
      <Card>
        <View style={styles.profileRow}>
          <View style={styles.avatar}><Ionicons name="person" size={27} color="#FFFFFF" /></View>
          <View style={styles.profileText}><SectionLabel>내 계정</SectionLabel><Text style={styles.email}>{email}</Text><Text style={styles.role}>{isOwner ? "방장" : "멤버"} · {group.name}</Text></View>
        </View>
      </Card>

      <Card>
        <View style={styles.titleRow}><View><SectionLabel>스터디방</SectionLabel><Text style={styles.cardTitle}>내가 참여 중인 방</Text></View><Pressable style={[styles.addButton, isSessionRunning && styles.disabled]} onPress={addGroup}><Ionicons name="add" size={18} color={colors.brandDark} /><Text style={styles.addLabel}>추가</Text></Pressable></View>
        <View style={styles.groupList}>
          {groups.map((item) => {
            const selected = item.id === group.id;
            return <Pressable key={item.id} style={[styles.groupRow, selected && styles.groupSelected]} onPress={() => selectGroup(item)}>
              <View style={[styles.groupIcon, selected && styles.groupIconSelected]}><Ionicons name="people" size={18} color={selected ? "#FFFFFF" : colors.navy} /></View>
              <View style={styles.groupText}><Text style={styles.groupName}>{item.name}</Text><Text style={styles.groupMeta}>목표 {item.daily_goal_minutes}분 · {item.invite_code}</Text></View>
              {selected && <Ionicons name="checkmark-circle" size={22} color={colors.good} />}
            </Pressable>;
          })}
        </View>
        <Pressable style={styles.inviteButton} onPress={() => void shareInvite()}><Ionicons name="share-social-outline" size={19} color="#FFFFFF" /><Text style={styles.inviteLabel}>초대코드 공유하기</Text></Pressable>
      </Card>

      <Card>
        <SectionLabel>방 규칙</SectionLabel>
        <Text style={styles.cardTitle}>{isOwner ? "목표와 패널티 설정" : "현재 적용 중인 규칙"}</Text>
        <View style={styles.inputGrid}>
          <View style={styles.inputCell}><Text style={styles.inputLabel}>하루 목표 (분)</Text><TextInput editable={isOwner} keyboardType="number-pad" value={goal} onChangeText={setGoal} style={[styles.input, !isOwner && styles.inputDisabled]} /></View>
          <View style={styles.inputCell}><Text style={styles.inputLabel}>이탈 기준 (분)</Text><TextInput editable={isOwner} keyboardType="number-pad" value={awayLimit} onChangeText={setAwayLimit} style={[styles.input, !isOwner && styles.inputDisabled]} /></View>
        </View>
        <Text style={styles.inputLabel}>목표 미달 패널티</Text><TextInput editable={isOwner} value={goalPenalty} onChangeText={setGoalPenalty} style={[styles.input, !isOwner && styles.inputDisabled]} />
        <Text style={styles.inputLabel}>이탈 초과 패널티</Text><TextInput editable={isOwner} value={awayPenalty} onChangeText={setAwayPenalty} style={[styles.input, !isOwner && styles.inputDisabled]} />
        {isOwner ? <Pressable style={[styles.saveButton, isSaving && styles.disabled]} onPress={() => void saveRules()} disabled={isSaving}><Text style={styles.saveLabel}>{isSaving ? "저장 중" : "규칙 저장"}</Text></Pressable> : <Text style={styles.ownerHint}>규칙은 방장만 수정할 수 있어요.</Text>}
      </Card>

      <Pressable style={styles.logoutButton} onPress={signOut}><Ionicons name="log-out-outline" size={19} color={colors.bad} /><Text style={styles.logoutLabel}>로그아웃</Text></Pressable>
      <Text style={styles.version}>StudyBet 0.1.0 · 함께 지키는 공부 약속</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 54, height: 54, borderRadius: 19, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center" },
  profileText: { flex: 1 }, email: { marginTop: 5, color: colors.text, fontSize: 16, fontWeight: "800" }, role: { marginTop: 4, color: colors.muted, fontSize: 12 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, cardTitle: { marginTop: 5, color: colors.text, fontSize: 19, fontWeight: "900", letterSpacing: -0.4 },
  addButton: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.brandSoft }, addLabel: { color: colors.brandDark, fontWeight: "800", fontSize: 12 },
  groupList: { marginTop: 14, gap: 8 }, groupRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 17, backgroundColor: colors.background, borderWidth: 1, borderColor: "transparent" }, groupSelected: { backgroundColor: colors.navySoft, borderColor: "#C8DDD5" },
  groupIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, groupIconSelected: { backgroundColor: colors.navy }, groupText: { flex: 1, marginLeft: 11 }, groupName: { color: colors.text, fontSize: 14, fontWeight: "800" }, groupMeta: { marginTop: 3, color: colors.muted, fontSize: 11 },
  inviteButton: { marginTop: 13, minHeight: 48, borderRadius: 16, backgroundColor: colors.navy, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, inviteLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  inputGrid: { flexDirection: "row", gap: 10, marginTop: 17 }, inputCell: { flex: 1 }, inputLabel: { marginTop: 13, marginBottom: 7, color: colors.muted, fontSize: 11, fontWeight: "800" }, input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: "#FFFFFF", paddingHorizontal: 14, color: colors.text, fontSize: 14, fontWeight: "700" }, inputDisabled: { backgroundColor: colors.background, color: colors.muted },
  saveButton: { marginTop: 17, minHeight: 50, borderRadius: 16, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" }, saveLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" }, disabled: { opacity: 0.55 }, ownerHint: { marginTop: 14, color: colors.muted, fontSize: 12 },
  logoutButton: { minHeight: 54, borderRadius: 18, borderWidth: 1, borderColor: "#F1D8D8", backgroundColor: "#FFF8F8", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, logoutLabel: { color: colors.bad, fontWeight: "800" }, version: { color: colors.muted, fontSize: 11, textAlign: "center", marginBottom: 8 },
});
