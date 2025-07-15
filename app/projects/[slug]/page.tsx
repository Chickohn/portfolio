import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProjectById, ProjectSection } from '../../../lib/projects'

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
          className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// Component to render different section types
function SectionRenderer({ section, index }: { section: ProjectSection; index: number }) {
  switch (section.type) {
    case "text":
      return (
        <p key={index} className="mb-4 text-gray-200 text-base text-left last:mb-0">
          {renderTextWithLinks(section.content || '')}
        </p>
      )
    case "image":
      return (
        <div key={index} className="mb-4">
          <Image 
            src={section.src || "/placeholder.svg"} 
            alt={section.alt || "Project image"}
            width={800} 
            height={450} 
            className="rounded-lg mx-auto"
          />
          {section.caption && (
            <p className="text-sm mt-2 text-gray-400 text-center">{section.caption}</p>
          )}
        </div>
      )
    case "video":
      return (
        <div key={index} className="mb-4">
          <video controls className="rounded-lg mx-auto w-full max-w-xl">
            <source src={section.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {section.caption && (
            <p className="text-sm mt-2 text-gray-400 text-center">{section.caption}</p>
          )}
        </div>
      )
    case "file":
      return (
        <div key={index} className="mt-8 flex justify-center">
          <a 
            href={section.src} 
            download={section.filename} 
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold shadow-lg transition-colors text-lg"
          >
            {section.description}
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
    <div className="p-0">
      {/* Background */}
      <div className="fixed inset-0 bg-[url('/tech-background.svg')] min-h-screen bg-cover bg-center -z-10"/>
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 to-black/90 -z-10" />

      {/* Content */}
      <div className="flex flex-col pt-16 items-center justify-center text-center text-white px-4 min-h-screen">
        <div className="w-full max-w-2xl bg-gray-900/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-8 mx-auto animate-fade-in">
          {/* Project Header */}
          <h1 className="text-4xl font-extrabold mb-2 text-white tracking-tight">
            {project.title}
          </h1>
          <p className="text-lg text-yellow-400 mb-2 font-medium">
            {project.description}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {project.category}
          </p>
          
          {/* Technologies */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {project.technologies.map((tech, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Project Sections */}
          <div className="space-y-4">
            {project.sections.map((section, index) => (
              <SectionRenderer key={index} section={section} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
