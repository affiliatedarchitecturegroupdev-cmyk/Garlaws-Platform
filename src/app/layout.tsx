import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./components/Providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Garlaws - Enterprise Property Lifecycle Platform",
  description: "Complete enterprise-grade property lifecycle management orchestration ecosystem. Financial reconciliation, supply chain, CRM, AI automation, and more.",
  keywords: "property management, enterprise software, financial reconciliation, supply chain, CRM, AI automation, South Africa",
  authors: [{ name: "Garlaws Platform" }],
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Garlaws",
  },
  openGraph: {
    title: "Garlaws - Enterprise Property Lifecycle Platform",
    description: "Complete enterprise-grade property lifecycle management orchestration ecosystem",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Garlaws - Enterprise Property Lifecycle Platform",
    description: "Complete enterprise-grade property lifecycle management orchestration ecosystem",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical routes for better performance */}
        <link rel="preload" href="/dashboard" as="document" />
        <link rel="preload" href="/api/health" as="fetch" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}