import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private",
  description: "Private page.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
  openGraph: {
    title: "Private",
    description: "Private page.",
  },
};

/**
 * No nav, footer, analytics or structured data here by design — those live in
 * app/(site)/layout.tsx, which this route deliberately sits outside of. The main
 * landmark used to come from the shared shell, so it is provided here instead.
 */
export default function VictoriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" role="main">
      {children}
    </main>
  );
}
