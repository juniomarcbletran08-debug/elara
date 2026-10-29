import type { Metadata } from "next";
import "./globals.css";
import { STORE } from "@/lib/config";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsappFab } from "@/components/whatsapp-fab";
import { CartProvider } from "@/components/cart-provider";

export const metadata: Metadata = {
  title: { default: `${STORE.name} — ${STORE.descriptor}`, template: `%s | ${STORE.name}` },
  description: "Descubre una selección de moda con una mirada editorial contemporánea.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE">
      <body><CartProvider><SiteHeader /><main>{children}</main><SiteFooter /><WhatsappFab /></CartProvider></body>
    </html>
  );
}
