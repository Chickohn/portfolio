/**
 * Accessible Video Component
 * Enhanced video component with accessibility features
 */

import { ProjectSection } from '@/lib/projects';

interface AccessibleVideoProps {
  section: ProjectSection;
  index: number;
}

/**
 * Enhanced video component with accessibility features
 * Includes captions support, poster images, and static descriptions
 */
export default function AccessibleVideo({ section, index }: AccessibleVideoProps) {
  return (
    <div key={index} className="mb-8">
      <div className="relative">
        <video 
          controls 
          className="rounded-xl mx-auto w-full max-w-2xl shadow-lg"
          preload="metadata"
          poster={section.poster || undefined}
          aria-label={section.alt || "Project demonstration video"}
        >
          <source src={section.src} type="video/mp4" />
          {section.captions && (
            <track 
              kind="captions" 
              src={section.captions} 
              srcLang="en" 
              label="English captions"
              default
            />
          )}
          <p className="text-gray-300 text-center p-4">
            Your browser does not support the video tag. 
            <a 
              href={section.src} 
              className="text-blue-400 hover:underline ml-1"
              target="_blank" 
              rel="noopener noreferrer"
            >
              Download the video instead
            </a>
          </p>
        </video>
      </div>
      
      {section.caption && (
        <p className="text-sm mt-3 text-gray-400 text-center">{section.caption}</p>
      )}
      
      {/* Alternative static description for users who prefer reduced motion */}
      {section.staticDescription && (
        <details className="mt-4 p-4 bg-gray-800/50 rounded-lg">
          <summary className="text-blue-400 cursor-pointer hover:text-blue-300">
            View text description instead of video
          </summary>
          <p className="text-gray-300 mt-2 text-sm leading-relaxed">
            {section.staticDescription}
          </p>
        </details>
      )}
    </div>
  );
}

