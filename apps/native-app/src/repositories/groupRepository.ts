import { supabase } from "../lib/supabase";
import { GroupMemberRow, StudyGroupRow } from "../types/supabase";

export const groupRepository = {
  async getGroupByInviteCode(inviteCode: string): Promise<StudyGroupRow | null> {
    const { data, error } = await supabase
      .from("study_groups")
      .select("*")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getMembers(groupId: string): Promise<GroupMemberRow[]> {
    const { data, error } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },
};
