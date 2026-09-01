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
      const query = url.split("?")[1] ?? "";
      const params = new URLSearchParams(query);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      if (code) await supabase.auth.exchangeCodeForSession(code);
      if (tokenHash && type === "magiclink") {
        await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
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
