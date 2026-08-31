import { env } from "../config/env";

export type LiveKitJoinPayload = {
  roomName: string;
  participantName: string;
  token: string;
  wsUrl: string;
};

export const livekitService = {
  async requestJoinToken(input: {
    groupId: string;
    userId: string;
    nickname: string;
  }): Promise<LiveKitJoinPayload> {
    return {
      roomName: `study-group-${input.groupId}`,
      participantName: input.nickname,
      token: "REPLACE_WITH_SERVER_GENERATED_TOKEN",
      wsUrl: env.livekitUrl,
    };
  },
};
