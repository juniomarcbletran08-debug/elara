import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ÉLARA — Vístete de ti",
  description: "Moda femenina, detalles delicados y piezas elegidas para celebrar tu estilo. Descubre la nueva colección de ÉLARA.",
  applicationName: "ÉLARA",
  icons: { icon: "/elara-mark.svg" },
  keywords: ["moda femenina", "boutique", "vestidos", "accesorios", "Perú"],
  openGraph: {
    title: "ÉLARA — Vístete de ti",
    description: "Una colección para tu manera única de brillar.",
    type: "website",
    locale: "es_PE"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f1e8"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}