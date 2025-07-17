import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";
import NavWrapper from "../components/nav-wrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  preload: true,
  display: 'swap',
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  preload: false,
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Freddie Kohn – Game-Dev & Full-Stack Engineer',
  description: 'Freddie Kohn – Web-Development and Full-Stack Engineering portfolio showcasing interactive projects, skills, and contact information.',
  keywords: ['Freddie Kohn', 'Software Engineer', 'Game Developer', 'Computer Science', 'Unity', 'C#', 'React', 'Python', 'Full Stack Developer'],
  authors: [{ name: 'Freddie Kohn' }],
  creator: 'Freddie Kohn',
  openGraph: {
    title: 'Freddie Kohn – Game-Dev & Full-Stack Engineer',
    description: 'Passionate Computer Science graduate specializing in game development and software engineering.',
    url: 'https://kohn.me.uk',
    siteName: 'Freddie Kohn Portfolio',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freddie Kohn – Game-Dev & Full-Stack Engineer',
    description: 'Passionate Computer Science graduate specializing in game development and software engineering.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google6f2e82a93f6f0cbd',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Freddie Kohn",
    jobTitle: "Software Engineer & Game Developer",
    description: "Passionate Computer Science graduate specializing in game development and software engineering",
    url: "https://kohn.me.uk",
    image: "https://kohn.me.uk/Profile-Picture-Cropped.jpg",
    sameAs: [
      "https://www.linkedin.com/in/freddie-j-kohn/",
      "https://github.com/Chickohn"
    ],
    knowsAbout: ["Unity", "C#", "React", "Python", "JavaScript", "Game Development", "Software Engineering"],
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "University"
    }
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
        {/* Structured Data for SEO */}
        <Script id="ld-json" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(structuredData)}
        </Script>

        {/* Global navigation */}
        <NavWrapper />

        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-yellow-500 focus:text-black focus:rounded-md focus:font-medium"
        >
          Skip to main content
        </a>
        
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VJ8DW3XTD7"
          strategy="lazyOnload"
          async
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VJ8DW3XTD7');
          `}
        </Script>

        <main id="main-content" role="main" className="pt-20"> 
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900/50 border-t border-gray-800 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400 text-sm">
                © 2024 Freddie Kohn. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <a 
                  href="mailto:freddiej.kohn@gmail.com" 
                  className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                  aria-label="Send email to Freddie Kohn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 12.3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.7M21 7V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.01M21 7l-9 6-9-6"/>
                  </svg>
                </a>
                <a 
                  href="https://github.com/Chickohn" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                  aria-label="Visit Freddie Kohn's GitHub profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                    <path d="M9 18c-4.51 2-5-2-7-2"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/freddie-j-kohn/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 rounded"
                  aria-label="Visit Freddie Kohn's LinkedIn profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect width="4" height="12" x="2" y="9"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
