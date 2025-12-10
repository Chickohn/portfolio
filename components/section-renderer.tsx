/**
 * Section Renderer Component
 * Renders different types of project sections (text, image, video, file)
 * Handles all project content types with appropriate components
 */

import Image from 'next/image';
import { ProjectSection } from '@/lib/projects';
import AccessibleVideo from './accessible-video';
import { renderTextWithLinks } from '@/lib/parsing';

interface SectionRendererProps {
  /** Project section to render */
  section: ProjectSection;
  /** Index for React key prop */
  index: number;
}

/**
 * Component to render different section types
 * Supports text, image, video, and file download sections
 * @param props - Component props
 * @returns Rendered section component
 */
export default function SectionRenderer({ section, index }: SectionRendererProps) {
  switch (section.type) {
    case "text":
      return (
        <div key={index} className="mb-6">
          <p className="text-gray-200 text-base leading-relaxed text-left last:mb-0">
            {renderTextWithLinks(section.content || '')}
          </p>
        </div>
      );
    case "image":
      return (
        <div key={index} className="mb-8">
          <Image 
            src={section.src || "/placeholder.svg"} 
            alt={section.alt || "Project image"}
            width={800} 
            height={450} 
            className="rounded-xl mx-auto shadow-lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            loading="lazy"
          />
          {section.caption && (
            <p className="text-sm mt-3 text-gray-400 text-center">{section.caption}</p>
          )}
        </div>
      );
    case "video":
      return <AccessibleVideo section={section} index={index} />;
    case "file":
      return (
        <div key={index} className="mt-10 flex justify-center">
          <a 
            href={section.src} 
            download={section.filename} 
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full font-semibold shadow-lg transition-all duration-300 text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transform hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 transition-transform group-hover:translate-y-[-1px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              {section.description}
            </span>
          </a>
        </div>
      );
    default:
      return null;
  }
}

