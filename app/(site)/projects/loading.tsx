import { ProjectCardSkeleton } from '@/components/loading-skeleton';

/**
 * Loading state for projects listing page
 */
export default function ProjectsLoading() {
  return (
    <div className="min-h-screen">
      {/* Background with gradient overlay */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 to-black/70 -z-10" />

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-16">
          {/* Category skeleton */}
          <div className="space-y-6">
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-700 rounded animate-pulse" />
            
            {/* Projects grid skeleton */}
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

