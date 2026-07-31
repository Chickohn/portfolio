import { ProjectDetailsSkeleton } from '@/components/loading-skeleton';

/**
 * Loading state for project detail pages
 */
export default function ProjectLoading() {
  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"/>
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 to-black/90 -z-10" />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <ProjectDetailsSkeleton />
        </div>
      </div>
    </div>
  );
}

