import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppState } from "../types/domain";
import { Card } from "../components/Card";
import { colors } from "../theme/tokens";

export function PenaltiesScreen({ appState }: { appState: AppState }) {
  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <Card>
        <Text style={styles.sectionLabel}>이번 주 룰</Text>
        <View style={styles.ruleGrid}>
          <View style={styles.rule}>
            <Text style={styles.ruleNumber}>01</Text>
            <Text style={styles.ruleText}>180분 미달</Text>
            <Text style={styles.rulePenalty}>커피 사기</Text>
          </View>
          <View style={styles.rule}>
            <Text style={styles.ruleNumber}>02</Text>
            <Text style={styles.ruleText}>이탈 20분 초과</Text>
            <Text style={styles.rulePenalty}>간식 사기</Text>
          </View>
        </View>
      </Card>
      <Card>
        <Text style={styles.sectionLabel}>리더보드</Text>
        {appState.friends.map((friend, index) => (
          <View key={friend.id} style={styles.row}>
            <View>
              <Text style={styles.name}>{index + 1}. {friend.name}</Text>
              <Text style={styles.meta}>{friend.focusMinutes}분 집중 · {friend.awayMinutes}분 이탈</Text>
            </View>
            <Text style={styles.status}>{friend.status}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>패널티 보드</Text>
        {appState.penaltyBoard.map((item) => (
          <View key={item.title} style={styles.penalty}>
            <Text style={styles.penaltyTitle}>{item.title}</Text>
            <Text style={styles.penaltyBody}>{item.body}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  sectionLabel: {
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "800",
  },
  ruleGrid: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  rule: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FCF7F2",
  },
  ruleNumber: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "800",
  },
  ruleText: {
    marginTop: 8,
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  rulePenalty: {
    marginTop: 4,
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "700",
  },
  row: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  meta: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
  status: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: "800",
  },
  penalty: {
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FFF4F4",
  },
  penaltyTitle: {
    color: colors.bad,
    fontSize: 14,
    fontWeight: "800",
  },
  penaltyBody: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
  },
});
