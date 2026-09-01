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
