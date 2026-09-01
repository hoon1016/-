import { AppState, FeedItem, Friend, HistoryItem, PenaltyItem, RecordingClip, RecordingDay } from "../types/domain";
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

export function toRecordingClip(row: RecordingClipRow): RecordingClip {
  return {
    id: row.id,
    date: row.recorded_date,
    title: row.title,
    summary: `${Math.round(row.duration_seconds / 60)}분 길이`,
    storagePath: row.storage_path ?? undefined,
    durationSeconds: row.duration_seconds,
  };
}

export function toRecordingDays(rows: RecordingClipRow[]): RecordingDay[] {
  return rows.reduce<RecordingDay[]>((days, row) => {
    const clip = toRecordingClip(row);
    const day = days.find((item) => item.date === clip.date);
    if (day) {
      day.clips.push(clip);
      day.count = day.clips.length;
      return days;
    }
    return [...days, { date: clip.date, count: 1, clips: [clip] }];
  }, []);
}

export function toFeed(goalMinutes: number, focusMinutes: number, cameraOn: boolean): FeedItem[] {
  return [
    {
      title: focusMinutes >= goalMinutes ? "오늘 목표 달성권" : `오늘 목표까지 ${Math.max(0, goalMinutes - focusMinutes)}분 남음`,
      body: focusMinutes >= goalMinutes ? "오늘 목표를 달성했어요." : "스터디룸에서 공부를 시작해 보세요.",
      tone: focusMinutes >= goalMinutes ? "good" : "warn",
    },
    {
      title: cameraOn ? "카메라 체크인 활성화" : "카메라 체크인 대기",
      body: cameraOn ? "카메라 참여가 기록되고 있습니다." : "스터디룸에서 카메라를 켤 수 있습니다.",
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
  currentUserId: string;
}): AppState {
  const friends = input.members.map((member) =>
    toFriend(
      member,
      input.participants.find((participant) => participant.user_id === member.user_id),
    ),
  );
  const me = friends.find((friend) => friend.id === input.currentUserId) ?? friends[0];

  return {
    sessionStatus: "대기 중",
    cameraStatus: "카메라 OFF",
    goalMinutes: input.group.daily_goal_minutes,
    awayLimitMinutes: input.group.away_limit_minutes,
    goalPenaltyText: input.group.goal_penalty_text ?? "목표 미달 패널티",
    awayPenaltyText: input.group.away_penalty_text ?? "이탈 초과 패널티",
    focusMinutes: me?.focusMinutes ?? 0,
    awayMinutes: me?.awayMinutes ?? 0,
    groupRank: friends.length > 1 ? [...friends].sort((a, b) => b.focusMinutes - a.focusMinutes).findIndex((friend) => friend.id === input.currentUserId) + 1 : 0,
    streakDays: me?.streak ?? 0,
    penaltyCount: me?.penalties ?? 0,
    groupName: input.group.name,
    inviteCode: input.group.invite_code,
    friends,
    penaltyBoard: input.penalties.map(toPenaltyItem),
    feed: toFeed(input.group.daily_goal_minutes, me?.focusMinutes ?? 0, false),
    history: input.participants.map((participant) => toHistoryItem(input.group, participant)),
    recordings: toRecordingDays(input.recordings),
    lastSessionResults: [],
  };
}
