import { useEffect, useState } from "react";
import { Linking } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export function useAuthSession(enabled: boolean) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }

    const finishMagicLink = async (url: string) => {
      // Supabase may return a PKCE code in the query or tokens in the URL fragment.
      const query = url.split("?")[1]?.split("#")[0] ?? "";
      const fragment = url.split("#")[1] ?? "";
      const params = new URLSearchParams(`${query}&${fragment}`);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (code) await supabase.auth.exchangeCodeForSession(code);
      if (tokenHash && type === "magiclink") {
        await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
      }
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });
    const subscription = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });
    const linkSubscription = Linking.addEventListener("url", ({ url }) => {
      void finishMagicLink(url);
    });
    void Linking.getInitialURL().then((url) => {
      if (url) return finishMagicLink(url);
      return undefined;
    });

    return () => {
      subscription.data.subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, [enabled]);

  return { session, isLoading };
}
