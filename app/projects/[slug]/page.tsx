import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProjectById, ProjectSection } from '../../../lib/projects'

// Function to parse project description into structured data
function parseProjectDescription(description: string) {
  const sections = description.split('|').map(section => section.trim());
  const parsed: Record<string, string> = {};
  
  sections.forEach(section => {
    const [key, ...valueParts] = section.split(':');
    if (key && valueParts.length > 0) {
      parsed[key.trim().toLowerCase()] = valueParts.join(':').trim();
    }
  });
  
  return parsed;
}

// Creative Project Details Component
function ProjectDetailsCard({ description }: { description: string }) {
  const details = parseProjectDescription(description);
  
  const sections = [
    { key: 'problem', label: 'Problem', icon: '🎯', color: 'from-red-500 to-red-600' },
    { key: 'role', label: 'Role', icon: '👤', color: 'from-blue-500 to-blue-600' },
    { key: 'stack', label: 'Stack', icon: '⚙️', color: 'from-green-500 to-green-600' },
    { key: 'outcome', label: 'Outcome', icon: '🚀', color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {sections.map((section, index) => (
        <div key={section.key} className="group">
          <div
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 min-h-24 flex flex-col items-center justify-center transition-all duration-300 group-hover:border-gray-600/70 cursor-pointer overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">
              {section.icon}
            </div>
            <h3 className="text-white font-medium text-sm text-center">
              {section.label}
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed mt-2 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-40 transition-all duration-300 text-center">
              {details[section.key] || 'Not specified'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Function to convert URLs in text to clickable links
function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// Enhanced video component with accessibility features
function AccessibleVideo({ section, index }: { section: ProjectSection; index: number }) {
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
  )
}

// Component to render different section types
function SectionRenderer({ section, index }: { section: ProjectSection; index: number }) {
  switch (section.type) {
    case "text":
      return (
        <div key={index} className="mb-6">
          <p className="text-gray-200 text-base leading-relaxed text-left last:mb-0">
            {renderTextWithLinks(section.content || '')}
          </p>
        </div>
      )
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
          />
          {section.caption && (
            <p className="text-sm mt-3 text-gray-400 text-center">{section.caption}</p>
          )}
        </div>
      )
    case "video":
      return <AccessibleVideo section={section} index={index} />
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
      )
    default:
      return null
  }
}

export default async function Project({ params }: { params: { slug: string } }) {
  const project = getProjectById(params.slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"/>
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 to-black/90 -z-10" />

      {/* Back Button - Repositioned to avoid nav overlap */}
      <div className="fixed top-32 left-6 z-40">
        <Link 
          href="/projects"
          className="group flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-full text-gray-300 hover:text-white hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
          aria-label="Back to projects"
        >
          <svg 
            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="text-sm font-medium">Back to Projects</span>
        </Link>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          {/* Project Header Card */}
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                {project.title}
              </h1>
              
              {/* Interactive Project Details */}
              <ProjectDetailsCard description={project.description} />
            </div>
            
            {/* Technologies */}
            <div className="flex flex-wrap justify-center gap-3">
              {project.technologies.map((tech, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-gray-800/60 text-gray-200 rounded-full text-sm border border-gray-600/50 hover:bg-gray-700/60 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Project Content Card */}
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-8">
            <div className="space-y-6">
              {project.sections.map((section, index) => (
                <SectionRenderer key={index} section={section} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
