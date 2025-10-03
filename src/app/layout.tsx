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
  title: "Markdown Viewer",
  description: "A simple markdown viewer with mermaidjs support",
  metadataBase: new URL("https://md.built.systems"),
  openGraph: {
    title: "Markdown Viewer",
    description: "A simple markdown viewer with mermaidjs support",
    url: "https://md.built.systems",
    siteName: "Markdown Viewer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Viewer",
    description: "A simple markdown viewer with mermaidjs support",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
