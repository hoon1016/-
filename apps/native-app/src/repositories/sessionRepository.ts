import { supabase } from "../lib/supabase";
import { SessionParticipantRow, StudySessionRow } from "../types/supabase";

export const sessionRepository = {
  async createLiveSession(groupId: string): Promise<StudySessionRow> {
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userResult.user) throw new Error("Sign in is required before starting a session.");

    const { data, error } = await supabase
      .from("study_sessions")
      .insert({
        group_id: groupId,
        created_by: userResult.user.id,
        status: "live",
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async endSession(sessionId: string): Promise<StudySessionRow> {
    const { data, error } = await supabase
      .from("study_sessions")
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async finishMySession(input: {
    sessionId: string;
    focusSeconds: number;
    awaySeconds: number;
    cameraOnRate: number;
  }): Promise<{ session_id: string; penalty_count: number }> {
    const { data, error } = await supabase.rpc("finish_my_session", {
      target_session_id: input.sessionId,
      focus_total_seconds: input.focusSeconds,
      away_total_seconds: input.awaySeconds,
      camera_rate: input.cameraOnRate,
    });

    if (error) throw error;
    return data as { session_id: string; penalty_count: number };
  },

  async upsertParticipant(input: {
    sessionId: string;
    userId: string;
    focusSeconds: number;
    awaySeconds: number;
    cameraOnRate: number;
  }): Promise<SessionParticipantRow> {
    const { data, error } = await supabase
      .from("session_participants")
      .upsert({
        session_id: input.sessionId,
        user_id: input.userId,
        focus_seconds: input.focusSeconds,
        away_seconds: input.awaySeconds,
        camera_on_rate: input.cameraOnRate,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async getLatestParticipants(groupId: string): Promise<SessionParticipantRow[]> {
    const { data: latestSession, error: latestError } = await supabase
      .from("study_sessions")
      .select("id")
      .eq("group_id", groupId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) throw latestError;
    if (!latestSession) return [];

    const { data, error } = await supabase
      .from("session_participants")
      .select("*")
      .eq("session_id", latestSession.id);

    if (error) throw error;
    return data ?? [];
  },
};
