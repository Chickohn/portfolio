import { SkillsSkeleton } from '@/components/loading-skeleton';

/**
 * Loading state for skills page
 */
export default function SkillsLoading() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"/>
      <div className="fixed inset-0 bg-gradient-to-b from-gray-900/80 to-gray-950/90 -z-10" />

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="h-12 w-64 bg-gray-700 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-6 w-96 bg-gray-700 rounded mx-auto animate-pulse" />
        </div>
        <SkillsSkeleton />
      </div>
    </div>
  );
}

