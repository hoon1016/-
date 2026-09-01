import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppState } from "../types/domain";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SectionLabel } from "../components/SectionLabel";
import { colors } from "../theme/tokens";

export function HistoryScreen({ appState }: { appState: AppState }) {
  const [selectedDate, setSelectedDate] = useState(appState.recordings[0]?.date ?? "");
  const selectedRecordings = appState.recordings.filter((recording) => recording.date === selectedDate);
  const monthLabel = selectedDate
    ? `${Number(selectedDate.slice(0, 4))}년 ${Number(selectedDate.slice(5, 7))}월`
    : "기록 없음";

  return (
    <Screen>
      <Card>
        <View style={styles.headRow}>
          <View>
            <SectionLabel>기록 캘린더</SectionLabel>
            <Text style={styles.month}>{monthLabel}</Text>
          </View>
          <Text style={styles.recordedCount}>{appState.recordings.length}일 기록</Text>
        </View>
        <View style={styles.calendar}>
          {appState.recordings.map((item) => (
            <Pressable key={item.date} onPress={() => setSelectedDate(item.date)} style={[styles.day, selectedDate === item.date && styles.daySelected]}>
              <Text style={[styles.dayDate, selectedDate === item.date && styles.dayTextSelected]}>{item.date.slice(8)}</Text>
              <Text style={[styles.dayCount, selectedDate === item.date && styles.dayTextSelected]}>{item.count}개 기록</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <SectionLabel>{selectedDate || "선택한 날짜"}</SectionLabel>
        {selectedRecordings.length ? selectedRecordings.map((item) => (
          <View key={item.date} style={styles.recording}>
            <Text style={styles.recordingTitle}>{item.title}</Text>
            <Text style={styles.recordingMeta}>{item.date} · {item.summary}</Text>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoIcon}>▶</Text>
              <Text style={styles.videoText}>캠스터디 영상 기록</Text>
            </View>
          </View>
        )) : <Text style={styles.empty}>이 날짜에는 아직 남긴 영상 기록이 없어요.</Text>}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  month: {
    marginTop: 5,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  recordedCount: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F7E9DE",
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
  daySelected: {
    backgroundColor: colors.navy,
  },
  dayTextSelected: {
    color: "#FFFFFF",
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
  empty: {
    marginTop: 14,
    color: colors.muted,
    lineHeight: 20,
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
  videoIcon: {
    color: "#F4C8A8",
    fontSize: 24,
    fontWeight: "800",
  },
  videoText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
