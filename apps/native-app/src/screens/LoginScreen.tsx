import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { authService } from "../services/authService";
import { colors } from "../theme/tokens";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendLink = async () => {
    if (!email.includes("@")) {
      setMessage("이메일 주소를 확인해 주세요.");
      return;
    }
    setIsSending(true);
    try {
      await authService.sendMagicLink(email.trim());
      setMessage("이메일로 로그인 링크를 보냈어요. 아이폰에서 링크를 열어 주세요.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인 링크 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsSending(true);
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google 로그인에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.page}>
      <LinearGradient colors={["#243646", "#31465C"]} style={styles.hero}>
        <Text style={styles.kicker}>STUDYBET</Text>
        <Text style={styles.title}>친구와 함께{`\n`}공부를 증명하세요.</Text>
        <Text style={styles.body}>공부시간, 캠 체크인, 그리고 가벼운 벌칙까지 한 방에서 관리합니다.</Text>
      </LinearGradient>
      <View style={styles.form}>
        <Text style={styles.label}>이메일로 시작하기</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#9A9A9A"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <Pressable style={[styles.button, isSending && styles.disabled]} onPress={sendLink} disabled={isSending}>
          <Text style={styles.buttonText}>{isSending ? "링크 보내는 중" : "로그인 링크 받기"}</Text>
        </Pressable>
        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>또는</Text>
          <View style={styles.orLine} />
        </View>
        <Pressable style={[styles.googleButton, isSending && styles.disabled]} onPress={signInWithGoogle} disabled={isSending}>
          <Text style={styles.googleMark}>G</Text>
          <Text style={styles.googleText}>Google로 계속하기</Text>
        </Pressable>
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: 20, gap: 18 },
  hero: { borderRadius: 30, padding: 28 },
  kicker: { color: "#C8D2DD", fontSize: 12, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#FFFFFF", fontSize: 31, fontWeight: "800", lineHeight: 40, marginTop: 10 },
  body: { color: "#DDE6EF", fontSize: 14, lineHeight: 21, marginTop: 12 },
  form: { borderRadius: 26, backgroundColor: "#FFFFFF", padding: 20 },
  label: { color: colors.text, fontSize: 16, fontWeight: "800" },
  input: { marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 14, color: colors.text, fontSize: 16 },
  button: { marginTop: 12, backgroundColor: colors.brand, borderRadius: 14, paddingVertical: 15, alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15 },
  orRow: { marginTop: 16, flexDirection: "row", alignItems: "center", gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.line },
  orText: { color: colors.muted, fontSize: 12 },
  googleButton: { marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: colors.line, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  googleMark: { color: "#4285F4", fontSize: 17, fontWeight: "900" },
  googleText: { color: colors.text, fontWeight: "800", fontSize: 15 },
  message: { marginTop: 12, color: colors.muted, fontSize: 13, lineHeight: 19 },
  disabled: { opacity: 0.55 },
});
