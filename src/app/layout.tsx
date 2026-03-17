import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/common/WhatsAppButton";
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
      <body className={montserrat.className}>
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
          </MaintenanceGuard>
        </Providers>
      </body>
    </html>
  );
}
