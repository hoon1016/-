import { RecordingClipDto } from "./contracts";
import { recordingRepository } from "../repositories/recordingRepository";

export const recordingService = {
  async saveClip(input: {
    sessionId: string;
    userId: string;
    localUri: string;
    durationSeconds: number;
  }): Promise<RecordingClipDto> {
    const storagePath = await recordingRepository.uploadClip(input);
    const clip = await recordingRepository.createClip({
      sessionId: input.sessionId,
      userId: input.userId,
      recordedDate: new Date().toISOString().slice(0, 10),
      title: "오늘 캠스터디 기록",
      storagePath,
      durationSeconds: input.durationSeconds,
    });

    return {
      id: clip.id,
      sessionId: input.sessionId,
      userId: input.userId,
      recordedDate: clip.recorded_date,
      localUri: input.localUri,
      durationSeconds: clip.duration_seconds,
    };
  },
};
