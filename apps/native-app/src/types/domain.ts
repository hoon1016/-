export type PresenceStatus = "집중" | "이탈" | "대기";

export type Friend = {
  id: string;
  name: string;
  focusMinutes: number;
  awayMinutes: number;
  streak: number;
  penalties: number;
  status: PresenceStatus;
};

export type RecordingDay = {
  date: string;
  count: number;
  clips: RecordingClip[];
};

export type RecordingClip = {
  id: string;
  date: string;
  title?: string;
  summary?: string;
  storagePath?: string;
  durationSeconds?: number;
};

export type FeedItem = {
  title: string;
  body: string;
  tone: "good" | "warn";
};

export type PenaltyItem = {
  title: string;
  body: string;
};

export type SessionResult = {
  title: string;
  body: string;
  tone: "good" | "warn";
};

export type HistoryItem = {
  title: string;
  meta: string;
};

export type AppState = {
  sessionStatus: string;
  cameraStatus: string;
  goalMinutes: number;
  focusMinutes: number;
  awayMinutes: number;
  groupRank: number;
  streakDays: number;
  penaltyCount: number;
  groupName: string;
  inviteCode: string;
  friends: Friend[];
  penaltyBoard: PenaltyItem[];
  feed: FeedItem[];
  history: HistoryItem[];
  recordings: RecordingDay[];
  lastSessionResults: SessionResult[];
};
