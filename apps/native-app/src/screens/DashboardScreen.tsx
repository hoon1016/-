import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppState } from "../types/domain";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SectionLabel } from "../components/SectionLabel";
import { colors } from "../theme/tokens";

export function DashboardScreen({ appState, onStartStudy }: { appState: AppState; onStartStudy: () => void }) {
  const progress = Math.min(100, Math.round((appState.focusMinutes / appState.goalMinutes) * 100));
  return (
    <Screen>
      <LinearGradient colors={["#243646", "#31465C"]} style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroKicker}>YPT + Selog</Text>
          <Text style={styles.heroTitle}>공부시간은 바로 보이고, 캠 존재감은 자연스럽게 남는 앱</Text>
          <Text style={styles.heroBody}>친구끼리 목표와 순위, 체크인을 같이 관리하는 구조입니다.</Text>
        </View>
        <View style={styles.orb}>
          <Text style={styles.orbLabel}>GOAL</Text>
          <Text style={styles.orbValue}>{progress}%</Text>
        </View>
      </LinearGradient>

      <Card>
        <SectionLabel>오늘 공부시간</SectionLabel>
        <Text style={styles.timer}>{String(Math.floor(appState.focusMinutes / 60)).padStart(2, "0")}:{String(appState.focusMinutes % 60).padStart(2, "0")}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>목표 {appState.goalMinutes}분</Text>
          <Text style={styles.metaText}>이탈 {appState.awayMinutes}분</Text>
        </View>
      </Card>

      <Pressable style={styles.startButton} onPress={onStartStudy}>
        <View>
          <Text style={styles.startKicker}>CAM STUDY</Text>
          <Text style={styles.startTitle}>친구들과 지금 공부 시작하기</Text>
        </View>
        <Text style={styles.startArrow}>→</Text>
      </Pressable>

      <View style={styles.grid}>
        <Card>
          <SectionLabel>주간 순위</SectionLabel>
          <Text style={styles.statValue}>{appState.groupRank}위</Text>
          <Text style={styles.metaText}>친구 그룹 기준</Text>
        </Card>
        <Card>
          <SectionLabel>연속 달성</SectionLabel>
          <Text style={styles.statValue}>{appState.streakDays}일</Text>
          <Text style={styles.metaText}>오늘도 이어가는 중</Text>
        </Card>
      </View>

      <Card>
        <SectionLabel>집중 피드</SectionLabel>
        {appState.feed.map((item) => (
          <View key={item.title} style={styles.feedRow}>
            <Text style={styles.feedTitle}>{item.title}</Text>
            <Text style={styles.feedBody}>{item.body}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroText: {
    flex: 1,
    paddingRight: 12,
  },
  heroKicker: {
    color: "#C8D2DD",
    fontSize: 12,
    fontWeight: "800",
  },
  heroTitle: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  heroBody: {
    marginTop: 8,
    color: "#DDE6EF",
    fontSize: 14,
    lineHeight: 20,
  },
  orb: {
    width: 112,
    height: 112,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  orbLabel: {
    color: "#DDE6EF",
    fontSize: 11,
    fontWeight: "700",
  },
  orbValue: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  timer: {
    marginTop: 10,
    fontSize: 48,
    fontWeight: "800",
    color: colors.text,
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "#F2E7DC",
    marginTop: 14,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.brand,
    borderRadius: 999,
  },
  metaRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    color: colors.muted,
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    gap: 14,
  },
  startButton: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: colors.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  startKicker: {
    color: "#D8E4EC",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  startTitle: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  startArrow: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "400",
  },
  statValue: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },
  feedRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  feedTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  feedBody: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
