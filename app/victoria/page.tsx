import { unstable_noStore as noStore } from "next/cache";

import { VictoriaExperience } from "@/components/victoria/experience";
import { memories } from "@/lib/victoria/content";
import { requireVictoriaSession } from "@/lib/victoria/auth";
import { getVictoriaPageData } from "@/lib/victoria/queries";
import { createPrivateSignedUrls } from "@/lib/victoria/storage";

const memoryIds = memories.map((memory) => memory.id);

export default async function VictoriaPage() {
  noStore();
  const initialNow = new Date();

  // Two round trips total: the session (which also refreshes it and records the
  // device as seen), then everything the page renders plus the page_view event.
  const session = await requireVictoriaSession();
  const { countdown, messages, media, userMemories, userMilestones, userFuturePlans } = await getVictoriaPageData(session, memoryIds);

  // One batched signing request for every image, rather than one per image.
  // storageKey stays on the server; the client only needs the signed URL.
  const signedUrls = await createPrivateSignedUrls(media.map((item) => item.storageKey));
  const mediaWithUrls = media.flatMap(({ storageKey, ...item }) => {
    const url = signedUrls.get(storageKey);
    return url ? [{ ...item, url }] : [];
  });

  return (
    <VictoriaExperience
      session={session}
      countdown={countdown}
      initialNow={initialNow.toISOString()}
      messages={messages}
      media={mediaWithUrls}
      userMemories={userMemories}
      userMilestones={userMilestones}
      userFuturePlans={userFuturePlans}
      realtimeEnabled={Boolean(process.env.VICTORIA_ABLY_API_KEY)}
    />
  );
}
