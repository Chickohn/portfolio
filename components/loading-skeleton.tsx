/**
 * Loading Skeleton Components
 * Reusable loading placeholders for better UX
 */

/**
 * Generic skeleton loader with customizable width and height
 */
export function Skeleton({ 
  className = "h-4 w-full bg-gray-700 rounded" 
}: { 
  className?: string 
}) {
  return (
    <div 
      className={`animate-pulse ${className}`}
      aria-label="Loading..."
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Project card skeleton loader
 * Matches the structure of project cards for seamless loading experience
 * @returns Project card skeleton
 */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4 bg-gray-700" />
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-4 w-5/6 bg-gray-700" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 bg-gray-700 rounded-full" />
        <Skeleton className="h-6 w-24 bg-gray-700 rounded-full" />
        <Skeleton className="h-6 w-16 bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Project details page skeleton loader
 * Matches the structure of project detail pages
 * @returns Project details skeleton
 */
export function ProjectDetailsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8 space-y-6">
        <Skeleton className="h-10 w-3/4 mx-auto bg-gray-700" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-700 rounded-xl" />
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 bg-gray-700 rounded-full" />
          ))}
        </div>
      </div>
      <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8 space-y-4">
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-4 w-full bg-gray-700" />
        <Skeleton className="h-4 w-5/6 bg-gray-700" />
        <Skeleton className="h-64 w-full bg-gray-700 rounded-xl mt-4" />
      </div>
    </div>
  );
}

/**
 * Skills page skeleton loader
 * Matches the structure of skills page cards
 * @returns Skills page skeleton
 */
export function SkillsSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {[1, 2].map((i) => (
        <div key={i} className="bg-gray-800/80 backdrop-blur-sm border-gray-600/50 rounded-xl p-6 space-y-6">
          <Skeleton className="h-8 w-3/4 bg-gray-700" />
          <Skeleton className="h-4 w-full bg-gray-700" />
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="space-y-2">
              <Skeleton className="h-4 w-1/2 bg-gray-700" />
              <Skeleton className="h-2 w-full bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

