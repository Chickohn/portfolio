import type { Metadata } from "next";
import localFont from "next/font/local";
import Nav from '../components/nav';
import "./globals.css";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'Freddie Kohn - Portfolio',
  description: 'Computer Science Student Portfolio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
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
        <Nav />
        <main className="pt-20"> 
          {/* "px-24 py-8 pt-20"> */}
          {children}
        </main>
      </body>
    </html>
  );
}
