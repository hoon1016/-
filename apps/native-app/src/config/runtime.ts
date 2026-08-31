import { env } from "./env";

export const runtimeConfig = {
  useMockData:
    env.supabaseUrl.includes("YOUR_PROJECT") || env.supabaseAnonKey.includes("YOUR_SUPABASE"),
  demoInviteCode: "STB-2401",
  demoUserId: "00000000-0000-0000-0000-000000000001",
};
