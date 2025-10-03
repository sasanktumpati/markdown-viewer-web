import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Live Markdown Editor & Viewer with Mermaid Diagrams",
  description: "Free online markdown editor and viewer with live preview, Mermaid diagram support, and syntax highlighting. No signup required.",
  keywords: ["markdown", "editor", "viewer", "live preview", "mermaid", "diagrams", "syntax highlighting"],
  authors: [{ name: "sasanktumpati" }],
  metadataBase: new URL("https://md.built.systems"),
  alternates: {
    canonical: "https://md.built.systems",
  },
  openGraph: {
    title: "Live Markdown Editor & Viewer with Mermaid Diagrams",
    description: "Free online markdown editor and viewer with live preview, Mermaid diagram support, and syntax highlighting. No signup required.",
    url: "https://md.built.systems",
    siteName: "Markdown Viewer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Markdown Editor & Viewer with Mermaid Diagrams",
    description: "Free online markdown editor and viewer with live preview, Mermaid diagram support, and syntax highlighting. No signup required.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Markdown Viewer",
    "url": "https://md.built.systems",
    "description": "Free online markdown editor and viewer with live preview, Mermaid diagram support, and syntax highlighting. No signup required.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "featureList": [
      "Live markdown preview",
      "Mermaid diagram rendering",
      "Syntax highlighting for code blocks",
      "Resizable split view editor",
      "Local storage persistence",
      "No signup required"
    ]
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
