/**
 * Shown immediately while /victoria resolves its session and page data.
 *
 * Without this the route is force-dynamic with no Suspense boundary, so Next has
 * nothing to stream and the browser holds a blank page for the full server
 * round trip. The shape mirrors components/victoria/experience.tsx so the layout
 * does not jump when the real content arrives.
 */
export default function VictoriaLoading() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f7efe7] text-stone-950" aria-busy="true">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(252,165,165,0.32),transparent_34%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-7 px-4 py-6 sm:px-6 lg:px-8">
        <p className="sr-only" role="status">
          Loading your private page
        </p>

        <header className="pt-7">
          <div className="h-3 w-16 animate-pulse rounded bg-rose-200/70" />
          <div className="mt-4 h-11 w-3/4 animate-pulse rounded-2xl bg-white/70 sm:h-14" />
          <div className="mt-5 h-4 w-full max-w-xl animate-pulse rounded bg-white/60" />
        </header>

        {/* Countdown */}
        <section className="rounded-[2rem] border border-white/45 bg-white/65 p-5 shadow-[0_24px_80px_rgba(131,88,79,0.22)] md:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-full bg-rose-100" />
            <div className="flex-1">
              <div className="h-4 w-48 animate-pulse rounded bg-stone-200" />
              <div className="mt-2 h-3 w-64 animate-pulse rounded bg-stone-100" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {["days", "hours", "minutes", "seconds"].map((unit) => (
              <div key={unit} className="h-[5.5rem] animate-pulse rounded-2xl bg-stone-900/90" />
            ))}
          </div>
        </section>

        {/* Today */}
        <section className="rounded-[2rem] border border-white/45 bg-stone-950 p-5 md:p-7">
          <div className="h-3 w-14 animate-pulse rounded bg-rose-200/40" />
          <div className="mt-4 h-7 w-2/3 animate-pulse rounded bg-white/20" />
        </section>

        {/* Memories */}
        <section>
          <div className="mb-4 h-7 w-40 animate-pulse rounded bg-white/70" />
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1].map((index) => (
              <div key={index} className="rounded-[2rem] border border-white/45 bg-white/70 p-5">
                <div className="h-3 w-28 animate-pulse rounded bg-rose-100" />
                <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-stone-200" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-stone-100" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Milestones / plans */}
        <section className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((index) => (
            <div key={index} className="rounded-[2rem] border border-white/45 bg-white/70 p-5">
              <div className="h-6 w-36 animate-pulse rounded bg-stone-200" />
              <div className="mt-5 space-y-3">
                <div className="h-14 animate-pulse rounded-3xl bg-white/70" />
                <div className="h-14 animate-pulse rounded-3xl bg-white/70" />
              </div>
            </div>
          ))}
        </section>

        {/* Notes */}
        <section className="rounded-[2rem] border border-white/45 bg-white/70 p-5 md:p-7">
          <div className="h-6 w-40 animate-pulse rounded bg-stone-200" />
          <div className="mt-5 space-y-3">
            <div className="h-16 w-3/4 animate-pulse rounded-3xl bg-rose-100" />
            <div className="ml-auto h-16 w-2/3 animate-pulse rounded-3xl bg-stone-900/90" />
          </div>
          <div className="mt-5 h-20 animate-pulse rounded-3xl bg-white/80" />
        </section>
      </div>
    </div>
  );
}
