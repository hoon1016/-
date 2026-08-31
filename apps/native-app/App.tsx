import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { useMemo, useState } from "react";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { PenaltiesScreen } from "./src/screens/PenaltiesScreen";
import { StudyRoomScreen } from "./src/screens/StudyRoomScreen";
import { AppNotice } from "./src/components/AppNotice";
import { BottomTabBar } from "./src/components/BottomTabBar";
import { HeaderBar } from "./src/components/HeaderBar";
import { TabKey } from "./src/data/mock";
import { colors } from "./src/theme/tokens";
import { useStudySession } from "./src/hooks/useStudySession";
import { useBootstrapApp } from "./src/hooks/useBootstrapApp";
import { runtimeConfig } from "./src/config/runtime";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const { appState: bootstrappedState, isBootstrapping, bootstrapError } = useBootstrapApp();
  const { appState, sessionControls } = useStudySession(bootstrappedState);

  const activeTitle = useMemo(() => {
    if (activeTab === "room") return "스터디룸";
    if (activeTab === "penalties") return "패널티 보드";
    if (activeTab === "history") return "기록";
    return "대시보드";
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <HeaderBar
          title={activeTitle}
          subtitle="열품타 + 셀로그 기반 친구형 캠스터디"
          status={appState.sessionStatus}
          camera={appState.cameraStatus}
        />

        {runtimeConfig.useMockData && (
          <AppNotice
            title="현재는 데모 데이터 모드"
            body="Supabase 환경값을 넣으면 실제 그룹, 세션, 패널티, 캘린더 기록을 서버에서 불러오도록 전환할 수 있습니다."
          />
        )}

        {!runtimeConfig.useMockData && isBootstrapping && (
          <AppNotice
            title="초기 데이터 불러오는 중"
            body="그룹 정보와 최근 세션 기록을 서버에서 가져오고 있습니다."
          />
        )}

        {bootstrapError && (
          <AppNotice
            tone="warn"
            title="서버 연결 확인 필요"
            body={bootstrapError}
          />
        )}

        <View style={styles.content}>
          {activeTab === "dashboard" && <DashboardScreen appState={appState} />}
          {activeTab === "room" && <StudyRoomScreen appState={appState} sessionControls={sessionControls} />}
          {activeTab === "penalties" && <PenaltiesScreen appState={appState} />}
          {activeTab === "history" && <HistoryScreen appState={appState} />}
        </View>

        <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 92,
  },
});
