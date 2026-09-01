import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { AppState } from "../types/domain";
import { Card } from "../components/Card";
import { colors } from "../theme/tokens";
import { SessionControls } from "../hooks/useStudySession";

export function StudyRoomScreen({
  appState,
  sessionControls,
}: {
  appState: AppState;
  sessionControls: SessionControls;
}) {
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [, requestMicrophonePermission] = useMicrophonePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("대기");

  const ensurePermissions = async () => {
    const camera = cameraPermission?.granted ? cameraPermission : await requestCameraPermission();
    if (!camera?.granted) return false;
    const microphone = await requestMicrophonePermission();
    return microphone.granted;
  };

  const startCameraSession = async () => {
    const granted = await ensurePermissions();
    if (!granted) {
      setRecordingStatus("권한 필요");
      return false;
    }
    sessionControls.markCameraReady(true);
    setRecordingStatus("카메라 준비 완료");
    return true;
  };

  const startRecording = async () => {
    if (!cameraRef.current || isRecording || !sessionControls.canRecord) return;
    try {
      setIsRecording(true);
      setRecordingStatus("녹화 중");
      const result = await cameraRef.current.recordAsync({
        maxDuration: 300,
      });
      if (result?.uri) {
        sessionControls.attachRecordedClip(result.uri);
      }
    } catch {
      setRecordingStatus("녹화 실패");
    } finally {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
    setIsRecording(false);
    setRecordingStatus("녹화 완료");
  };

  const handleStudyStart = async () => {
    const ready = await startCameraSession();
    if (!ready) return;
    sessionControls.startSession();
    setRecordingStatus("세션 진행 중");
  };

  const handleStudyEnd = async () => {
    if (isRecording) stopRecording();
    await sessionControls.endSession();
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
      <View style={styles.cameraStage}>
        <View style={styles.cameraHeader}>
          <Text style={styles.liveBadge}>LIVE ROOM</Text>
          <Text style={styles.subtleBadge}>Front Camera</Text>
        </View>
        <View style={styles.cameraPreviewWrap}>
          {sessionControls.canRecord ? (
            <CameraView
              ref={cameraRef}
              style={styles.cameraPreview}
              facing="front"
              mode="video"
              active
            />
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraText}>카메라 프리뷰 영역</Text>
              <Text style={styles.cameraSubtext}>실기기에서 카메라 권한을 허용하면 바로 프리뷰가 열립니다.</Text>
            </View>
          )}
        </View>
        <View style={styles.cameraFooter}>
          <View>
            <Text style={styles.cameraFooterLabel}>Focus Stage</Text>
            <Text style={styles.cameraFooterTitle}>셀로그처럼 켜두고 같이 달리는 세션</Text>
          </View>
          <Text style={styles.cameraFooterLabel}>StudyBet Cam</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.sectionLabel}>실시간 상태</Text>
        <Text style={styles.statusValue}>{appState.sessionStatus}</Text>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>오늘 공부</Text>
            <Text style={styles.metricValue}>{appState.focusMinutes}분</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>자리비움</Text>
            <Text style={styles.metricValue}>{appState.awayMinutes}분</Text>
          </View>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>카메라</Text>
            <Text style={styles.metricValue}>{appState.cameraStatus}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>녹화</Text>
            <Text style={styles.metricValue}>{recordingStatus}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable style={[styles.primaryAction, sessionControls.isRunning && styles.primaryActionDisabled]} onPress={handleStudyStart} disabled={sessionControls.isRunning}>
            <Text style={styles.primaryActionLabel}>{sessionControls.isRunning ? "공부 진행 중" : "공부 시작"}</Text>
          </Pressable>
          <Pressable style={[styles.secondaryAction, !sessionControls.isRunning && styles.primaryActionDisabled]} onPress={sessionControls.toggleAway} disabled={!sessionControls.isRunning}>
            <Text style={styles.secondaryActionLabel}>{sessionControls.isAway ? "공부 복귀" : "잠깐 자리비움"}</Text>
          </Pressable>
          <Pressable style={[styles.recordAction, (!sessionControls.isRunning || !sessionControls.canRecord) && styles.primaryActionDisabled]} onPress={isRecording ? stopRecording : startRecording} disabled={!sessionControls.isRunning || !sessionControls.canRecord}>
            <Text style={styles.recordActionLabel}>{isRecording ? "영상 기록 저장 중" : "영상 기록 시작"}</Text>
          </Pressable>
          <Pressable style={styles.ghostAction} onPress={handleStudyEnd} disabled={!sessionControls.isRunning}>
            <Text style={styles.ghostActionLabel}>세션 마감</Text>
          </Pressable>
        </View>
      </Card>

      {!!appState.lastSessionResults.length && (
        <Card>
          <Text style={styles.sectionLabel}>이번 세션 자동 정산</Text>
          {appState.lastSessionResults.map((result) => (
            <View key={`${result.title}-${result.body}`} style={[styles.resultRow, result.tone === "warn" ? styles.resultWarn : styles.resultGood]}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              <Text style={styles.resultBody}>{result.body}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  cameraStage: {
    borderRadius: 28,
    backgroundColor: "#251D18",
    minHeight: 360,
    padding: 18,
    justifyContent: "space-between",
  },
  cameraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cameraPreviewWrap: {
    flex: 1,
    marginVertical: 14,
    overflow: "hidden",
    borderRadius: 22,
  },
  cameraPreview: {
    flex: 1,
  },
  liveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: colors.brand,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  subtleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#F3ECE4",
    fontSize: 11,
    fontWeight: "700",
  },
  cameraPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  cameraText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  cameraSubtext: {
    marginTop: 8,
    color: "#D0D6DD",
    fontSize: 13,
  },
  cameraFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(19,25,32,0.42)",
  },
  cameraFooterLabel: {
    color: "#D7E0E9",
    fontSize: 12,
  },
  cameraFooterTitle: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionLabel: {
    color: colors.brandDark,
    fontSize: 12,
    fontWeight: "800",
  },
  statusValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  metrics: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },
  metric: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#FCF7F2",
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  metricValue: {
    marginTop: 6,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  actions: {
    gap: 10,
    marginTop: 14,
  },
  primaryAction: {
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.brand,
    alignItems: "center",
  },
  primaryActionLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  primaryActionDisabled: {
    opacity: 0.62,
  },
  secondaryAction: {
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: colors.navy,
    alignItems: "center",
  },
  secondaryActionLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  recordAction: {
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#F7E9DE",
    alignItems: "center",
  },
  recordActionLabel: {
    color: colors.brandDark,
    fontSize: 15,
    fontWeight: "800",
  },
  ghostAction: {
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "#F4ECE3",
    alignItems: "center",
  },
  ghostActionLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  resultRow: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
  },
  resultGood: {
    backgroundColor: "#EDF8F1",
  },
  resultWarn: {
    backgroundColor: "#FFF2EE",
  },
  resultTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  resultBody: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
  },
});
