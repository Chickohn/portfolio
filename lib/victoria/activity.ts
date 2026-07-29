import { z } from "zod";

import { getSql } from "./db";
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
  const sql = getSql();
  await sql`
    INSERT INTO victoria_activity_events (user_id, device_id, event_type, event_metadata)
    VALUES (${session.user.id}::uuid, ${session.device.id}::uuid, ${eventType}, ${JSON.stringify(parsed)}::jsonb)
  `;
}
