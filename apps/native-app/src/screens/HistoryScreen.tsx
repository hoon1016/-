import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { VideoView, useVideoPlayer } from "expo-video";
import { AppState, RecordingClip } from "../types/domain";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SectionLabel } from "../components/SectionLabel";
import { recordingRepository } from "../repositories/recordingRepository";
import { colors } from "../theme/tokens";
import { errorText } from "../lib/errors";

function ClipVideo({ url }: { url: string }) {
  const player = useVideoPlayer(url, (currentPlayer) => {
    currentPlayer.loop = false;
  });

  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" />;
}

export function HistoryScreen({ appState }: { appState: AppState }) {
  const [selectedDate, setSelectedDate] = useState(appState.recordings[0]?.date ?? "");
  const [selectedClip, setSelectedClip] = useState<RecordingClip | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    const latestDate = appState.recordings[0]?.date;
    if (latestDate && !appState.recordings.some((recording) => recording.date === selectedDate)) {
      setSelectedDate(latestDate);
    }
  }, [appState.recordings, selectedDate]);

  const selectedDay = appState.recordings.find((recording) => recording.date === selectedDate);
  const clips = selectedDay?.clips ?? [];
  const monthLabel = selectedDate
    ? `${Number(selectedDate.slice(0, 4))}년 ${Number(selectedDate.slice(5, 7))}월`
    : "기록 없음";

  const openClip = async (clip: RecordingClip) => {
    if (!clip.storagePath) {
      Alert.alert("재생할 영상 없음", "이 기록에는 저장된 영상이 없습니다.");
      return;
    }
    setSelectedClip(clip);
    setPlaybackUrl(null);
    setSaveStatus(null);
    setIsLoadingVideo(true);
    try {
      setPlaybackUrl(await recordingRepository.createPlaybackUrl(clip.storagePath));
    } catch (error) {
      Alert.alert("영상을 불러오지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요."));
      setSelectedClip(null);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const saveToPhotos = async () => {
    if (!playbackUrl || !selectedClip) return;
    setSaveStatus("사진첩에 저장 중...");
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (permission.status !== "granted") throw new Error("사진첩 저장 권한이 필요합니다.");
      const fileName = `studybet-${selectedClip.date}-${selectedClip.id}.mp4`;
      const download = await FileSystem.downloadAsync(playbackUrl, `${FileSystem.cacheDirectory}${fileName}`);
      await MediaLibrary.createAssetAsync(download.uri);
      setSaveStatus("사진첩에 저장했습니다.");
    } catch (error) {
      setSaveStatus(errorText(error, "사진첩에 저장하지 못했습니다."));
    }
  };

  return (
    <Screen>
      <Card>
        <View style={styles.headRow}>
          <View><SectionLabel>기록 캘린더</SectionLabel><Text style={styles.month}>{monthLabel}</Text></View>
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
        {clips.length ? clips.map((clip) => (
          <Pressable key={clip.id} style={styles.recording} onPress={() => openClip(clip)}>
            <Text style={styles.recordingTitle}>{clip.title}</Text>
            <Text style={styles.recordingMeta}>{clip.date} · {clip.summary}</Text>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoIcon}>▶</Text>
              <Text style={styles.videoText}>{clip.storagePath ? "눌러서 영상 보기" : "영상 준비 중"}</Text>
            </View>
          </Pressable>
        )) : <Text style={styles.empty}>이 날짜에는 아직 남긴 영상 기록이 없어요.</Text>}
      </Card>

      <Modal visible={Boolean(selectedClip)} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedClip(null)}>
        <View style={styles.modal}>
          <View style={styles.modalHead}>
            <View><SectionLabel>캠스터디 영상</SectionLabel><Text style={styles.modalTitle}>{selectedClip?.title}</Text></View>
            <Pressable onPress={() => setSelectedClip(null)} style={styles.closeButton}><Text style={styles.closeLabel}>닫기</Text></Pressable>
          </View>
          {isLoadingVideo ? <View style={styles.loader}><ActivityIndicator color={colors.brand} /><Text style={styles.loadingText}>영상 불러오는 중</Text></View> : playbackUrl ? <ClipVideo url={playbackUrl} /> : null}
          <Text style={styles.modalMeta}>{selectedClip?.date} · {selectedClip?.summary}</Text>
          <Pressable style={styles.saveButton} onPress={saveToPhotos} disabled={!playbackUrl || Boolean(saveStatus?.includes("중"))}>
            <Text style={styles.saveLabel}>사진첩에 저장</Text>
          </Pressable>
          {saveStatus ? <Text style={styles.saveStatus}>{saveStatus}</Text> : <Text style={styles.saveHint}>내 iPhone 사진첩에 MP4 영상으로 저장됩니다.</Text>}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  month: { marginTop: 5, color: colors.text, fontSize: 18, fontWeight: "800" },
  recordedCount: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: "#F7E9DE", color: colors.brandDark, fontSize: 12, fontWeight: "800" },
  calendar: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  day: { width: "22%", minWidth: 72, padding: 12, borderRadius: 16, backgroundColor: "#FCF7F2" },
  daySelected: { backgroundColor: colors.navy }, dayTextSelected: { color: "#FFFFFF" },
  dayDate: { color: colors.text, fontSize: 16, fontWeight: "800" },
  dayCount: { marginTop: 8, color: colors.brandDark, fontSize: 12, fontWeight: "700" },
  empty: { marginTop: 14, color: colors.muted, lineHeight: 20 },
  recording: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
  recordingTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  recordingMeta: { marginTop: 4, color: colors.muted, fontSize: 13 },
  videoPlaceholder: { marginTop: 12, height: 160, borderRadius: 18, backgroundColor: "#251D18", alignItems: "center", justifyContent: "center" },
  videoIcon: { color: "#F4C8A8", fontSize: 24, fontWeight: "800" }, videoText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  modal: { flex: 1, padding: 22, backgroundColor: "#FFFDFC" },
  modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  modalTitle: { marginTop: 5, color: colors.text, fontSize: 20, fontWeight: "800" },
  closeButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: "#F7E9DE" }, closeLabel: { color: colors.brandDark, fontWeight: "800" },
  video: { width: "100%", aspectRatio: 9 / 16, maxHeight: 500, borderRadius: 22, backgroundColor: "#191513" },
  loader: { height: 320, alignItems: "center", justifyContent: "center", gap: 12 }, loadingText: { color: colors.muted, fontWeight: "700" },
  modalMeta: { marginTop: 16, color: colors.muted, lineHeight: 20 },
  saveButton: { marginTop: 24, paddingVertical: 16, borderRadius: 16, backgroundColor: colors.navy, alignItems: "center" }, saveLabel: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  saveHint: { marginTop: 12, color: colors.muted, textAlign: "center", fontSize: 12 }, saveStatus: { marginTop: 12, color: colors.brandDark, textAlign: "center", fontSize: 13, fontWeight: "700" },
});
