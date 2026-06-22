import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PROJECT } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: PROJECT.name,
    template: `%s | ${PROJECT.name}`
  },
  description: PROJECT.description
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
