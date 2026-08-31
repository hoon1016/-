import { PenaltyAssignmentDto } from "./contracts";

export const penaltyService = {
  async assignForSession(input: {
    userId: string;
    focusMinutes: number;
    awayMinutes: number;
    goalMinutes: number;
    awayLimitMinutes: number;
  }): Promise<PenaltyAssignmentDto[]> {
    const assignments: PenaltyAssignmentDto[] = [];

    if (input.focusMinutes < input.goalMinutes) {
      assignments.push({
        id: `penalty-goal-${Date.now()}`,
        userId: input.userId,
        reason: "목표 미달",
        penaltyText: "아메리카노 사기",
        assignedAt: new Date().toISOString(),
      });
    }

    if (input.awayMinutes > input.awayLimitMinutes) {
      assignments.push({
        id: `penalty-away-${Date.now()}`,
        userId: input.userId,
        reason: "이탈 초과",
        penaltyText: "편의점 간식 사기",
        assignedAt: new Date().toISOString(),
      });
    }

    return assignments;
  },
};
