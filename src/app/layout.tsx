import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AIChatButton } from "@/components/chat/AIChatButton";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { Providers } from "@/app/providers";
import { SessionSync } from "@/components/auth/SessionSync";
import { SideCart } from "@/components/cart/SideCart";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"]
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
};

export const metadata: Metadata = {
  title: "araí yerba mate - tienda oficial",
  description: "plataforma e-commerce multi-franquicia para araí yerba mate.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "araí yerba mate - tienda oficial",
    description: "plataforma e-commerce multi-franquicia para araí yerba mate.",
    images: [{ url: "/arai_logo.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/arai_logo.png"],
  },
};

import { MaintenanceGuard } from "@/components/layout/MaintenanceGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <AnalyticsScripts />
        {/* Google Translate Widget - hidden, triggered by buttons in Header */}
        <script dangerouslySetInnerHTML={{ __html: `
          function googleTranslateElementInit() {
            new google.translate.TranslateElement({
              pageLanguage: 'es',
              includedLanguages: 'en,es',
              autoDisplay: false
            }, 'google_translate_element');
          }
        `}} />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async />
        <style dangerouslySetInnerHTML={{ __html: `
          #google_translate_element { display: none; }
          .goog-te-banner-frame { display: none !important; }
          body { top: 0 !important; }
          .skiptranslate { display: none !important; }
        `}} />
      </head>
      <body className={montserrat.className}>
        <div id="google_translate_element" />
        <Providers>
          <MaintenanceGuard>
            <SessionSync />
            <Header />
            <SideCart />
            <main className="min-h-screen bg-white">
              {children}
            </main>
            <Footer />
            <AIChatButton />
            <WhatsAppButton />
          </MaintenanceGuard>
        </Providers>
      </body>
    </html>
  );
}
