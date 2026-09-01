import { supabase } from "../lib/supabase";
import { RecordingClipRow } from "../types/supabase";
import { File } from "expo-file-system";

export const recordingRepository = {
  async uploadClip(input: { userId: string; localUri: string }) {
    const extension = input.localUri.split(".").pop()?.split("?")[0] || "mp4";
    const fileId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const storagePath = `${input.userId}/${fileId}.${extension}`;
    const bytes = await new File(input.localUri).arrayBuffer();
    const { error } = await supabase.storage.from("study-clips").upload(storagePath, bytes, {
      contentType: "video/mp4",
      upsert: false,
    });

    if (error) throw error;
    return storagePath;
  },

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

  async createPlaybackUrl(storagePath: string) {
    const { data, error } = await supabase.storage.from("study-clips").createSignedUrl(storagePath, 60 * 60);
    if (error) throw error;
    return data.signedUrl;
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
