import { StudyGroupDto } from "./contracts";

export const groupService = {
  async getCurrentGroup(): Promise<StudyGroupDto> {
    return {
      id: "group-demo",
      name: "토익 아침캠 6주 챌린지",
      inviteCode: "STB-2401",
      dailyGoalMinutes: 180,
      awayLimitMinutes: 15,
    };
  },
};
