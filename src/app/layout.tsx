import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voy Veo",
  description: "Guía premium mobile-first para galerías, museos y exhibiciones de arte en Buenos Aires."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        {children}
        <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
