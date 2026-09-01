import { useEffect, useRef, useState } from "react";
import { AppState, SessionResult } from "../types/domain";
import { penaltyService } from "../services/penaltyService";
import { runtimeConfig } from "../config/runtime";
import { sessionRepository } from "../repositories/sessionRepository";

const sessionStatus = (isAway: boolean) => ({
  status: isAway ? "자리비움" : "집중 중",
  feed: {
    title: isAway ? "자리비움 감지됨" : "오늘 공부시간 누적 중",
    body: isAway ? "장시간 이탈 시 자동 패널티 대상이 됩니다." : "열품타처럼 공부시간이 분 단위로 누적됩니다.",
    tone: isAway ? "warn" as const : "good" as const,
  },
});

export type SessionControls = {
  isRunning: boolean;
  isAway: boolean;
  canRecord: boolean;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  toggleAway: () => void;
  markCameraReady: (ready: boolean) => void;
  attachRecordedClip: (uri: string) => void;
};

export function useStudySession(initialState: AppState, groupId?: string, currentUserId?: string) {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [isRunning, setIsRunning] = useState(false);
  const [isAway, setIsAway] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const latestClipUri = useRef<string | null>(null);
  const activeSessionId = useRef<string | null>(null);

  useEffect(() => {
    setAppState(initialState);
  }, [initialState]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = setInterval(() => {
      setAppState((current) => {
        const next = sessionStatus(isAway);
        const nextFocus = isAway ? current.focusMinutes : current.focusMinutes + 1;
        const nextAway = isAway ? current.awayMinutes + 1 : current.awayMinutes;
        return {
          ...current,
          focusMinutes: nextFocus,
          awayMinutes: nextAway,
          sessionStatus: next.status,
          feed: [next.feed, ...current.feed.slice(1)],
        };
      });
    }, 60_000);

    return () => clearInterval(timer);
  }, [isAway, isRunning]);

  const startSession = async () => {
    if (!runtimeConfig.useMockData) {
      if (!groupId) throw new Error("스터디방을 선택해 주세요.");
      const session = await sessionRepository.createLiveSession(groupId);
      activeSessionId.current = session.id;
    }
    setIsRunning(true);
    setIsAway(false);
    setAppState((current) => ({
      ...current,
      sessionStatus: "집중 중",
    }));
  };

  const endSession = async () => {
    setIsRunning(false);
    setIsAway(false);
    const current = appState;
    const localAssignments = await penaltyService.assignForSession({
      userId: "me",
      focusMinutes: current.focusMinutes,
      awayMinutes: current.awayMinutes,
      goalMinutes: current.goalMinutes,
      awayLimitMinutes: 20,
    });
    let serverPenaltyCount = localAssignments.length;
    if (!runtimeConfig.useMockData && activeSessionId.current) {
      const settlement = await sessionRepository.finishMySession({
        sessionId: activeSessionId.current,
        focusSeconds: current.focusMinutes * 60,
        awaySeconds: current.awayMinutes * 60,
        cameraOnRate: canRecord ? 100 : 0,
      });
      serverPenaltyCount = settlement.penalty_count;
      activeSessionId.current = null;
    }
    const results: SessionResult[] = serverPenaltyCount
      ? localAssignments.map((assignment) => ({
          title: assignment.reason,
          body: assignment.penaltyText,
          tone: "warn",
        }))
      : [{ title: "오늘 세션 클리어", body: "목표와 이탈 규칙을 모두 지켰어요. 패널티 없음", tone: "good" }];
    const today = new Date().toISOString().slice(0, 10);

    setAppState((previous) => ({
      ...previous,
      sessionStatus: "정산 완료",
      penaltyCount: previous.penaltyCount + serverPenaltyCount,
      friends: previous.friends.map((friend) =>
        friend.id === (currentUserId ?? "me")
          ? { ...friend, penalties: friend.penalties + serverPenaltyCount, status: "대기" }
          : friend,
      ),
      penaltyBoard: [
        ...localAssignments.map((assignment) => ({ title: `나 · ${assignment.reason}`, body: assignment.penaltyText })),
        ...previous.penaltyBoard,
      ],
      history: [
        {
          title: `${new Date().toLocaleDateString("ko-KR")} 세션`,
          meta: `${previous.focusMinutes}분 집중 · ${previous.awayMinutes}분 이탈 · ${serverPenaltyCount ? `패널티 ${serverPenaltyCount}건` : "패널티 없음"}`,
        },
        ...previous.history,
      ],
      recordings: latestClipUri.current
        ? [
            { date: today, count: 1, title: "오늘 캠스터디 기록", summary: `${previous.focusMinutes}분 집중 · 영상 저장됨` },
            ...previous.recordings.filter((recording) => recording.date !== today),
          ]
        : previous.recordings,
      lastSessionResults: results,
    }));
  };

  const toggleAway = () => setIsAway((current) => !current);

  const markCameraReady = (ready: boolean) => {
    setCanRecord(ready);
    setAppState((current) => ({
      ...current,
      cameraStatus: ready ? "카메라 ON" : "카메라 OFF",
    }));
  };

  const attachRecordedClip = (uri: string) => { latestClipUri.current = uri; };

  return {
    appState,
    sessionControls: {
      isRunning,
      isAway,
      canRecord,
      startSession,
      endSession,
      toggleAway,
      markCameraReady,
      attachRecordedClip,
    },
  };
}
