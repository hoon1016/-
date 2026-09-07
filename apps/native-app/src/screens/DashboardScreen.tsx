import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppState } from "../types/domain";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SectionLabel } from "../components/SectionLabel";
import { colors } from "../theme/tokens";

const timeLabel = (minutes: number) => `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`;

type Props = { appState: AppState; onStartStudy: () => void; onOpenPenalties: () => void };

export function DashboardScreen({ appState, onStartStudy, onOpenPenalties }: Props) {
  const progress = appState.goalMinutes ? Math.min(100, Math.round((appState.focusMinutes / appState.goalMinutes) * 100)) : 0;
  const remaining = Math.max(0, appState.goalMinutes - appState.focusMinutes);
  const ranked = [...appState.friends].sort((a, b) => b.focusMinutes - a.focusMinutes);
  const activeFriends = appState.friends.filter((friend) => friend.status === "집중").length;

  const shareInvite = () => Share.share({
    title: `${appState.groupName} 초대`,
    message: `StudyBet에서 같이 공부하자!\n방 이름: ${appState.groupName}\n초대 코드: ${appState.inviteCode}`,
  });

  return (
    <Screen>
      <LinearGradient colors={["#173C35", "#24584D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTop}><Text style={styles.heroKicker}>TODAY'S FOCUS</Text><View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveLabel}>{activeFriends ? `${activeFriends}명 집중 중` : "첫 집중을 시작해요"}</Text></View></View>
        <Text style={styles.heroTime}>{timeLabel(appState.focusMinutes)}</Text>
        <Text style={styles.heroMessage}>{progress >= 100 ? "오늘의 약속을 지켰어요" : `목표까지 ${remaining}분 남았어요`}</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
        <View style={styles.progressMeta}><Text style={styles.progressText}>{progress}% 달성</Text><Text style={styles.progressText}>목표 {timeLabel(appState.goalMinutes)}</Text></View>
        <Pressable style={styles.startButton} onPress={onStartStudy}><View style={styles.playCircle}><Ionicons name="play" size={18} color={colors.navy} /></View><Text style={styles.startLabel}>{appState.sessionStatus === "집중 중" ? "진행 중인 스터디로 돌아가기" : "캠스터디 시작하기"}</Text><Ionicons name="arrow-forward" size={20} color="#FFFFFF" /></Pressable>
      </LinearGradient>

      <View style={styles.statGrid}>
        <Card style={styles.statCard}><View style={styles.statIcon}><Ionicons name="flame" size={19} color={colors.brand} /></View><Text style={styles.statValue}>{appState.streakDays}일</Text><Text style={styles.statLabel}>연속 집중</Text></Card>
        <Card style={styles.statCard}><View style={[styles.statIcon, styles.rankIcon]}><Ionicons name="trophy" size={18} color="#D18A19" /></View><Text style={styles.statValue}>{appState.groupRank ? `${appState.groupRank}위` : "-"}</Text><Text style={styles.statLabel}>그룹 순위</Text></Card>
        <Pressable style={styles.penaltyStat} onPress={onOpenPenalties}><View style={[styles.statIcon, styles.penaltyIcon]}><Ionicons name="cafe" size={19} color={colors.bad} /></View><Text style={styles.statValue}>{appState.penaltyCount}건</Text><Text style={styles.statLabel}>내 패널티</Text></Pressable>
      </View>

      <Card>
        <View style={styles.sectionHead}><View><SectionLabel>STUDY CREW</SectionLabel><Text style={styles.sectionTitle}>오늘의 리더보드</Text></View><Text style={styles.memberCount}>{appState.friends.length}명</Text></View>
        {ranked.length ? ranked.slice(0, 5).map((friend, index) => (
          <View key={friend.id} style={styles.friendRow}>
            <Text style={[styles.rank, index === 0 && styles.rankFirst]}>{index + 1}</Text>
            <View style={styles.friendAvatar}><Text style={styles.avatarText}>{friend.name.slice(0, 1)}</Text><View style={[styles.presence, friend.status === "집중" && styles.presenceOnline]} /></View>
            <View style={styles.friendInfo}><Text style={styles.friendName}>{friend.name}</Text><Text style={styles.friendMeta}>{friend.status} · 이탈 {friend.awayMinutes}분</Text></View>
            <Text style={styles.friendTime}>{timeLabel(friend.focusMinutes)}</Text>
          </View>
        )) : <View style={styles.empty}><Ionicons name="people-outline" size={28} color={colors.muted} /><Text style={styles.emptyTitle}>아직 함께하는 친구가 없어요</Text><Text style={styles.emptyText}>초대코드를 공유해 첫 스터디 메이트를 불러보세요.</Text></View>}
      </Card>

      <Pressable style={styles.inviteCard} onPress={() => void shareInvite()}>
        <View style={styles.inviteIcon}><Ionicons name="paper-plane" size={21} color={colors.brandDark} /></View>
        <View style={styles.inviteCopy}><Text style={styles.inviteTitle}>친구 초대하기</Text><Text style={styles.inviteCode}>{appState.inviteCode}</Text></View>
        <Ionicons name="chevron-forward" size={21} color={colors.muted} />
      </Pressable>

      {!!appState.feed.length && <Card><SectionLabel>오늘의 체크</SectionLabel>{appState.feed.slice(0, 2).map((item) => <View key={item.title} style={styles.feedRow}><View style={[styles.feedMark, item.tone === "good" && styles.feedMarkGood]}><Ionicons name={item.tone === "good" ? "checkmark" : "sparkles"} size={14} color="#FFFFFF" /></View><View style={styles.feedCopy}><Text style={styles.feedTitle}>{item.title}</Text><Text style={styles.feedBody}>{item.body}</Text></View></View>)}</Card>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 30, padding: 22, overflow: "hidden" }, heroGlow: { position: "absolute", width: 180, height: 180, borderRadius: 90, right: -55, top: -75, backgroundColor: "rgba(255,255,255,0.08)" },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, heroKicker: { color: "#A8CBC2", fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }, livePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.1)" }, liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#78E0A8" }, liveLabel: { color: "#DDF3EC", fontSize: 10, fontWeight: "800" },
  heroTime: { marginTop: 26, color: "#FFFFFF", fontSize: 42, fontWeight: "900", letterSpacing: -1.5 }, heroMessage: { marginTop: 6, color: "#D5E7E2", fontSize: 14, fontWeight: "600" }, progressTrack: { marginTop: 23, height: 8, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.14)", overflow: "hidden" }, progressFill: { height: "100%", borderRadius: 99, backgroundColor: "#FF8468" }, progressMeta: { marginTop: 9, flexDirection: "row", justifyContent: "space-between" }, progressText: { color: "#BED4CE", fontSize: 11, fontWeight: "700" },
  startButton: { marginTop: 23, minHeight: 57, borderRadius: 18, backgroundColor: colors.brand, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, gap: 11 }, playCircle: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, startLabel: { flex: 1, color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  statGrid: { flexDirection: "row", gap: 9 }, statCard: { flex: 1, padding: 16 }, penaltyStat: { flex: 1, padding: 16, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line }, statIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" }, rankIcon: { backgroundColor: "#FFF7E4" }, penaltyIcon: { backgroundColor: "#FFF0F0" }, statValue: { marginTop: 13, color: colors.text, fontSize: 20, fontWeight: "900" }, statLabel: { marginTop: 3, color: colors.muted, fontSize: 11, fontWeight: "600" },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, sectionTitle: { marginTop: 5, color: colors.text, fontSize: 20, fontWeight: "900" }, memberCount: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.navySoft, borderRadius: 999, color: colors.navy, fontSize: 11, fontWeight: "800" },
  friendRow: { flexDirection: "row", alignItems: "center", marginTop: 16 }, rank: { width: 22, color: colors.muted, fontSize: 13, fontWeight: "800" }, rankFirst: { color: colors.brand }, friendAvatar: { width: 39, height: 39, borderRadius: 14, backgroundColor: colors.panel, alignItems: "center", justifyContent: "center" }, avatarText: { color: colors.navy, fontSize: 14, fontWeight: "900" }, presence: { position: "absolute", right: -1, bottom: -1, width: 10, height: 10, borderRadius: 5, backgroundColor: "#BBC3BE", borderWidth: 2, borderColor: "#FFFFFF" }, presenceOnline: { backgroundColor: colors.good }, friendInfo: { flex: 1, marginLeft: 11 }, friendName: { color: colors.text, fontSize: 14, fontWeight: "800" }, friendMeta: { marginTop: 3, color: colors.muted, fontSize: 10 }, friendTime: { color: colors.navy, fontSize: 13, fontWeight: "900" },
  empty: { paddingVertical: 27, alignItems: "center" }, emptyTitle: { marginTop: 10, color: colors.text, fontSize: 14, fontWeight: "800" }, emptyText: { marginTop: 5, color: colors.muted, fontSize: 11, textAlign: "center" },
  inviteCard: { padding: 17, borderRadius: 22, backgroundColor: colors.brandSoft, borderWidth: 1, borderColor: "#FFDCD3", flexDirection: "row", alignItems: "center" }, inviteIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, inviteCopy: { flex: 1, marginLeft: 12 }, inviteTitle: { color: colors.text, fontSize: 14, fontWeight: "900" }, inviteCode: { marginTop: 4, color: colors.brandDark, fontSize: 12, fontWeight: "800", letterSpacing: 0.7 },
  feedRow: { flexDirection: "row", marginTop: 15 }, feedMark: { width: 28, height: 28, borderRadius: 10, backgroundColor: colors.warn, alignItems: "center", justifyContent: "center" }, feedMarkGood: { backgroundColor: colors.good }, feedCopy: { flex: 1, marginLeft: 10 }, feedTitle: { color: colors.text, fontSize: 13, fontWeight: "800" }, feedBody: { marginTop: 3, color: colors.muted, fontSize: 11, lineHeight: 16 },
});
