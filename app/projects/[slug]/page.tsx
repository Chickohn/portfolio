import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getPublicInternalProjectBySlug } from '../../../lib/public-projects'
import ProjectDetailsCard from '@/components/project-details-card'
import SectionRenderer from '@/components/section-renderer'
import Script from 'next/script'

/**
 * Generate metadata for project detail pages
 */
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getPublicInternalProjectBySlug(params.slug);
  
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  const baseUrl = 'https://kohn.me.uk';
  const projectUrl = `${baseUrl}/projects/${params.slug}`;
  
  // Parse project description for metadata
  const descriptionParts = project.description.split('|');
  const problem = descriptionParts.find(p => p.includes('Problem:'))?.replace('Problem:', '').trim() || '';
  const outcome = descriptionParts.find(p => p.includes('Outcome:'))?.replace('Outcome:', '').trim() || '';
  const metaDescription = outcome || problem || `Learn about ${project.title}, a ${project.category.toLowerCase()} project by Freddie Kohn.`;

  return {
    title: `${project.title} – Freddie Kohn Portfolio`,
    description: metaDescription,
    keywords: [...project.technologies, project.category, 'Freddie Kohn', 'Portfolio'],
    authors: [{ name: 'Freddie Kohn' }],
    openGraph: {
      title: `${project.title} – Freddie Kohn`,
      description: metaDescription,
      url: projectUrl,
      siteName: 'Freddie Kohn Portfolio',
      type: 'article',
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} – Freddie Kohn`,
      description: metaDescription,
    },
    alternates: {
      canonical: projectUrl,
    },
  };
}

export default async function Project({ params }: { params: { slug: string } }) {
  const project = await getPublicInternalProjectBySlug(params.slug)

  if (!project) {
    notFound()
  }

  const baseUrl = 'https://kohn.me.uk';
  const projectUrl = `${baseUrl}/projects/${params.slug}`;
  
  // Generate structured data for Article schema
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": project.title,
    "description": project.description,
    "author": {
      "@type": "Person",
      "name": "Freddie Kohn",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Person",
      "name": "Freddie Kohn"
    },
    "datePublished": new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": projectUrl
    },
    "about": {
      "@type": "Thing",
      "name": project.category
    }
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Projects",
        "item": `${baseUrl}/projects`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": project.title,
        "item": projectUrl
      }
    ]
  };

  return (
    <div className="min-h-screen">
      {/* Structured Data for SEO */}
      <Script id="article-ld-json" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(articleStructuredData)}
      </Script>
      <Script id="breadcrumb-ld-json" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(breadcrumbStructuredData)}
      </Script>

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
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Loading project details...
        </div>
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
