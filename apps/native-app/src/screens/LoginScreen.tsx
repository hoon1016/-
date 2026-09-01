import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { authService } from "../services/authService";

type LoginMethod = "signin" | "signup" | "google";

const errorMessage = (error: unknown, fallback: string) => {
  if (!(error instanceof Error)) return fallback;
  if (error.message.toLowerCase().includes("invalid login")) return "이메일 또는 비밀번호를 다시 확인해 주세요.";
  if (error.message.toLowerCase().includes("already registered")) return "이미 가입된 이메일입니다. 로그인을 선택해 주세요.";
  if (error.message.toLowerCase().includes("password")) return "비밀번호는 6자 이상으로 입력해 주세요.";
  return error.message || fallback;
};

export function LoginScreen() {
  const [method, setMethod] = useState<LoginMethod>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const selectMethod = (nextMethod: LoginMethod) => {
    setMethod(nextMethod);
    setMessage(null);
  };

  const isValidEmail = email.includes("@");

  const signIn = async () => {
    if (!isValidEmail || !password) {
      setMessage("이메일과 비밀번호를 입력해 주세요.");
      return;
    }
    setIsSending(true);
    try {
      await authService.signInWithPassword(email.trim(), password);
    } catch (error) {
      setMessage(errorMessage(error, "로그인에 실패했습니다."));
    } finally {
      setIsSending(false);
    }
  };

  const signUp = async () => {
    if (!isValidEmail || password.length < 6 || nickname.trim().length < 2) {
      setMessage("닉네임 2자 이상, 올바른 이메일, 비밀번호 6자 이상을 입력해 주세요.");
      return;
    }
    setIsSending(true);
    try {
      const user = await authService.signUpWithPassword(email.trim(), password, nickname.trim());
      setMessage(user?.identities?.length ? "가입 확인 이메일을 보냈어요. 같은 아이폰에서 링크를 열어 주세요." : "이미 가입된 이메일입니다. 로그인을 선택해 주세요.");
    } catch (error) {
      setMessage(errorMessage(error, "회원가입에 실패했습니다."));
    } finally {
      setIsSending(false);
    }
  };

  const sendMagicLink = async () => {
    if (!isValidEmail) {
      setMessage("이메일 주소를 입력해 주세요.");
      return;
    }
    setIsSending(true);
    try {
      await authService.sendMagicLink(email.trim());
      setMessage("비밀번호 없는 로그인 링크를 보냈어요. 같은 아이폰에서 이메일을 열어 주세요.");
    } catch (error) {
      setMessage(errorMessage(error, "로그인 링크 전송에 실패했습니다."));
    } finally {
      setIsSending(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsSending(true);
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      setMessage(errorMessage(error, "Google 로그인에 실패했습니다."));
    } finally {
      setIsSending(false);
    }
  };

  const isSignUp = method === "signup";

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
            <Pressable style={styles.tab} onPress={() => selectMethod("signin")}>
              <Text style={[styles.tabText, method === "signin" && styles.tabTextActive]}>로그인</Text>
              {method === "signin" && <View style={styles.tabIndicator} />}
            </Pressable>
            <Pressable style={styles.tab} onPress={() => selectMethod("signup")}>
              <Text style={[styles.tabText, method === "signup" && styles.tabTextActive]}>회원가입</Text>
              {method === "signup" && <View style={styles.tabIndicator} />}
            </Pressable>
            <Pressable style={styles.tab} onPress={() => selectMethod("google")}>
              <Text style={[styles.tabText, method === "google" && styles.tabTextActive]}>소셜 로그인</Text>
              {method === "google" && <View style={styles.tabIndicator} />}
            </Pressable>
          </View>

          {method === "google" ? (
            <View style={styles.formArea}>
              <Text style={styles.formTitle}>계정 하나로 시작하세요</Text>
              <Text style={styles.formCopy}>Google 계정으로 StudyBet의 기록을 안전하게 이어갈 수 있어요.</Text>
              <Pressable style={[styles.googleButton, isSending && styles.disabled]} onPress={signInWithGoogle} disabled={isSending}>
                <View style={styles.googleBadge}><Text style={styles.googleMark}>G</Text></View>
                <Text style={styles.googleText}>{isSending ? "Google 연결 중" : "Google로 계속하기"}</Text>
              </Pressable>
              <Text style={styles.helpText}>Google 로그인은 공급자 연결 후 바로 사용할 수 있어요.</Text>
            </View>
          ) : (
            <View style={styles.formArea}>
              <Text style={styles.formTitle}>{isSignUp ? "StudyBet 계정 만들기" : "StudyBet에 로그인"}</Text>
              <Text style={styles.formCopy}>{isSignUp ? "친구들과 함께할 닉네임을 정해 주세요." : "오늘의 공부 약속을 이어가세요."}</Text>
              {isSignUp && (
                <TextInput
                  autoCapitalize="none"
                  placeholder="닉네임"
                  placeholderTextColor="#A9A9AE"
                  style={styles.input}
                  value={nickname}
                  onChangeText={setNickname}
                />
              )}
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="이메일 주소"
                placeholderTextColor="#A9A9AE"
                style={[styles.input, isSignUp && styles.stackedInput]}
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                autoCapitalize="none"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                secureTextEntry
                placeholder="비밀번호"
                placeholderTextColor="#A9A9AE"
                style={[styles.input, styles.stackedInput]}
                value={password}
                onChangeText={setPassword}
              />
              {!isSignUp && <Text style={styles.keepSignedIn}>✓ 로그인 상태 유지</Text>}
              <Pressable style={[styles.primaryButton, isSending && styles.disabled]} onPress={isSignUp ? signUp : signIn} disabled={isSending}>
                <Text style={styles.primaryButtonText}>{isSending ? "처리 중" : isSignUp ? "회원가입" : "로그인"}</Text>
              </Pressable>
              {!isSignUp && (
                <Pressable onPress={sendMagicLink} disabled={isSending}>
                  <Text style={styles.magicLink}>비밀번호 없이 이메일 링크로 로그인</Text>
                </Pressable>
              )}
            </View>
          )}

          {message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>친구와 함께 시작</Text>
            <View style={styles.divider} />
          </View>
          <Text style={styles.footerCopy}>로그인 후 스터디를 만들거나 초대 코드로 참가할 수 있어요.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F6F2" },
  page: { flex: 1, justifyContent: "center", paddingHorizontal: 28, paddingBottom: 28 },
  brandBlock: { alignItems: "center", marginBottom: 34 },
  brandLine: { width: 26, height: 4, borderRadius: 2, backgroundColor: "#F2A33B", marginBottom: 16 },
  wordmark: { color: "#18191B", fontSize: 31, fontWeight: "900", letterSpacing: 2.4 },
  tagline: { marginTop: 9, color: "#7A7B81", fontSize: 12, fontWeight: "600", letterSpacing: 0.25 },
  loginCard: { width: "100%", maxWidth: 430, alignSelf: "center" },
  tabs: { height: 52, flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#DCDDE0" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", position: "relative" },
  tabText: { color: "#8E9097", fontSize: 13, fontWeight: "600" },
  tabTextActive: { color: "#17181A", fontWeight: "800" },
  tabIndicator: { position: "absolute", left: 10, right: 10, bottom: -1, height: 2, backgroundColor: "#17181A" },
  formArea: { paddingTop: 27 },
  formTitle: { color: "#202124", fontSize: 20, fontWeight: "800", letterSpacing: -0.4 },
  formCopy: { marginTop: 8, color: "#777980", fontSize: 13, lineHeight: 19 },
  input: { marginTop: 21, height: 54, borderWidth: 1, borderColor: "#D8D9DD", borderRadius: 6, paddingHorizontal: 16, color: "#202124", backgroundColor: "#FCFCFB", fontSize: 15 },
  stackedInput: { marginTop: 10 },
  keepSignedIn: { marginTop: 11, color: "#57595F", fontSize: 12, fontWeight: "600" },
  primaryButton: { marginTop: 18, height: 55, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#1B1C1E" },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  magicLink: { marginTop: 14, color: "#6E7077", fontSize: 12, fontWeight: "600", textAlign: "center", textDecorationLine: "underline" },
  googleButton: { marginTop: 24, height: 56, borderWidth: 1, borderColor: "#D8D9DD", borderRadius: 6, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, backgroundColor: "#FFFFFF" },
  googleBadge: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F7F7" },
  googleMark: { color: "#4285F4", fontSize: 15, fontWeight: "900" },
  googleText: { color: "#202124", fontSize: 15, fontWeight: "800" },
  helpText: { marginTop: 11, color: "#8A8C92", fontSize: 12, textAlign: "center" },
  message: { marginTop: 18, padding: 12, borderRadius: 6, backgroundColor: "#FFF2DF", color: "#83551B", fontSize: 13, lineHeight: 19 },
  dividerRow: { marginTop: 31, flexDirection: "row", alignItems: "center", gap: 12 },
  divider: { height: 1, flex: 1, backgroundColor: "#DFE0E2" },
  dividerText: { color: "#92939A", fontSize: 11, fontWeight: "600" },
  footerCopy: { marginTop: 15, color: "#777980", fontSize: 12, lineHeight: 18, textAlign: "center" },
  disabled: { opacity: 0.52 },
});
