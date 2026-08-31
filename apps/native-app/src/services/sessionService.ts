import { StudySessionDto } from "./contracts";

export const sessionService = {
  async startSession(groupId: string): Promise<StudySessionDto> {
    return {
      id: `session-${Date.now()}`,
      groupId,
      startedAt: new Date().toISOString(),
      focusMinutes: 0,
      awayMinutes: 0,
      status: "live",
    };
  },

  async finishSession(sessionId: string, focusMinutes: number, awayMinutes: number): Promise<StudySessionDto> {
    return {
      id: sessionId,
      groupId: "group-demo",
      startedAt: new Date(Date.now() - focusMinutes * 60_000).toISOString(),
      endedAt: new Date().toISOString(),
      focusMinutes,
      awayMinutes,
      status: "ended",
    };
  },
};
