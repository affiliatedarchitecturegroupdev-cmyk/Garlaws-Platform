import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ToastNotifications";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { PushNotificationInitializer } from "@/components/PushNotificationInitializer";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { WebVitalsTracker } from "@/components/WebVitalsTracker";

export const metadata: Metadata = {
  title: "Garlaws - Enterprise Property Lifecycle Platform",
  description: "Complete enterprise-grade property lifecycle management orchestration ecosystem. Financial reconciliation, supply chain, CRM, AI automation, and more.",
  keywords: "property management, enterprise software, financial reconciliation, supply chain, CRM, AI automation, South Africa",
  authors: [{ name: "Garlaws Platform" }],
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}