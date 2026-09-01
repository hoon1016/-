import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SectionLabel } from "../components/SectionLabel";
import { errorText } from "../lib/errors";
import { communityRepository } from "../repositories/communityRepository";
import { CommunityChannel, CommunityCommentRow, CommunityPostRow } from "../types/supabase";
import { colors } from "../theme/tokens";

const channelLabels: Record<CommunityChannel, string> = { chat: "잡담", tips: "공부 꿀팁" };

const timeLabel = (value: string) => new Date(value).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export function CommunityScreen({ groupId, userId, nickname }: { groupId: string; userId: string; nickname: string }) {
  const [channel, setChannel] = useState<CommunityChannel>("chat");
  const [posts, setPosts] = useState<CommunityPostRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPostRow | null>(null);
  const [comments, setComments] = useState<CommunityCommentRow[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      setPosts(await communityRepository.listPosts(groupId, channel));
    } catch (error) {
      Alert.alert("커뮤니티를 불러오지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadPosts(); }, [channel, groupId]);

  const openPost = async (post: CommunityPostRow) => {
    setSelectedPost(post);
    setComments([]);
    try {
      setComments(await communityRepository.listComments(post.id));
    } catch (error) {
      Alert.alert("댓글을 불러오지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요."));
    }
  };

  const createPost = async () => {
    if (!title.trim() || !body.trim()) return Alert.alert("내용을 입력해 주세요", "제목과 내용을 모두 작성해야 합니다.");
    setIsSubmitting(true);
    try {
      const post = await communityRepository.createPost({ group_id: groupId, channel, author_id: userId, author_nickname: nickname.slice(0, 24), title: title.trim(), body: body.trim() });
      setPosts((current) => [post, ...current]);
      setTitle("");
      setBody("");
      setIsWriteOpen(false);
    } catch (error) {
      Alert.alert("글을 올리지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const createComment = async () => {
    if (!selectedPost || !commentBody.trim()) return;
    setIsSubmitting(true);
    try {
      const comment = await communityRepository.createComment({ post_id: selectedPost.id, group_id: groupId, author_id: userId, author_nickname: nickname.slice(0, 24), body: commentBody.trim() });
      setComments((current) => [...current, comment]);
      setCommentBody("");
    } catch (error) {
      Alert.alert("댓글을 올리지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <Card>
        <View style={styles.head}><View><SectionLabel>우리 스터디 커뮤니티</SectionLabel><Text style={styles.subtitle}>공부 얘기부터 잡담까지, 방 멤버끼리만 보여요.</Text></View><Pressable onPress={() => setIsWriteOpen(true)} style={styles.writeButton}><Text style={styles.writeLabel}>글쓰기</Text></Pressable></View>
        <View style={styles.channels}>{(Object.keys(channelLabels) as CommunityChannel[]).map((item) => <Pressable key={item} onPress={() => setChannel(item)} style={[styles.channel, channel === item && styles.channelActive]}><Text style={[styles.channelLabel, channel === item && styles.channelLabelActive]}>{channelLabels[item]}</Text></Pressable>)}</View>
      </Card>

      {isLoading ? <View style={styles.loading}><ActivityIndicator color={colors.brand} /></View> : posts.length ? posts.map((post) => (
        <Pressable key={post.id} onPress={() => void openPost(post)}><Card><Text style={styles.postTitle}>{post.title}</Text><Text style={styles.postBody} numberOfLines={2}>{post.body}</Text><Text style={styles.postMeta}>{post.author_nickname} · {timeLabel(post.created_at)} · 댓글 보기</Text></Card></Pressable>
      )) : <Card><Text style={styles.empty}>첫 글을 남겨 보세요. 이 방 멤버에게만 보입니다.</Text></Card>}

      <Modal visible={isWriteOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsWriteOpen(false)}>
        <View style={styles.modal}><View style={styles.modalHead}><Text style={styles.modalTitle}>{channelLabels[channel]} 글쓰기</Text><Pressable onPress={() => setIsWriteOpen(false)}><Text style={styles.close}>닫기</Text></Pressable></View><TextInput value={title} onChangeText={setTitle} placeholder="제목" placeholderTextColor={colors.muted} style={styles.titleInput} maxLength={80} /><TextInput value={body} onChangeText={setBody} placeholder="같이 나누고 싶은 이야기를 적어 주세요." placeholderTextColor={colors.muted} style={styles.bodyInput} multiline textAlignVertical="top" maxLength={2000} /><Pressable style={styles.submit} onPress={() => void createPost()} disabled={isSubmitting}><Text style={styles.submitLabel}>{isSubmitting ? "올리는 중" : "글 올리기"}</Text></Pressable></View>
      </Modal>

      <Modal visible={Boolean(selectedPost)} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedPost(null)}>
        <View style={styles.modal}><View style={styles.modalHead}><Text style={styles.modalTitle}>{channelLabels[channel]}</Text><Pressable onPress={() => setSelectedPost(null)}><Text style={styles.close}>닫기</Text></Pressable></View><Text style={styles.detailTitle}>{selectedPost?.title}</Text><Text style={styles.detailBody}>{selectedPost?.body}</Text><Text style={styles.postMeta}>{selectedPost?.author_nickname} · {selectedPost && timeLabel(selectedPost.created_at)}</Text><View style={styles.commentHeader}><SectionLabel>댓글 {comments.length}</SectionLabel></View>{comments.map((comment) => <View key={comment.id} style={styles.comment}><Text style={styles.commentName}>{comment.author_nickname}</Text><Text style={styles.commentBody}>{comment.body}</Text><Text style={styles.commentTime}>{timeLabel(comment.created_at)}</Text></View>)}<View style={styles.commentWrite}><TextInput value={commentBody} onChangeText={setCommentBody} placeholder="댓글을 남겨 보세요" placeholderTextColor={colors.muted} style={styles.commentInput} maxLength={1000} /><Pressable onPress={() => void createComment()} style={styles.commentSubmit} disabled={isSubmitting}><Text style={styles.commentSubmitLabel}>등록</Text></Pressable></View></View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, subtitle: { marginTop: 5, color: colors.muted, fontSize: 12, lineHeight: 18, flexShrink: 1 },
  writeButton: { alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.navy }, writeLabel: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  channels: { flexDirection: "row", gap: 8, marginTop: 16 }, channel: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, backgroundColor: "#FCF7F2" }, channelActive: { backgroundColor: "#F7E9DE" }, channelLabel: { color: colors.muted, fontWeight: "800" }, channelLabelActive: { color: colors.brandDark },
  loading: { padding: 28, alignItems: "center" }, empty: { color: colors.muted, lineHeight: 20 }, postTitle: { color: colors.text, fontSize: 16, fontWeight: "800" }, postBody: { marginTop: 8, color: colors.text, lineHeight: 20 }, postMeta: { marginTop: 12, color: colors.muted, fontSize: 12 },
  modal: { flex: 1, padding: 22, backgroundColor: "#FFFDFC" }, modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }, modalTitle: { color: colors.text, fontSize: 18, fontWeight: "800" }, close: { color: colors.brandDark, fontWeight: "800" },
  titleInput: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, color: colors.text, fontSize: 16, fontWeight: "700" }, bodyInput: { minHeight: 210, marginTop: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, color: colors.text, lineHeight: 21 },
  submit: { marginTop: 16, paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: colors.navy }, submitLabel: { color: "#FFFFFF", fontWeight: "800" },
  detailTitle: { color: colors.text, fontSize: 22, fontWeight: "800" }, detailBody: { marginTop: 14, color: colors.text, lineHeight: 23 }, commentHeader: { marginTop: 28, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.line }, comment: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line }, commentName: { color: colors.brandDark, fontWeight: "800", fontSize: 13 }, commentBody: { marginTop: 5, color: colors.text, lineHeight: 20 }, commentTime: { marginTop: 5, color: colors.muted, fontSize: 11 },
  commentWrite: { flexDirection: "row", gap: 8, marginTop: 16, alignItems: "center" }, commentInput: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 12, color: colors.text }, commentSubmit: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: "#F7E9DE" }, commentSubmitLabel: { color: colors.brandDark, fontWeight: "800" },
});
