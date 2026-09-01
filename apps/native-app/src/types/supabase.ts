export type StudyGroupRow = {
  id: string;
  owner_id: string;
  name: string;
  invite_code: string;
  daily_goal_minutes: number;
  away_limit_minutes: number;
  goal_penalty_text?: string;
  away_penalty_text?: string;
  created_at: string;
};

export type GroupMemberRow = {
  id: string;
  group_id: string;
  user_id: string;
  nickname: string;
  role: "owner" | "member";
  streak_days: number;
  penalty_count: number;
  joined_at: string;
};

export type StudySessionRow = {
  id: string;
  group_id: string;
  created_by: string;
  started_at: string;
  ended_at: string | null;
  status: "scheduled" | "live" | "ended";
};

export type SessionParticipantRow = {
  id: string;
  session_id: string;
  user_id: string;
  focus_seconds: number;
  away_seconds: number;
  camera_on_rate: number;
};

export type PenaltyAssignmentRow = {
  id: string;
  group_id: string;
  session_id: string | null;
  user_id: string;
  nickname: string;
  reason: string;
  penalty_text: string;
  assigned_at: string;
  status: "assigned" | "accepted" | "completed";
};

export type RecordingClipRow = {
  id: string;
  session_id: string;
  user_id: string;
  recorded_date: string;
  title: string;
  storage_path: string | null;
  duration_seconds: number;
  created_at: string;
};

export type CommunityChannel = "chat" | "tips";

export type CommunityPostRow = {
  id: string;
  group_id: string;
  channel: CommunityChannel;
  author_id: string;
  author_nickname: string;
  title: string;
  body: string;
  created_at: string;
};

export type CommunityCommentRow = {
  id: string;
  post_id: string;
  group_id: string;
  author_id: string;
  author_nickname: string;
  body: string;
  created_at: string;
};
