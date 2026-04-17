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
  title: "Garlaws - Property Lifecycle Maintenance",
  description: "Garlaws - Property Lifecycle Maintenance Orchestration Ecosystem for South Africa",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#c5a059",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Garlaws",
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