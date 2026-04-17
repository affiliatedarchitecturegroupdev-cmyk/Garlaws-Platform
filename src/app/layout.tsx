import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/components/ToastNotifications";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <CartProvider>
            <ServiceWorkerRegistration />
            {children}
            <FloatingChatWidget />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}