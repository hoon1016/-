export type StudyGroupDto = {
  id: string;
  name: string;
  inviteCode: string;
  dailyGoalMinutes: number;
  awayLimitMinutes: number;
};

export type StudySessionDto = {
  id: string;
  groupId: string;
  startedAt: string;
  endedAt?: string;
  focusMinutes: number;
  awayMinutes: number;
  status: "scheduled" | "live" | "ended";
};

export type PenaltyAssignmentDto = {
  id: string;
  userId: string;
  reason: string;
  penaltyText: string;
  assignedAt: string;
};

export type RecordingClipDto = {
  id: string;
  sessionId: string;
  userId: string;
  recordedDate: string;
  storagePath: string;
  localUri?: string;
  durationSeconds: number;
};
