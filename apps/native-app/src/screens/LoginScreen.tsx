import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { authService } from "../services/authService";

type LoginMethod = "email" | "google";

export function LoginScreen() {
  const [method, setMethod] = useState<LoginMethod>("email");
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
      setMessage("로그인 링크를 보냈어요. 같은 아이폰에서 이메일을 열어 주세요.");
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.page}>
        <View style={styles.brandBlock}>
          <View style={styles.brandLine} />
          <Text style={styles.wordmark}>STUDYBET</Text>
          <Text style={styles.tagline}>Study together. Keep the bet.</Text>
        </View>

        <View style={styles.loginCard}>
          <View style={styles.tabs}>
            <Pressable style={styles.tab} onPress={() => { setMethod("email"); setMessage(null); }}>
              <Text style={[styles.tabText, method === "email" && styles.tabTextActive]}>이메일 로그인</Text>
              {method === "email" && <View style={styles.tabIndicator} />}
            </Pressable>
            <Pressable style={styles.tab} onPress={() => { setMethod("google"); setMessage(null); }}>
              <Text style={[styles.tabText, method === "google" && styles.tabTextActive]}>Google 로그인</Text>
              {method === "google" && <View style={styles.tabIndicator} />}
            </Pressable>
          </View>

          {method === "email" ? (
            <View style={styles.formArea}>
              <Text style={styles.formTitle}>이메일로 가볍게 시작하세요</Text>
              <Text style={styles.formCopy}>비밀번호 없이 로그인 링크를 보내드려요.</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="이메일 주소"
                placeholderTextColor="#A9A9AE"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
              <Pressable style={[styles.primaryButton, isSending && styles.disabled]} onPress={sendLink} disabled={isSending}>
                <Text style={styles.primaryButtonText}>{isSending ? "링크 보내는 중" : "로그인 링크 받기"}</Text>
              </Pressable>
              <Text style={styles.helpText}>링크를 열면 StudyBet으로 자동 로그인됩니다.</Text>
            </View>
          ) : (
            <View style={styles.formArea}>
              <Text style={styles.formTitle}>Google 계정으로 시작하세요</Text>
              <Text style={styles.formCopy}>친구들과 공부 기록을 안전하게 이어갈 수 있어요.</Text>
              <Pressable style={[styles.googleButton, isSending && styles.disabled]} onPress={signInWithGoogle} disabled={isSending}>
                <View style={styles.googleBadge}><Text style={styles.googleMark}>G</Text></View>
                <Text style={styles.googleText}>{isSending ? "Google 연결 중" : "Google로 계속하기"}</Text>
              </Pressable>
              <Text style={styles.helpText}>Google 로그인은 현재 연결 설정을 진행 중입니다.</Text>
            </View>
          )}

          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>친구와 함께 시작</Text>
            <View style={styles.divider} />
          </View>
          <Text style={styles.footerCopy}>첫 로그인 후 스터디를 만들거나 초대 코드로 참가할 수 있어요.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F6F2" },
  page: { flex: 1, justifyContent: "center", paddingHorizontal: 28, paddingBottom: 34 },
  brandBlock: { alignItems: "center", marginBottom: 42 },
  brandLine: { width: 26, height: 4, borderRadius: 2, backgroundColor: "#F2A33B", marginBottom: 16 },
  wordmark: { color: "#18191B", fontSize: 31, fontWeight: "900", letterSpacing: 2.4 },
  tagline: { marginTop: 9, color: "#7A7B81", fontSize: 12, fontWeight: "600", letterSpacing: 0.25 },
  loginCard: { width: "100%", maxWidth: 430, alignSelf: "center" },
  tabs: { height: 52, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#DCDDE0" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  tabText: { color: "#8E9097", fontSize: 14, fontWeight: "600" },
  tabTextActive: { color: "#17181A", fontWeight: "800" },
  tabIndicator: { position: "absolute", left: 18, right: 18, bottom: -1, height: 2, backgroundColor: "#17181A" },
  formArea: { paddingTop: 29 },
  formTitle: { color: "#202124", fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  formCopy: { marginTop: 8, color: "#777980", fontSize: 13, lineHeight: 19 },
  input: { marginTop: 22, height: 56, borderWidth: 1, borderColor: "#D8D9DD", borderRadius: 6, paddingHorizontal: 17, color: "#202124", backgroundColor: "#FCFCFB", fontSize: 15 },
  primaryButton: { marginTop: 12, height: 56, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#1B1C1E" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  helpText: { marginTop: 11, color: "#8A8C92", fontSize: 12, textAlign: "center" },
  googleButton: { marginTop: 24, height: 56, borderWidth: 1, borderColor: "#D8D9DD", borderRadius: 6, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, backgroundColor: "#FFFFFF" },
  googleBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F7F7" },
  googleMark: { color: "#4285F4", fontSize: 15, fontWeight: "900" },
  googleText: { color: "#202124", fontSize: 15, fontWeight: "800" },
  message: { marginTop: 18, padding: 12, borderRadius: 6, backgroundColor: "#FFF2DF", color: "#83551B", fontSize: 13, lineHeight: 19 },
  dividerRow: { marginTop: 34, flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { height: 1, flex: 1, backgroundColor: "#DFE0E2" },
  dividerText: { color: "#92939A", fontSize: 11, fontWeight: "600" },
  footerCopy: { marginTop: 16, color: "#777980", fontSize: 12, lineHeight: 18, textAlign: "center" },
  disabled: { opacity: 0.52 },
});
