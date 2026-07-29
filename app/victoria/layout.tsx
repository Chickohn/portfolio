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

export default function VictoriaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
