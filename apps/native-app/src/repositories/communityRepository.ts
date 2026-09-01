import { supabase } from "../lib/supabase";
import { CommunityChannel, CommunityCommentRow, CommunityPostRow } from "../types/supabase";

export const communityRepository = {
  async listPosts(groupId: string, channel: CommunityChannel): Promise<CommunityPostRow[]> {
    const { data, error } = await supabase
      .from("community_posts")
      .select("*")
      .eq("group_id", groupId)
      .eq("channel", channel)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createPost(input: Omit<CommunityPostRow, "id" | "created_at">): Promise<CommunityPostRow> {
    const { data, error } = await supabase.from("community_posts").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },

  async listComments(postId: string): Promise<CommunityCommentRow[]> {
    const { data, error } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async createComment(input: Omit<CommunityCommentRow, "id" | "created_at">): Promise<CommunityCommentRow> {
    const { data, error } = await supabase.from("community_comments").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },
};
