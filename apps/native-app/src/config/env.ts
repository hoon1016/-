export const env = {
  // Expo exposes only EXPO_PUBLIC_ values to the mobile bundle. These are safe publishable values.
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "YOUR_SUPABASE_PUBLISHABLE_KEY",
  livekitUrl: process.env.EXPO_PUBLIC_LIVEKIT_URL ?? "wss://YOUR_PROJECT.livekit.cloud",
};
