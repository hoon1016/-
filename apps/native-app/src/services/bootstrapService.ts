import { mergeToAppState } from "../lib/mappers";
import { AppState } from "../types/domain";
import { groupRepository } from "../repositories/groupRepository";
import { penaltyRepository } from "../repositories/penaltyRepository";
import { recordingRepository } from "../repositories/recordingRepository";
import { sessionRepository } from "../repositories/sessionRepository";

export const bootstrapService = {
  async hydrateApp(inviteCode: string, currentUserId: string): Promise<AppState | null> {
    const group = await groupRepository.getGroupByInviteCode(inviteCode);
    if (!group) return null;

    const [members, penalties, recordings, participants] = await Promise.all([
      groupRepository.getMembers(group.id),
      penaltyRepository.listRecent(group.id),
      recordingRepository.listByMonth(currentUserId, new Date().toISOString().slice(0, 7)),
      sessionRepository.getLatestParticipants(group.id),
    ]);

    return mergeToAppState({
      group,
      members,
      penalties,
      recordings,
      participants,
    });
  },
};
