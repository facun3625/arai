import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "araí yerba mate - tienda oficial",
  description: "plataforma e-commerce multi-franquicia para araí yerba mate.",
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
            <WhatsAppButton />
            <AIChatButton />
          </MaintenanceGuard>
        </Providers>
      </body>
    </html>
  );
}
