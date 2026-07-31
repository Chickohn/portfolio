import { z } from "zod";

import { dbQuery } from "./db";
import type { VictoriaActivityEventType, VictoriaSession } from "./types";
import { victoriaActivityEventTypes } from "./types";

const metadataSchema = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({});

export async function recordVictoriaActivity(
  session: VictoriaSession,
  eventType: VictoriaActivityEventType,
  metadata: Record<string, string | number | boolean> = {},
) {
  if (!victoriaActivityEventTypes.includes(eventType)) {
    return;
  }

  const parsed = metadataSchema.parse(metadata);
  await dbQuery(
    `recordVictoriaActivity:${eventType}`,
    `
      INSERT INTO victoria_activity_events (user_id, device_id, event_type, event_metadata)
      VALUES ($1::uuid, $2::uuid, $3, $4::jsonb)
    `,
    [session.user.id, session.device.id, eventType, JSON.stringify(parsed)],
  );
}
