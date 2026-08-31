import { RecordingClipDto } from "./contracts";

export const recordingService = {
  async saveLocalClip(input: {
    sessionId: string;
    userId: string;
    localUri: string;
    durationSeconds: number;
  }): Promise<RecordingClipDto> {
    return {
      id: `clip-${Date.now()}`,
      sessionId: input.sessionId,
      userId: input.userId,
      recordedDate: new Date().toISOString().slice(0, 10),
      localUri: input.localUri,
      durationSeconds: input.durationSeconds,
    };
  },
};
