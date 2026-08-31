import { AppState, FeedItem, Friend, HistoryItem, PenaltyItem, RecordingDay } from "../types/domain";
import { GroupMemberRow, PenaltyAssignmentRow, RecordingClipRow, SessionParticipantRow, StudyGroupRow } from "../types/supabase";

export function toFriend(member: GroupMemberRow, participant?: SessionParticipantRow): Friend {
  return {
    id: member.user_id,
    name: member.nickname,
    focusMinutes: Math.round((participant?.focus_seconds ?? 0) / 60),
    awayMinutes: Math.round((participant?.away_seconds ?? 0) / 60),
    streak: member.streak_days,
    penalties: member.penalty_count,
    status: "대기",
  };
}

export function toPenaltyItem(row: PenaltyAssignmentRow): PenaltyItem {
  return {
    title: `${row.nickname} · ${row.reason}`,
    body: row.penalty_text,
  };
}

export function toHistoryItem(group: StudyGroupRow, participant: SessionParticipantRow): HistoryItem {
  return {
    title: `${group.name} 세션`,
    meta: `${Math.round(participant.focus_seconds / 60)}분 집중 · ${Math.round(participant.away_seconds / 60)}분 이탈`,
  };
}

export function toRecordingDay(row: RecordingClipRow): RecordingDay {
  return {
    date: row.recorded_date,
    count: 1,
    title: row.title,
    summary: `${Math.round(row.duration_seconds / 60)}분 길이`,
  };
}

export function toFeed(goalMinutes: number, focusMinutes: number, cameraOn: boolean): FeedItem[] {
  return [
    {
      title: focusMinutes >= goalMinutes ? "오늘 목표 달성권" : `오늘 목표까지 ${Math.max(0, goalMinutes - focusMinutes)}분 남음`,
      body: "열품타처럼 누적 공부시간이 즉시 반영됩니다.",
      tone: focusMinutes >= goalMinutes ? "good" : "warn",
    },
    {
      title: "그룹 순위는 실시간 업데이트 대상",
      body: "친구 그룹 안에서 순위와 패널티가 같이 움직입니다.",
      tone: "good",
    },
    {
      title: cameraOn ? "셀로그 체크인 활성화" : "셀로그 체크인 대기",
      body: cameraOn ? "카메라를 켜둔 공부 존재감이 기록됩니다." : "카메라를 켜면 오늘 장면과 세션 기록이 남습니다.",
      tone: cameraOn ? "good" : "warn",
    },
  ];
}

export function mergeToAppState(input: {
  group: StudyGroupRow;
  members: GroupMemberRow[];
  penalties: PenaltyAssignmentRow[];
  recordings: RecordingClipRow[];
  participants: SessionParticipantRow[];
}): AppState {
  const friends = input.members.map((member) =>
    toFriend(
      member,
      input.participants.find((participant) => participant.user_id === member.user_id),
    ),
  );
  const me = friends[0];

  return {
    sessionStatus: "대기 중",
    cameraStatus: "카메라 OFF",
    goalMinutes: input.group.daily_goal_minutes,
    focusMinutes: me?.focusMinutes ?? 0,
    awayMinutes: me?.awayMinutes ?? 0,
    groupRank: 1,
    streakDays: me?.streak ?? 0,
    penaltyCount: me?.penalties ?? 0,
    groupName: input.group.name,
    inviteCode: input.group.invite_code,
    friends,
    penaltyBoard: input.penalties.map(toPenaltyItem),
    feed: toFeed(input.group.daily_goal_minutes, me?.focusMinutes ?? 0, false),
    history: input.participants.map((participant) => toHistoryItem(input.group, participant)),
    recordings: input.recordings.map(toRecordingDay),
  };
}
