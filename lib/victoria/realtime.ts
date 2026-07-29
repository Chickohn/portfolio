import Ably from "ably";

import type { VictoriaMessage, VictoriaSession } from "./types";

const CHANNEL_NAME = "private:two-notes";

export function getRealtimeChannelName() {
  return CHANNEL_NAME;
}

function getServerAbly() {
  const key = process.env.VICTORIA_ABLY_API_KEY;
  if (!key) {
    return null;
  }
  return new Ably.Rest(key);
}

export async function publishMessage(message: VictoriaMessage) {
  const ably = getServerAbly();
  if (!ably) {
    return { published: false };
  }

  await ably.channels.get(CHANNEL_NAME).publish("message.created", message);
  return { published: true };
}

export async function createRealtimeTokenRequest(session: VictoriaSession) {
  const ably = getServerAbly();
  if (!ably) {
    return null;
  }

  return ably.auth.createTokenRequest({
    clientId: `${session.user.username}:${session.device.id}`,
    ttl: 10 * 60 * 1000,
    capability: {
      [CHANNEL_NAME]: ["subscribe", "presence"],
    },
  });
}
