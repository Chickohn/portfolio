import { VictoriaClaimForm } from "@/components/victoria/claim-form";

export const dynamic = "force-dynamic";

export default async function VictoriaClaimPage({ params }: { params: { token: string } }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7efe7] px-5 text-stone-950">
      <VictoriaClaimForm token={params.token} />
    </div>
  );
}
