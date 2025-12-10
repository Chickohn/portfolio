/**
 * SEO utility functions
 */

import { Metadata } from 'next';

const baseUrl = 'https://kohn.me.uk';
const siteName = 'Freddie Kohn Portfolio';

/**
 * Creates standard metadata object with common fields
 */
export function createMetadata({
  title,
  description,
  path,
  keywords = [],
  type = 'website',
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: 'website' | 'article';
}): Metadata {
  const url = `${baseUrl}${path}`;
  
  return {
    title: `${title} – ${siteName}`,
    description,
    keywords: [...keywords, 'Freddie Kohn', 'Portfolio'],
    authors: [{ name: 'Freddie Kohn' }],
    openGraph: {
      title: `${title} – ${siteName}`,
      description,
      url,
      siteName,
      type,
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} – ${siteName}`,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generates Article structured data
 */
export function generateArticleStructuredData({
  title,
  description,
  url,
  author = 'Freddie Kohn',
  datePublished,
}: {
  title: string;
  description: string;
  url: string;
  author?: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author,
      "url": baseUrl
    },
    "publisher": {
      "@type": "Person",
      "name": author
    },
    "datePublished": datePublished || new Date().toISOString(),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };
}

/**
 * Generates Breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

