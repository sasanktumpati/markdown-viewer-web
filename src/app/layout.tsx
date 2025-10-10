import { ReactScan } from "@/components/ReactScan";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: {
    default: "Free Markdown Editor Online - Live Preview & Mermaid Diagrams",
    template: "%s | Markdown Viewer",
  },
  description:
    "Edit markdown online with live preview. Free browser-based markdown editor featuring Mermaid diagrams, syntax highlighting, and split-view. No signup needed - start editing instantly.",
  keywords: [
    "markdown editor online",
    "free markdown editor",
    "markdown viewer",
    "online markdown editor",
    "markdown preview live",
    "edit markdown online",
    "mermaid diagram editor",
    "markdown to html converter",
    "md editor online free",
    "browser markdown editor",
    "real-time markdown preview",
    "markdown editor with preview",
    "online md editor",
    "web markdown editor",
    "markdown formatter online",
    "markdown syntax highlighter",
    "mermaid flowchart editor",
    "markdown documentation editor",
    "github markdown editor",
    "instant markdown preview",
  ],
  metadataBase: new URL("https://md.built.systems"),
  alternates: {
    canonical: "https://md.built.systems",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  openGraph: {
    title: "Free Markdown Editor Online - Live Preview & Mermaid Diagrams",
    description:
      "Edit markdown online with live preview. Free browser-based editor with Mermaid diagrams & syntax highlighting. Start editing instantly - no signup required.",
    url: "https://md.built.systems",
    siteName: "Markdown Viewer",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://md.built.systems/og-image.png",
        width: 1200,
        height: 630,
        alt: "Markdown Editor with Live Preview - Split View Interface",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Markdown Editor Online - Live Preview & Mermaid",
    description:
      "Edit markdown online with live preview. Free browser-based editor with Mermaid diagrams & syntax highlighting. Start instantly - no signup.",
    images: ["https://md.built.systems/og-image.png"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Markdown Viewer",
    alternateName: [
      "MD Viewer",
      "Online Markdown Editor",
      "Markdown Editor Online",
    ],
    url: "https://md.built.systems",
    description:
      "Free online markdown editor with real-time preview, Mermaid diagram rendering, syntax highlighting, and split-view editing. Edit and preview markdown files instantly in your browser without installation.",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements:
      "Requires JavaScript. Works with Chrome, Firefox, Safari, Edge.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Real-time markdown preview with instant live updates",
      "Mermaid diagram rendering for flowcharts, sequence diagrams, Gantt charts, and more",
      "Syntax highlighting for 100+ programming languages",
      "Resizable split-view editor with customizable layout",
      "Automatic local storage persistence - never lose your work",
      "No signup, registration, or account required",
      "100% free and open-source",
      "Works entirely in your browser - no server upload or data collection",
      "Mobile-responsive design for editing on any device",
      "Export markdown as HTML",
      "Support for GitHub Flavored Markdown (GFM)",
      "Copy rendered HTML with one click",
    ],
    screenshot: "https://md.built.systems/og-image.png",
    softwareVersion: "1.0",
    datePublished: "2025-01-01",
    inLanguage: "en-US",
    audience: {
      "@type": "Audience",
      audienceType:
        "Developers, technical writers, documentation authors, students, researchers, content creators",
    },
    keywords:
      "markdown editor, online markdown, markdown preview, mermaid diagrams, syntax highlighting, free markdown editor",
    sourceOrganization: {
      "@type": "Organization",
      name: "Open Source",
      url: "https://github.com/sasanktumpati/markdown-viewer-web",
    },
    codeRepository: "https://github.com/sasanktumpati/markdown-viewer-web",
    license:
      "https://github.com/sasanktumpati/markdown-viewer-web/blob/main/LICENSE",
  };

  return (
    <html lang="en">
      <ReactScan />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(jsonLd)}
        </Script>
        {children}
      </body>
    </html>
  );
}
