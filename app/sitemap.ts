import { MetadataRoute } from 'next'
import { getAllProjectIds } from '../lib/projects'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.kohn.me.uk' // Replace with your actual domain
  
  // Main static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Dynamic project pages
  const projectIds = getAllProjectIds()
  const projectPages = projectIds.map((projectId) => ({
    url: `${baseUrl}/projects/${projectId}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...projectPages]
} 