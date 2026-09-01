# StudyBet Backend

This directory contains the deployable Supabase backend for StudyBet.

## What Is Implemented

- Postgres schema for groups, memberships, study sessions, participant totals, penalties, and recording metadata
- RLS that lets members read group activity but only change their own session, participant, penalty acknowledgement, and recording rows
- Private video bucket named `study-clips`; each user can access only the folder named with their own auth ID
- RPCs for group creation, joining by invite code, and session settlement
- An authenticated `livekit-token` Edge Function that verifies group membership before issuing a two-hour room token

## Deploy Order

1. Create a Supabase project, copy `.env.example` to `.env`, and enter its project URL and publishable key there. The `.env` file is ignored by Git.
2. In the Supabase SQL Editor, run `schema.sql` first and then run `migrations/20260901120000_harden_studybet_backend.sql`.
3. Deploy the Edge Function:

```sh
npx supabase functions deploy livekit-token
```

The Expo TypeScript check deliberately excludes `supabase/functions`; those files run on Supabase's Deno Edge runtime and are checked during function deployment.

4. Add these Edge Function secrets in the Supabase dashboard or CLI. Never place them in the mobile app.

```text
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
```

5. Enable Supabase Auth email magic links before switching the app out of demo mode. `src/services/authService.ts` is ready for the login screen.

## Important Limits

- The app must upload clips to `study-clips/<auth-user-id>/<clip-id>.mp4`.
- `finish_my_session` trusts the supplied totals in this MVP. Server-signed heartbeats are the next hardening step before public launch.
- Store short check-in clips and enforce the per-group retention period; do not persist full study sessions by default.
