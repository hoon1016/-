# StudyBet

StudyBet is a friend-based study accountability product concept that combines:

- YPT-style study time tracking and ranking
- Selog-style camera presence and daily recording
- Social penalties such as buying coffee or snacks for missing goals

## Included

- `apps/web-prototype`
  - interactive browser prototype
- `apps/native-app`
  - Expo + React Native starter app
- `docs`
  - product spec and native build plan

## Project Structure

```text
studybet-project/
  apps/
    native-app/
    web-prototype/
  docs/
```

## Status

This repository contains:

- product planning artifacts
- a runnable web prototype
- a mobile app scaffold with camera/session/backend integration points

## Next Steps

1. Install dependencies in `apps/native-app`
2. Configure Supabase in `apps/native-app/src/config/env.ts`
3. Run the SQL in `apps/native-app/supabase/schema.sql`
4. Connect LiveKit token issuance for realtime rooms
