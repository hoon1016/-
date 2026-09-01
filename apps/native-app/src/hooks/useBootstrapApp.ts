import { useEffect, useState } from "react";
import { emptyAppState, initialAppState } from "../data/mock";
import { runtimeConfig } from "../config/runtime";
import { bootstrapService } from "../services/bootstrapService";
import { AppState } from "../types/domain";

export function useBootstrapApp(userId?: string, groupId?: string) {
  const [appState, setAppState] = useState<AppState>(runtimeConfig.useMockData ? initialAppState : emptyAppState);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (runtimeConfig.useMockData || !userId || !groupId) {
        if (!active) return;
        setIsBootstrapping(false);
        return;
      }

      try {
        const hydrated = await bootstrapService.hydrateApp(groupId, userId);

        if (!active) return;
        if (hydrated) setAppState(hydrated);
      } catch (error) {
        if (!active) return;
        setBootstrapError(
          error instanceof Error ? error.message : "초기 데이터를 불러오지 못했습니다.",
        );
      } finally {
        if (active) setIsBootstrapping(false);
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, [groupId, userId]);

  return {
    appState,
    setAppState,
    isBootstrapping,
    bootstrapError,
  };
}
