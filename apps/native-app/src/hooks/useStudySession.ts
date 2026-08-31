import { useEffect, useRef, useState } from "react";
import { AppState } from "../types/domain";

export type SessionControls = {
  isRunning: boolean;
  isAway: boolean;
  canRecord: boolean;
  startSession: () => void;
  endSession: () => void;
  toggleAway: () => void;
  markCameraReady: (ready: boolean) => void;
  attachRecordedClip: (uri: string) => void;
};

export function useStudySession(initialState: AppState) {
  const [appState, setAppState] = useState<AppState>(initialState);
  const [isRunning, setIsRunning] = useState(false);
  const [isAway, setIsAway] = useState(false);
  const [canRecord, setCanRecord] = useState(false);
  const latestClipUri = useRef<string | null>(null);

  useEffect(() => {
    setAppState(initialState);
  }, [initialState]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const timer = setInterval(() => {
      setAppState((current) => {
        const nextFocus = isAway ? current.focusMinutes : current.focusMinutes + 1;
        const nextAway = isAway ? current.awayMinutes + 1 : current.awayMinutes;
        return {
          ...current,
          focusMinutes: nextFocus,
          awayMinutes: nextAway,
          sessionStatus: isAway ? "자리비움" : "집중 중",
          feed: [
            {
              title: isAway ? "자리비움 감지됨" : "오늘 공부시간 누적 중",
              body: isAway ? "장시간 이탈 시 자동 패널티 대상이 됩니다." : "열품타처럼 공부시간이 분 단위로 누적됩니다.",
              tone: isAway ? "warn" : "good",
            },
            ...current.feed.slice(1),
          ],
        };
      });
    }, 60_000);

    return () => clearInterval(timer);
  }, [isAway, isRunning]);

  const startSession = () => {
    setIsRunning(true);
    setIsAway(false);
    setAppState((current) => ({
      ...current,
      sessionStatus: "집중 중",
    }));
  };

  const endSession = () => {
    setIsRunning(false);
    setIsAway(false);
    setAppState((current) => ({
      ...current,
      sessionStatus: "대기 중",
      history: [
        {
          title: `${new Date().toLocaleDateString("ko-KR")} 세션`,
          meta: `${current.focusMinutes}분 집중 · ${latestClipUri.current ? "영상 저장됨" : "영상 없음"}`,
        },
        ...current.history,
      ],
    }));
  };

  const toggleAway = () => {
    setIsAway((current) => !current);
  };

  const markCameraReady = (ready: boolean) => {
    setCanRecord(ready);
    setAppState((current) => ({
      ...current,
      cameraStatus: ready ? "카메라 ON" : "카메라 OFF",
    }));
  };

  const attachRecordedClip = (uri: string) => {
    latestClipUri.current = uri;
  };

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
