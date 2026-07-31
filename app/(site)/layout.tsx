import Link from "next/link";
import Script from "next/script";

import Nav from "@/components/nav";

/**
 * Chrome for the public portfolio: nav, footer, analytics, structured data.
 *
 * This lives in a route group rather than in the root layout so that /victoria
 * never renders — or downloads — any of it. It replaced components/site-shell.tsx,
 * which was a client component whose only job was to read usePathname() and
 * branch on "/victoria", making the root of the entire app a client boundary.
 *
 * Route groups do not affect URLs: app/(site)/projects still serves /projects.
 */
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Freddie Kohn",
  jobTitle: "Software Engineer & Game Developer",
  description: "Passionate Computer Science graduate specializing in web development and software engineering",
  url: "https://kohn.me.uk",
  image: "https://kohn.me.uk/Profile-Picture-Cropped.jpg",
  sameAs: ["https://www.linkedin.com/in/freddie-j-kohn/", "https://github.com/Chickohn"],
  knowsAbout: [
    "Web Development",
    "Front-End Development",
    "Unity",
    "C#",
    "React",
    "Python",
    "JavaScript",
    "Game Development",
    "Software Engineering",
  ],
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "University",
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="ld-json" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(structuredData)}
      </Script>

      <Nav />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-yellow-500 focus:px-4 focus:py-2 focus:font-medium focus:text-black"
      >
        Skip to main content
      </a>

      <Script src="https://www.googletagmanager.com/gtag/js?id=G-VJ8DW3XTD7" strategy="lazyOnload" async />
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

      <footer className="relative z-20 mt-20 border-t border-slate-700 bg-slate-950 text-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.35)]">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/admin/login" className="text-sm text-slate-300" aria-label="Admin login">
              © 2024 Freddie Kohn. All rights reserved.
            </Link>
            <div className="flex items-center gap-6">
              <a
                href="mailto:freddiej.kohn@gmail.com"
                className="rounded text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Send email to Freddie Kohn"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.3V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.7M21 7V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v.01M21 7l-9 6-9-6" />
                </svg>
              </a>
              <a
                href="https://github.com/Chickohn"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Visit Freddie Kohn's GitHub profile"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/freddie-j-kohn/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label="Visit Freddie Kohn's LinkedIn profile"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
