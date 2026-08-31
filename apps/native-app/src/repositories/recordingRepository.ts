import { supabase } from "../lib/supabase";
import { RecordingClipRow } from "../types/supabase";

export const recordingRepository = {
  async createClip(input: {
    sessionId: string;
    userId: string;
    recordedDate: string;
    title: string;
    storagePath?: string;
    durationSeconds: number;
  }): Promise<RecordingClipRow> {
    const { data, error } = await supabase
      .from("recording_clips")
      .insert({
        session_id: input.sessionId,
        user_id: input.userId,
        recorded_date: input.recordedDate,
        title: input.title,
        storage_path: input.storagePath ?? null,
        duration_seconds: input.durationSeconds,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async listByMonth(userId: string, monthPrefix: string): Promise<RecordingClipRow[]> {
    const { data, error } = await supabase
      .from("recording_clips")
      .select("*")
      .eq("user_id", userId)
      .gte("recorded_date", `${monthPrefix}-01`)
      .lt("recorded_date", `${monthPrefix}-32`)
      .order("recorded_date", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
};
