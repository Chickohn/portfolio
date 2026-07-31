import { unstable_noStore as noStore } from "next/cache";

import { VictoriaAdminDashboard } from "@/components/victoria/admin-dashboard";
import { requireVictoriaOwner } from "@/lib/victoria/auth";
import { getAdminDashboardData } from "@/lib/victoria/queries";

export default async function VictoriaAdminActivityPage() {
  noStore();
  await requireVictoriaOwner();
  const data = await getAdminDashboardData();

  return (
    <div className="min-h-screen bg-[#f7efe7] px-4 py-8 text-stone-950">
      <div className="mx-auto max-w-5xl">
        <a href="/victoria" className="text-sm font-medium text-rose-800">
          Back to private page
        </a>
        <h1 className="mt-4 text-3xl font-semibold">Victoria admin</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Edit the countdown, soft-hide user-created content, and check who has signed in. No hard deletes.
        </p>

        <VictoriaAdminDashboard
          countdown={data.countdown}
          users={data.users}
          pageViews={data.pageViews}
          visits={data.visits}
          messages={data.messages}
          media={data.media}
          memories={data.memories}
          milestones={data.milestones}
          plans={data.plans}
        />
      </div>
    </div>
  );
}
