"use server";

import { Language } from "@/lib/types";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

export async function getParticipantToken(language: Language) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Server misconfigured");
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: String(Math.random()).slice(2), // Generate a random identity
  });

  const room = `my-room-${Math.random().toString(36).substring(2, 15)}`;

  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  at.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: "doc-bot",
        metadata: JSON.stringify({
          language,
        }),
      }),
    ],
  });

  return { token: await at.toJwt(), room };
}

export async function closeRoom(room: string) {
  const roomServiceClient = new RoomServiceClient(
    process.env.LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
  );
  await roomServiceClient.deleteRoom(room);
}
