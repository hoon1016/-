import { StyleSheet, Text, View } from "react-native";
import { AppState } from "../types/domain";
import { Card } from "../components/Card";
import { colors } from "../theme/tokens";

export function HistoryScreen({ appState }: { appState: AppState }) {
  return (
    <View style={styles.wrap}>
      <Card>
        <Text style={styles.sectionLabel}>기록 캘린더</Text>
        <View style={styles.calendar}>
          {appState.recordings.map((item) => (
            <View key={item.date} style={styles.day}>
              <Text style={styles.dayDate}>{item.date.slice(8)}</Text>
              <Text style={styles.dayCount}>{item.count}개 기록</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>선택한 날짜</Text>
        {appState.recordings.slice(0, 2).map((item) => (
          <View key={item.date} style={styles.recording}>
            <Text style={styles.recordingTitle}>{item.title}</Text>
            <Text style={styles.recordingMeta}>{item.date} · {item.summary}</Text>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoText}>영상 썸네일 / 재생 영역</Text>
            </View>
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
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  day: {
    width: "22%",
    minWidth: 72,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FCF7F2",
  },
  dayDate: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  dayCount: {
    marginTop: 8,
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "700",
  },
  recording: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  recordingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  recordingMeta: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
  videoPlaceholder: {
    marginTop: 12,
    height: 160,
    borderRadius: 18,
    backgroundColor: "#251D18",
    alignItems: "center",
    justifyContent: "center",
  },
  videoText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
