import { unstable_noStore as noStore } from "next/cache";

import { VictoriaExperience } from "@/components/victoria/experience";
import { recordVictoriaActivity } from "@/lib/victoria/activity";
import { memories } from "@/lib/victoria/content";
import { requireVictoriaSession } from "@/lib/victoria/auth";
import { getCountdownSettings, getMediaForMemories, getMessages } from "@/lib/victoria/queries";
import { createPrivateSignedUrl } from "@/lib/victoria/storage";

export default async function VictoriaPage() {
  noStore();
  const initialNow = new Date();
  const session = await requireVictoriaSession();
  const countdown = await getCountdownSettings();
  const messagesResult = await getMessages();
  const mediaRows = await getMediaForMemories(memories.map((memory) => memory.id));
  await recordVictoriaActivity(session, "page_view", { route: "/victoria" }).catch(() => undefined);

  const media = await Promise.all(
    mediaRows.map(async (row) => {
      try {
        return {
          id: String(row.id),
          memoryId: row.memory_id ? String(row.memory_id) : null,
          url: await createPrivateSignedUrl(String(row.storage_key)),
          caption: row.caption ? String(row.caption) : null,
          width: row.width ? Number(row.width) : null,
          height: row.height ? Number(row.height) : null,
        };
      } catch {
        return null;
      }
    }),
  );

  return (
    <VictoriaExperience
      session={session}
      countdown={countdown}
      initialNow={initialNow.toISOString()}
      messages={messagesResult.messages}
      media={media.filter((item): item is NonNullable<typeof item> => item !== null)}
      realtimeEnabled={Boolean(process.env.VICTORIA_ABLY_API_KEY)}
    />
  );
}
