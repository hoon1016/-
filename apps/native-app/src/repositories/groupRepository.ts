import { supabase } from "../lib/supabase";
import { GroupMemberRow, StudyGroupRow } from "../types/supabase";

export const groupRepository = {
  async createGroup(input: {
    name: string;
    dailyGoalMinutes: number;
    awayLimitMinutes: number;
    nickname: string;
  }): Promise<StudyGroupRow> {
    const { data, error } = await supabase.rpc("create_study_group", {
      group_name: input.name,
      daily_goal: input.dailyGoalMinutes,
      away_limit: input.awayLimitMinutes,
      owner_nickname: input.nickname,
    });

    if (error) throw error;
    return data as StudyGroupRow;
  },

  async joinByInviteCode(inviteCode: string, nickname: string): Promise<GroupMemberRow> {
    const { data, error } = await supabase.rpc("join_study_group", {
      invite_code_input: inviteCode,
      nickname_input: nickname,
    });

    if (error) throw error;
    return data as GroupMemberRow;
  },

  async getGroupByInviteCode(inviteCode: string): Promise<StudyGroupRow | null> {
    const { data, error } = await supabase
      .from("study_groups")
      .select("*")
      .eq("invite_code", inviteCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getGroupById(groupId: string): Promise<StudyGroupRow | null> {
    const { data, error } = await supabase.from("study_groups").select("*").eq("id", groupId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async listMyGroups(userId: string): Promise<StudyGroupRow[]> {
    const { data: memberships, error: membershipError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", userId);
    if (membershipError) throw membershipError;
    return Promise.all((memberships ?? []).map(({ group_id }) => this.getGroupById(group_id))).then((groups) =>
      groups.filter((group): group is StudyGroupRow => group !== null),
    );
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

  async updateRules(groupId: string, input: {
    dailyGoalMinutes: number;
    awayLimitMinutes: number;
    goalPenaltyText: string;
    awayPenaltyText: string;
  }): Promise<StudyGroupRow> {
    const { data, error } = await supabase
      .from("study_groups")
      .update({
        daily_goal_minutes: input.dailyGoalMinutes,
        away_limit_minutes: input.awayLimitMinutes,
        goal_penalty_text: input.goalPenaltyText,
        away_penalty_text: input.awayPenaltyText,
      })
      .eq("id", groupId)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },
};
