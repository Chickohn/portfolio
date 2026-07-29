import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteShell from "../components/site-shell";

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
  title: 'Freddie Kohn – Portfolio',
  description: 'Freddie Kohn – Web-Development and Full-Stack Engineering portfolio showcasing interactive projects, skills, and contact information.',
  keywords: ['Freddie Kohn', 'Software Engineer', 'Game Developer', 'Computer Science', 'Unity', 'C#', 'React', 'Python', 'Full Stack Developer'],
  authors: [{ name: 'Freddie Kohn' }],
  creator: 'Freddie Kohn',
  openGraph: {
    title: 'Freddie Kohn – Web-Developer & Full-Stack Engineer',
    description: 'Passionate Computer Science graduate specializing in web development and software engineering.',
    url: 'https://kohn.me.uk',
    siteName: 'Freddie Kohn Portfolio',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freddie Kohn – Web-Developer & Full-Stack Engineer',
    description: 'Passionate Computer Science graduate specializing in web development and software engineering.',
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
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
