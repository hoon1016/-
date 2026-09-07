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
import { CommunityScreen } from "./src/screens/CommunityScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { LaunchScreen } from "./src/components/LaunchScreen";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const { session, isLoading: isAuthLoading } = useAuthSession(!runtimeConfig.useMockData);
  const [groups, setGroups] = useState<StudyGroupRow[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupRow | null>(null);
  const [isChoosingGroup, setIsChoosingGroup] = useState(false);
  const [isGroupsLoading, setIsGroupsLoading] = useState(!runtimeConfig.useMockData);
  const [launchDelayElapsed, setLaunchDelayElapsed] = useState(false);
  const { appState: bootstrappedState, setAppState: setBootstrappedState, isBootstrapping, bootstrapError } = useBootstrapApp(
    session?.user.id,
    selectedGroup?.id,
  );
  const { appState, sessionControls } = useStudySession(
    bootstrappedState,
    selectedGroup?.id,
    session?.user.id,
  );

  useEffect(() => {
    const timer = setTimeout(() => setLaunchDelayElapsed(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (runtimeConfig.useMockData) {
      setIsGroupsLoading(false);
      return;
    }
    if (!session?.user.id) {
      setGroups([]);
      setSelectedGroup(null);
      setIsGroupsLoading(false);
      return;
    }
    let active = true;
    setIsGroupsLoading(true);
    void groupRepository.listMyGroups(session.user.id)
      .then((nextGroups) => {
        if (!active) return;
        setGroups(nextGroups);
        setSelectedGroup((current) => current ?? nextGroups[0] ?? null);
      })
      .catch(() => {
        if (active) setGroups([]);
      })
      .finally(() => {
        if (active) setIsGroupsLoading(false);
      });
    return () => { active = false; };
  }, [session?.user.id]);

  const activeTitle = useMemo(() => {
    if (activeTab === "room") return "스터디룸";
    if (activeTab === "community") return "커뮤니티";
    if (activeTab === "penalties") return "패널티 보드";
    if (activeTab === "history") return "기록";
    if (activeTab === "settings") return "내 정보";
    return "대시보드";
  }, [activeTab]);

  const isLaunching = !launchDelayElapsed || (!runtimeConfig.useMockData && (
    isAuthLoading || Boolean(session && (isGroupsLoading || (selectedGroup && isBootstrapping)))
  ));
  if (isLaunching) return <LaunchScreen />;
  if (!runtimeConfig.useMockData && !session) return <LoginScreen />;
  if (!runtimeConfig.useMockData && (!selectedGroup || isChoosingGroup)) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GroupSetupScreen groups={groups} defaultNickname={String(session?.user.user_metadata.full_name ?? session?.user.user_metadata.nickname ?? "")} onSelect={(group) => {
          setSelectedGroup(group);
          setGroups((current) => current.some((item) => item.id === group.id) ? current : [...current, group]);
          setIsChoosingGroup(false);
        }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <HeaderBar
          title={activeTitle}
          subtitle={selectedGroup ? selectedGroup.name : "친구와 함께 하는 캠스터디"}
          status={appState.sessionStatus}
          camera={appState.cameraStatus}
          onOpenGroups={() => setActiveTab("settings")}
          onOpenSettings={() => setActiveTab("settings")}
        />
        {runtimeConfig.useMockData && (
          <AppNotice title="현재는 데모 데이터 모드" body="Supabase 환경값을 넣으면 실제 로그인, 그룹, 세션, 패널티가 서버와 연결됩니다." />
        )}
        {!runtimeConfig.useMockData && isBootstrapping && (
          <AppNotice title="초기 데이터 불러오는 중" body="그룹 정보와 최근 세션 기록을 서버에서 가져오고 있습니다." />
        )}
        {bootstrapError && <AppNotice tone="warn" title="서버 연결 확인 필요" body={bootstrapError} />}
        <View style={styles.content}>
          {activeTab === "dashboard" && <DashboardScreen appState={appState} onStartStudy={() => setActiveTab("room")} onOpenPenalties={() => setActiveTab("penalties")} />}
          {activeTab === "room" && <StudyRoomScreen appState={appState} sessionControls={sessionControls} />}
          {activeTab === "community" && selectedGroup && session && <CommunityScreen groupId={selectedGroup.id} userId={session.user.id} nickname={String(session.user.user_metadata.full_name ?? session.user.email?.split("@")[0] ?? "스터디러")} />}
          {activeTab === "penalties" && <PenaltiesScreen appState={appState} userId={session?.user.id} />}
          {activeTab === "history" && <HistoryScreen appState={appState} />}
          {activeTab === "settings" && selectedGroup && session && (
            <SettingsScreen
              email={session.user.email ?? "StudyBet 계정"}
              group={selectedGroup}
              groups={groups}
              isOwner={selectedGroup.owner_id === session.user.id}
              isSessionRunning={sessionControls.isRunning}
              onSelectGroup={(group) => { setSelectedGroup(group); setActiveTab("dashboard"); }}
              onUpdateGroup={(group) => {
                setSelectedGroup(group);
                setGroups((current) => current.map((item) => item.id === group.id ? group : item));
                setBootstrappedState((current) => ({
                  ...current,
                  goalMinutes: group.daily_goal_minutes,
                  awayLimitMinutes: group.away_limit_minutes,
                  goalPenaltyText: group.goal_penalty_text ?? current.goalPenaltyText,
                  awayPenaltyText: group.away_penalty_text ?? current.awayPenaltyText,
                }));
              }}
              onAddGroup={() => setIsChoosingGroup(true)}
            />
          )}
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
