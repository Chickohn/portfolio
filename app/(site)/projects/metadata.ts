import { Metadata } from 'next';

/**
 * Metadata for projects listing page
 */
export const metadata: Metadata = {
  title: 'Projects – Freddie Kohn Portfolio',
  description: 'Explore my portfolio of software engineering and game development projects. From 3D games in Unity to full-stack web applications.',
  keywords: ['Projects', 'Portfolio', 'Software Engineering', 'Game Development', 'Web Development', 'Freddie Kohn'],
  authors: [{ name: 'Freddie Kohn' }],
  openGraph: {
    title: 'Projects – Freddie Kohn Portfolio',
    description: 'Explore my portfolio of software engineering and game development projects.',
    url: 'https://kohn.me.uk/projects',
    siteName: 'Freddie Kohn Portfolio',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Projects – Freddie Kohn Portfolio',
    description: 'Explore my portfolio of software engineering and game development projects.',
  },
  alternates: {
    canonical: 'https://kohn.me.uk/projects',
  },
};

