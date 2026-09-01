export type TabKey = "dashboard" | "room" | "penalties" | "history";
import { AppState } from "../types/domain";

export const initialAppState: AppState = {
  sessionStatus: "대기 중",
  cameraStatus: "카메라 OFF",
  goalMinutes: 180,
  focusMinutes: 96,
  awayMinutes: 12,
  groupRank: 2,
  streakDays: 5,
  penaltyCount: 1,
  groupName: "토익 아침캠 6주 챌린지",
  inviteCode: "STB-2401",
  friends: [
    { id: "me", name: "나", focusMinutes: 96, awayMinutes: 12, streak: 5, penalties: 1, status: "집중" },
    { id: "j", name: "지우", focusMinutes: 122, awayMinutes: 8, streak: 7, penalties: 0, status: "집중" },
    { id: "m", name: "민호", focusMinutes: 87, awayMinutes: 14, streak: 4, penalties: 1, status: "이탈" },
    { id: "s", name: "세나", focusMinutes: 75, awayMinutes: 22, streak: 2, penalties: 2, status: "대기" },
  ],
  penaltyBoard: [
    { title: "민호 · 이탈 초과", body: "편의점 간식 사기" },
    { title: "세나 · 주간 최하위", body: "다음 모임 디저트 쏘기" },
  ],
  feed: [
    { title: "오늘 목표까지 84분 남음", body: "열품타처럼 누적 공부시간이 바로 올라갑니다.", tone: "warn" },
    { title: "현재 그룹 2위", body: "친구 그룹 안에서 순위가 실시간으로 갱신됩니다.", tone: "good" },
    { title: "셀로그 체크인 대기", body: "카메라를 켜면 오늘 집중 장면을 남길 수 있습니다.", tone: "warn" },
  ],
  history: [
    { title: "일요일 저녁 집중 세션", meta: "96분 집중 · 패널티 없음" },
    { title: "토요일 오전 세션", meta: "71분 집중 · 이탈 패널티 1건" },
  ],
  recordings: [
    { date: "2026-08-30", count: 2, clips: [{ id: "mock-1", date: "2026-08-30", title: "일요일 저녁 집중 세션", summary: "96분 집중 · 8분 이탈" }, { id: "mock-2", date: "2026-08-30", title: "오후 마무리 세션", summary: "42분 집중 · 영상 준비 중" }] },
    { date: "2026-08-29", count: 1, clips: [{ id: "mock-3", date: "2026-08-29", title: "토요일 오전 세션", summary: "71분 집중 · 18분 이탈" }] },
    { date: "2026-08-27", count: 1, clips: [{ id: "mock-4", date: "2026-08-27", title: "목요일 저녁 세션", summary: "124분 집중 · 목표 달성" }] },
  ],
  lastSessionResults: [],
};
