import { supabase } from "../lib/supabase";
import { PenaltyAssignmentRow } from "../types/supabase";

export const penaltyRepository = {
  async createAssignments(
    assignments: Array<{
      groupId: string;
      sessionId: string;
      userId: string;
      nickname: string;
      reason: string;
      penaltyText: string;
    }>,
  ): Promise<PenaltyAssignmentRow[]> {
    if (!assignments.length) return [];

    const { data, error } = await supabase
      .from("penalty_assignments")
      .insert(
        assignments.map((item) => ({
          group_id: item.groupId,
          session_id: item.sessionId,
          user_id: item.userId,
          nickname: item.nickname,
          reason: item.reason,
          penalty_text: item.penaltyText,
          status: "assigned",
        })),
      )
      .select("*");

    if (error) throw error;
    return data ?? [];
  },

  async listRecent(groupId: string): Promise<PenaltyAssignmentRow[]> {
    const { data, error } = await supabase
      .from("penalty_assignments")
      .select("*")
      .eq("group_id", groupId)
      .order("assigned_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data ?? [];
  },
};
