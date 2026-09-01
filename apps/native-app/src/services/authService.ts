import { supabase } from "../lib/supabase";
import * as Linking from "expo-linking";

export const authService = {
  async sendMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      // Expo Go uses its own exp:// URL during development; installed builds use studybet://.
      options: { emailRedirectTo: Linking.createURL("auth/callback") },
    });
    if (error) throw error;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: Linking.createURL("auth/callback"),
        skipBrowserRedirect: true,
      },
    });
    if (error) throw error;
    if (!data.url) throw new Error("Google 로그인 주소를 만들지 못했습니다.");
    await Linking.openURL(data.url);
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
