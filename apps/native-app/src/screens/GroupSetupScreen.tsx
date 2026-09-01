import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StudyGroupRow } from "../types/supabase";
import { groupRepository } from "../repositories/groupRepository";
import { colors } from "../theme/tokens";

export function GroupSetupScreen({
  groups,
  onSelect,
}: {
  groups: StudyGroupRow[];
  onSelect: (group: StudyGroupRow) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const createGroup = async () => {
    setIsSaving(true);
    try {
      const group = await groupRepository.createGroup({ name: groupName, dailyGoalMinutes: 180, awayLimitMinutes: 15, nickname });
      onSelect(group);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "스터디방을 만들지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };
  const joinGroup = async () => {
    setIsSaving(true);
    try {
      const member = await groupRepository.joinByInviteCode(inviteCode, nickname);
      const group = await groupRepository.getGroupById(member.group_id);
      if (!group) throw new Error("스터디방 정보를 찾지 못했습니다.");
      onSelect(group);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "초대코드를 확인해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>스터디방 시작하기</Text>
      <Text style={styles.body}>처음에는 방을 만들거나 친구에게 받은 초대코드로 입장하면 됩니다.</Text>
      {groups.map((group) => (
        <Pressable key={group.id} style={styles.groupRow} onPress={() => onSelect(group)}>
          <View><Text style={styles.groupName}>{group.name}</Text><Text style={styles.groupMeta}>초대코드 {group.invite_code}</Text></View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      ))}
      <View style={styles.card}>
        <Text style={styles.label}>내 닉네임</Text>
        <TextInput style={styles.input} placeholder="예: 후니" value={nickname} onChangeText={setNickname} />
        <Text style={[styles.label, styles.top]}>새 스터디방 이름</Text>
        <TextInput style={styles.input} placeholder="예: 토익 800 달성반" value={groupName} onChangeText={setGroupName} />
        <Pressable style={[styles.primary, isSaving && styles.disabled]} onPress={createGroup} disabled={isSaving}>
          <Text style={styles.primaryText}>새 방 만들기</Text>
        </Pressable>
        <Text style={[styles.label, styles.top]}>친구 초대코드</Text>
        <TextInput autoCapitalize="characters" style={styles.input} placeholder="STB-XXXXXXXX" value={inviteCode} onChangeText={setInviteCode} />
        <Pressable style={[styles.secondary, isSaving && styles.disabled]} onPress={joinGroup} disabled={isSaving}>
          <Text style={styles.secondaryText}>초대코드로 입장</Text>
        </Pressable>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 14, backgroundColor: colors.background, flexGrow: 1 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 30 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  groupRow: { backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  groupName: { color: colors.text, fontSize: 16, fontWeight: "800" },
  groupMeta: { color: colors.muted, fontSize: 12, marginTop: 5 },
  arrow: { color: colors.brand, fontSize: 24 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, marginTop: 4 },
  label: { color: colors.text, fontSize: 13, fontWeight: "800" },
  top: { marginTop: 16 },
  input: { marginTop: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 13, fontSize: 15, color: colors.text },
  primary: { backgroundColor: colors.brand, borderRadius: 13, alignItems: "center", padding: 14, marginTop: 12 },
  primaryText: { color: "#FFFFFF", fontWeight: "800" },
  secondary: { backgroundColor: "#F4ECE3", borderRadius: 13, alignItems: "center", padding: 14, marginTop: 12 },
  secondaryText: { color: colors.text, fontWeight: "800" },
  message: { color: colors.brandDark, marginTop: 12, fontSize: 13 },
  disabled: { opacity: 0.55 },
});
