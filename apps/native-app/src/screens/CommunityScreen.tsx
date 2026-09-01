import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { SectionLabel } from "../components/SectionLabel";
import { errorText } from "../lib/errors";
import { communityRepository } from "../repositories/communityRepository";
import { CommunityChannel, CommunityCommentRow, CommunityPostRow } from "../types/supabase";
import { colors } from "../theme/tokens";

const channelLabels: Record<CommunityChannel, string> = { chat: "잡담", tips: "공부 꿀팁", challenge: "챌린지" };
const timeLabel = (value: string) => new Date(value).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

function ChallengeImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { let active = true; void communityRepository.createImageUrl(path).then((value) => active && setUrl(value)).catch(() => active && setUrl(null)); return () => { active = false; }; }, [path]);
  return url ? <Image source={{ uri: url }} style={styles.postImage} /> : <View style={styles.imageLoading}><ActivityIndicator color={colors.brand} /></View>;
}

export function CommunityScreen({ groupId, userId, nickname }: { groupId: string; userId: string; nickname: string }) {
  const [channel, setChannel] = useState<CommunityChannel>("chat");
  const [posts, setPosts] = useState<CommunityPostRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPostRow | null>(null);
  const [editingPost, setEditingPost] = useState<CommunityPostRow | null>(null);
  const [comments, setComments] = useState<CommunityCommentRow[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [goalMinutes, setGoalMinutes] = useState("");
  const [focusMinutes, setFocusMinutes] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPosts = async () => {
    setIsLoading(true);
    try { setPosts(await communityRepository.listPosts(groupId, channel)); }
    catch (error) { Alert.alert("커뮤니티를 불러오지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요.")); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { void loadPosts(); }, [channel, groupId]);

  const openPost = async (post: CommunityPostRow) => {
    setSelectedPost(post);
    setComments([]);
    try { setComments(await communityRepository.listComments(post.id)); }
    catch (error) { Alert.alert("댓글을 불러오지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요.")); }
  };

  const openWriter = (post?: CommunityPostRow) => {
    setEditingPost(post ?? null);
    if (post) {
      setTitle(post.title); setBody(post.body); setGoalMinutes(post.challenge_goal_minutes?.toString() ?? ""); setFocusMinutes(post.challenge_focus_minutes?.toString() ?? ""); setChannel(post.channel);
    } else { setTitle(""); setBody(""); setGoalMinutes(""); setFocusMinutes(""); setImageUri(null); }
    setIsWriteOpen(true);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("사진 권한 필요", "챌린지 사진을 올리려면 사진 보관함 권한을 허용해 주세요.");
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0]?.uri ?? null);
  };

  const savePost = async () => {
    if (!title.trim() || !body.trim()) return Alert.alert("내용을 입력해 주세요", "제목과 내용을 모두 작성해야 합니다.");
    const goal = goalMinutes ? Number(goalMinutes) : null;
    const focus = focusMinutes ? Number(focusMinutes) : null;
    if (channel === "challenge" && (!goal || focus === null || Number.isNaN(goal) || Number.isNaN(focus))) return Alert.alert("시간을 확인해 주세요", "챌린지의 목표 시간과 완료 시간을 분 단위로 입력해 주세요.");
    setIsSubmitting(true);
    try {
      let imagePath = editingPost?.image_path ?? null;
      if (imageUri) imagePath = await communityRepository.uploadChallengeImage({ groupId, userId, localUri: imageUri });
      const input = { title: title.trim(), body: body.trim(), image_path: imagePath, challenge_goal_minutes: channel === "challenge" ? goal : null, challenge_focus_minutes: channel === "challenge" ? focus : null };
      const saved = editingPost
        ? await communityRepository.updatePost(editingPost.id, input)
        : await communityRepository.createPost({ group_id: groupId, channel, author_id: userId, author_nickname: nickname.slice(0, 24), ...input });
      if (editingPost) {
        if (imageUri && editingPost.image_path && editingPost.image_path !== imagePath) void communityRepository.deleteImage(editingPost.image_path);
        setPosts((current) => current.map((post) => post.id === saved.id ? saved : post));
        setSelectedPost(saved);
      } else setPosts((current) => [saved, ...current]);
      setIsWriteOpen(false);
    } catch (error) { Alert.alert("글을 저장하지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요.")); }
    finally { setIsSubmitting(false); }
  };

  const removePost = (post: CommunityPostRow) => Alert.alert("글을 삭제할까요?", "삭제한 글과 댓글은 되돌릴 수 없습니다.", [
    { text: "취소", style: "cancel" },
    { text: "삭제", style: "destructive", onPress: () => void (async () => {
      try {
        await communityRepository.deletePost(post.id);
        if (post.image_path) void communityRepository.deleteImage(post.image_path);
        setPosts((current) => current.filter((item) => item.id !== post.id));
        setSelectedPost(null);
      } catch (error) { Alert.alert("글을 삭제하지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요.")); }
    })() },
  ]);

  const createComment = async () => {
    if (!selectedPost || !commentBody.trim()) return;
    setIsSubmitting(true);
    try {
      const comment = await communityRepository.createComment({ post_id: selectedPost.id, group_id: groupId, author_id: userId, author_nickname: nickname.slice(0, 24), body: commentBody.trim() });
      setComments((current) => [...current, comment]); setCommentBody("");
    } catch (error) { Alert.alert("댓글을 올리지 못했습니다", errorText(error, "잠시 후 다시 시도해 주세요.")); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Screen>
      <Card><View style={styles.head}><View><SectionLabel>우리 스터디 커뮤니티</SectionLabel><Text style={styles.subtitle}>방 멤버끼리만 글과 사진을 공유해요.</Text></View><Pressable onPress={() => openWriter()} style={styles.writeButton}><Text style={styles.writeLabel}>글쓰기</Text></Pressable></View><View style={styles.channels}>{(Object.keys(channelLabels) as CommunityChannel[]).map((item) => <Pressable key={item} onPress={() => setChannel(item)} style={[styles.channel, channel === item && styles.channelActive]}><Text style={[styles.channelLabel, channel === item && styles.channelLabelActive]}>{channelLabels[item]}</Text></Pressable>)}</View></Card>
      {isLoading ? <View style={styles.loading}><ActivityIndicator color={colors.brand} /></View> : posts.length ? posts.map((post) => <Pressable key={post.id} onPress={() => void openPost(post)}><Card><Text style={styles.postTitle}>{post.title}</Text>{post.image_path && <ChallengeImage path={post.image_path} />}{post.channel === "challenge" && <Text style={styles.challengeBadge}>챌린지 · 목표 {post.challenge_goal_minutes}분 · 완료 {post.challenge_focus_minutes}분</Text>}<Text style={styles.postBody} numberOfLines={2}>{post.body}</Text><Text style={styles.postMeta}>{post.author_nickname} · {timeLabel(post.created_at)} · 댓글 보기</Text></Card></Pressable>) : <Card><Text style={styles.empty}>첫 글을 남겨 보세요. 이 방 멤버에게만 보입니다.</Text></Card>}

      <Modal visible={isWriteOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsWriteOpen(false)}><ScrollView contentContainerStyle={styles.modal}><View style={styles.modalHead}><Text style={styles.modalTitle}>{editingPost ? "글 수정" : `${channelLabels[channel]} 글쓰기`}</Text><Pressable onPress={() => setIsWriteOpen(false)}><Text style={styles.close}>닫기</Text></Pressable></View><TextInput value={title} onChangeText={setTitle} placeholder="제목" placeholderTextColor={colors.muted} style={styles.titleInput} maxLength={80} />{channel === "challenge" && <><Pressable style={styles.photoButton} onPress={() => void pickImage()}><Text style={styles.photoLabel}>{imageUri || editingPost?.image_path ? "사진 바꾸기" : "사진 선택"}</Text></Pressable><View style={styles.timeRow}><TextInput value={goalMinutes} onChangeText={setGoalMinutes} placeholder="목표(분)" keyboardType="number-pad" placeholderTextColor={colors.muted} style={styles.timeInput} /><TextInput value={focusMinutes} onChangeText={setFocusMinutes} placeholder="완료(분)" keyboardType="number-pad" placeholderTextColor={colors.muted} style={styles.timeInput} /></View></>}<TextInput value={body} onChangeText={setBody} placeholder="같이 나누고 싶은 이야기를 적어 주세요." placeholderTextColor={colors.muted} style={styles.bodyInput} multiline textAlignVertical="top" maxLength={2000} /><Pressable style={styles.submit} onPress={() => void savePost()} disabled={isSubmitting}><Text style={styles.submitLabel}>{isSubmitting ? "저장 중" : editingPost ? "수정 완료" : "글 올리기"}</Text></Pressable></ScrollView></Modal>

      <Modal visible={Boolean(selectedPost)} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedPost(null)}><ScrollView contentContainerStyle={styles.modal}><View style={styles.modalHead}><Text style={styles.modalTitle}>{selectedPost && channelLabels[selectedPost.channel]}</Text><Pressable onPress={() => setSelectedPost(null)}><Text style={styles.close}>닫기</Text></Pressable></View><Text style={styles.detailTitle}>{selectedPost?.title}</Text>{selectedPost?.image_path && <ChallengeImage path={selectedPost.image_path} />}{selectedPost?.channel === "challenge" && <Text style={styles.challengeBadge}>목표 {selectedPost.challenge_goal_minutes}분 · 완료 {selectedPost.challenge_focus_minutes}분</Text>}<Text style={styles.detailBody}>{selectedPost?.body}</Text><Text style={styles.postMeta}>{selectedPost?.author_nickname} · {selectedPost && timeLabel(selectedPost.created_at)}</Text>{selectedPost?.author_id === userId && <View style={styles.ownerActions}><Pressable onPress={() => openWriter(selectedPost)}><Text style={styles.editLabel}>수정</Text></Pressable><Pressable onPress={() => removePost(selectedPost)}><Text style={styles.deleteLabel}>삭제</Text></Pressable></View>}<View style={styles.commentHeader}><SectionLabel>댓글 {comments.length}</SectionLabel></View>{comments.map((comment) => <View key={comment.id} style={styles.comment}><Text style={styles.commentName}>{comment.author_nickname}</Text><Text style={styles.commentBody}>{comment.body}</Text><Text style={styles.commentTime}>{timeLabel(comment.created_at)}</Text></View>)}<View style={styles.commentWrite}><TextInput value={commentBody} onChangeText={setCommentBody} placeholder="댓글을 남겨 보세요" placeholderTextColor={colors.muted} style={styles.commentInput} maxLength={1000} /><Pressable onPress={() => void createComment()} style={styles.commentSubmit} disabled={isSubmitting}><Text style={styles.commentSubmitLabel}>등록</Text></Pressable></View></ScrollView></Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, subtitle: { marginTop: 5, color: colors.muted, fontSize: 12, lineHeight: 18, flexShrink: 1 }, writeButton: { alignSelf: "flex-start", paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, backgroundColor: colors.navy }, writeLabel: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  channels: { flexDirection: "row", gap: 7, marginTop: 16 }, channel: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 14, backgroundColor: "#FCF7F2" }, channelActive: { backgroundColor: "#F7E9DE" }, channelLabel: { color: colors.muted, fontWeight: "800", fontSize: 12 }, channelLabelActive: { color: colors.brandDark },
  loading: { padding: 28, alignItems: "center" }, empty: { color: colors.muted, lineHeight: 20 }, postTitle: { color: colors.text, fontSize: 16, fontWeight: "800" }, postBody: { marginTop: 8, color: colors.text, lineHeight: 20 }, postMeta: { marginTop: 12, color: colors.muted, fontSize: 12 }, postImage: { width: "100%", height: 220, marginTop: 12, borderRadius: 16, backgroundColor: "#F2E7DC" }, imageLoading: { height: 120, marginTop: 12, alignItems: "center", justifyContent: "center" }, challengeBadge: { marginTop: 12, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, backgroundColor: "#EDF8F1", color: "#25714D", fontSize: 12, fontWeight: "800" },
  modal: { flexGrow: 1, padding: 22, backgroundColor: "#FFFDFC" }, modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }, modalTitle: { color: colors.text, fontSize: 18, fontWeight: "800" }, close: { color: colors.brandDark, fontWeight: "800" }, titleInput: { borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, color: colors.text, fontSize: 16, fontWeight: "700" },
  photoButton: { marginTop: 12, paddingVertical: 13, alignItems: "center", borderRadius: 14, backgroundColor: "#F7E9DE" }, photoLabel: { color: colors.brandDark, fontWeight: "800" }, timeRow: { flexDirection: "row", gap: 10, marginTop: 12 }, timeInput: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 13, color: colors.text }, bodyInput: { minHeight: 190, marginTop: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 14, color: colors.text, lineHeight: 21 }, submit: { marginTop: 16, paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: colors.navy }, submitLabel: { color: "#FFFFFF", fontWeight: "800" },
  detailTitle: { color: colors.text, fontSize: 22, fontWeight: "800" }, detailBody: { marginTop: 14, color: colors.text, lineHeight: 23 }, ownerActions: { flexDirection: "row", gap: 16, marginTop: 14 }, editLabel: { color: colors.brandDark, fontWeight: "800" }, deleteLabel: { color: colors.bad, fontWeight: "800" }, commentHeader: { marginTop: 28, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.line }, comment: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line }, commentName: { color: colors.brandDark, fontWeight: "800", fontSize: 13 }, commentBody: { marginTop: 5, color: colors.text, lineHeight: 20 }, commentTime: { marginTop: 5, color: colors.muted, fontSize: 11 }, commentWrite: { flexDirection: "row", gap: 8, marginTop: 16, alignItems: "center" }, commentInput: { flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 12, color: colors.text }, commentSubmit: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: "#F7E9DE" }, commentSubmitLabel: { color: colors.brandDark, fontWeight: "800" },
});
