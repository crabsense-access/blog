import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Crabsense",
    template: "%s | Crabsense",
  },
  description: "Sitio institucional y blog de Crabsense.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
