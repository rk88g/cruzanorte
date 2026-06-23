import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PROJECT } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(PROJECT.siteUrl),
  title: {
    default: PROJECT.defaultTitle,
    template: `%s | ${PROJECT.name}`
  },
  description: PROJECT.description,
  keywords: [...PROJECT.keywords],
  applicationName: PROJECT.name,
  creator: PROJECT.name,
  publisher: PROJECT.name,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: PROJECT.defaultTitle,
    description: PROJECT.openGraphDescription,
    url: PROJECT.siteUrl,
    siteName: PROJECT.name,
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: PROJECT.openGraphImage,
        width: 1200,
        height: 630,
        alt: "Cruza Norte - Tu camino al norte empieza aqui"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: PROJECT.defaultTitle,
    description: PROJECT.openGraphDescription,
    images: [PROJECT.openGraphImage]
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico"
      },
      {
        url: "/icon.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    apple: [
      {
        url: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
          enableSystem={false}
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
