import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { PenaltiesScreen } from "./src/screens/PenaltiesScreen";
import { StudyRoomScreen } from "./src/screens/StudyRoomScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { GroupSetupScreen } from "./src/screens/GroupSetupScreen";
import { AppNotice } from "./src/components/AppNotice";
import { BottomTabBar } from "./src/components/BottomTabBar";
import { HeaderBar } from "./src/components/HeaderBar";
import { TabKey } from "./src/data/mock";
import { colors } from "./src/theme/tokens";
import { useStudySession } from "./src/hooks/useStudySession";
import { useBootstrapApp } from "./src/hooks/useBootstrapApp";
import { useAuthSession } from "./src/hooks/useAuthSession";
import { runtimeConfig } from "./src/config/runtime";
import { groupRepository } from "./src/repositories/groupRepository";
import { StudyGroupRow } from "./src/types/supabase";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const { session, isLoading: isAuthLoading } = useAuthSession(!runtimeConfig.useMockData);
  const [groups, setGroups] = useState<StudyGroupRow[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupRow | null>(null);
  const { appState: bootstrappedState, isBootstrapping, bootstrapError } = useBootstrapApp(
    session?.user.id,
    selectedGroup?.id,
  );
  const { appState, sessionControls } = useStudySession(
    bootstrappedState,
    selectedGroup?.id,
    session?.user.id,
  );

  useEffect(() => {
    if (runtimeConfig.useMockData || !session?.user.id) return;
    void groupRepository.listMyGroups(session.user.id).then(setGroups).catch(() => setGroups([]));
  }, [session?.user.id]);

  const activeTitle = useMemo(() => {
    if (activeTab === "room") return "스터디룸";
    if (activeTab === "penalties") return "패널티 보드";
    if (activeTab === "history") return "기록";
    return "대시보드";
  }, [activeTab]);

  if (!runtimeConfig.useMockData && isAuthLoading) return <SafeAreaView style={styles.safeArea} />;
  if (!runtimeConfig.useMockData && !session) return <LoginScreen />;
  if (!runtimeConfig.useMockData && !selectedGroup) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GroupSetupScreen groups={groups} onSelect={setSelectedGroup} />
      </SafeAreaView>
    );
  }

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
          <AppNotice title="현재는 데모 데이터 모드" body="Supabase 환경값을 넣으면 실제 로그인, 그룹, 세션, 패널티가 서버와 연결됩니다." />
        )}
        {!runtimeConfig.useMockData && isBootstrapping && (
          <AppNotice title="초기 데이터 불러오는 중" body="그룹 정보와 최근 세션 기록을 서버에서 가져오고 있습니다." />
        )}
        {bootstrapError && <AppNotice tone="warn" title="서버 연결 확인 필요" body={bootstrapError} />}
        <View style={styles.content}>
          {activeTab === "dashboard" && <DashboardScreen appState={appState} onStartStudy={() => setActiveTab("room")} />}
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
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 92 },
});
