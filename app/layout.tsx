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
  description: 'Passionate Computer Science graduate specializing in game development and software engineering. Experienced in Unity, C#, React, Python, and modern web technologies.',
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
          strategy="afterInteractive"
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

      </body>
    </html>
  );
}
