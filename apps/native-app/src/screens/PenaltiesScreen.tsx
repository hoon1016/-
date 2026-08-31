import { StyleSheet, Text, View } from "react-native";
import { AppState } from "../types/domain";
import { Card } from "../components/Card";
import { colors } from "../theme/tokens";

export function PenaltiesScreen({ appState }: { appState: AppState }) {
  return (
    <View style={styles.wrap}>
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
    </View>
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
