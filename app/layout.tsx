import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PRODUCT_DOMAIN } from "@/lib/brand";
import { HOME_DESCRIPTION, HOME_TITLE, ogImageForArea } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(`https://${PRODUCT_DOMAIN}`),
  title: {
    default: HOME_TITLE,
    template: "%s — On This Water",
  },
  description: HOME_DESCRIPTION,
  alternates: { canonical: `https://${PRODUCT_DOMAIN}/` },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: `https://${PRODUCT_DOMAIN}`,
    siteName: "On This Water",
    images: [{ url: ogImageForArea("galveston"), width: 1200, height: 520, alt: "Galveston tide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [ogImageForArea("galveston")],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Analytics />
      </body>
    </html>
  );
}
