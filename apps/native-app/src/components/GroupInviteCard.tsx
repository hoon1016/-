import { Share, StyleSheet, Text, Pressable, View } from "react-native";
import { StudyGroupRow } from "../types/supabase";
import { colors } from "../theme/tokens";

export function GroupInviteCard({ group }: { group: StudyGroupRow }) {
  const shareInvite = async () => {
    await Share.share({
      title: `${group.name} 초대`,
      message: `StudyBet 스터디방 「${group.name}」에 같이 공부하자.\n초대 코드: ${group.invite_code}\n앱에서 초대 코드를 입력하면 바로 참가할 수 있어!`,
    });
  };

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.label}>친구 초대</Text>
        <Text style={styles.name}>{group.name}</Text>
        <Text selectable style={styles.code}>{group.invite_code}</Text>
      </View>
      <Pressable style={styles.shareButton} onPress={() => void shareInvite()}>
        <Text style={styles.shareText}>공유</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 18, backgroundColor: "#FFF7EC", borderWidth: 1, borderColor: "#F0DDC5", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { color: colors.brandDark, fontSize: 12, fontWeight: "800" },
  name: { marginTop: 4, color: colors.text, fontSize: 15, fontWeight: "800" },
  code: { marginTop: 8, color: colors.navy, fontSize: 17, fontWeight: "900", letterSpacing: 0.8 },
  shareButton: { backgroundColor: colors.navy, paddingHorizontal: 17, paddingVertical: 12, borderRadius: 12 },
  shareText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});
