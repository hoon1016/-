import { supabase } from "../lib/supabase";

export type LiveKitJoinPayload = {
  roomName: string;
  participantName: string;
  token: string;
  wsUrl: string;
};

export const livekitService = {
  async requestJoinToken(input: {
    groupId: string;
  }): Promise<LiveKitJoinPayload> {
    const { data, error } = await supabase.functions.invoke<LiveKitJoinPayload>("livekit-token", {
      body: { groupId: input.groupId },
    });

    if (error) throw error;
    if (!data) throw new Error("LiveKit token response is empty.");
    return data;
  },
};
