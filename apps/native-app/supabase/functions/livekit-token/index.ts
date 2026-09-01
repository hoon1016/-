import { AccessToken } from "npm:livekit-server-sdk@2.13.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

type TokenRequest = { groupId?: string };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Authentication required" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
  const livekitUrl = Deno.env.get("LIVEKIT_URL");
  const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
  const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");
  if (!supabaseUrl || !supabaseKey || !livekitUrl || !livekitApiKey || !livekitApiSecret) {
    return json({ error: "Server configuration missing" }, 500);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authorization } },
  });
  const { data: userResult, error: userError } = await supabase.auth.getUser();
  if (userError || !userResult.user) return json({ error: "Invalid session" }, 401);

  const payload = (await request.json()) as TokenRequest;
  if (!payload.groupId) return json({ error: "groupId is required" }, 400);

  const { data: member, error: memberError } = await supabase
    .from("group_members")
    .select("nickname")
    .eq("group_id", payload.groupId)
    .eq("user_id", userResult.user.id)
    .maybeSingle();
  if (memberError || !member) return json({ error: "Group membership required" }, 403);

  const roomName = `study-group-${payload.groupId}`;
  const token = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: userResult.user.id,
    name: member.nickname,
    ttl: "2h",
  });
  token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

  return json({
    roomName,
    participantName: member.nickname,
    token: await token.toJwt(),
    wsUrl: livekitUrl,
  });
});
