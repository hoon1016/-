import { supabase } from "../lib/supabase";
import { CommunityChannel, CommunityCommentRow, CommunityPostRow } from "../types/supabase";
import { File } from "expo-file-system";

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

  async updatePost(id: string, input: Pick<CommunityPostRow, "title" | "body" | "image_path" | "challenge_goal_minutes" | "challenge_focus_minutes">): Promise<CommunityPostRow> {
    const { data, error } = await supabase.from("community_posts").update(input).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  },

  async deletePost(id: string) {
    const { error } = await supabase.from("community_posts").delete().eq("id", id);
    if (error) throw error;
  },

  async uploadChallengeImage(input: { groupId: string; userId: string; localUri: string }) {
    const extension = input.localUri.split(".").pop()?.split("?")[0] || "jpg";
    const storagePath = `${input.groupId}/${input.userId}/${Date.now().toString(36)}.${extension}`;
    const bytes = await new File(input.localUri).arrayBuffer();
    const { error } = await supabase.storage.from("challenge-images").upload(storagePath, bytes, {
      contentType: `image/${extension === "jpg" ? "jpeg" : extension}`,
      upsert: false,
    });
    if (error) throw error;
    return storagePath;
  },

  async createImageUrl(storagePath: string) {
    const { data, error } = await supabase.storage.from("challenge-images").createSignedUrl(storagePath, 60 * 60);
    if (error) throw error;
    return data.signedUrl;
  },

  async deleteImage(storagePath: string) {
    const { error } = await supabase.storage.from("challenge-images").remove([storagePath]);
    if (error) throw error;
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
