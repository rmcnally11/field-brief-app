import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PRODUCT_DOMAIN } from "@/lib/brand";
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
  title: "On This Water — seven saltwater theaters",
  description:
    "The water, as it is this morning. Live NOAA tides, a Saturday Letter, seasonal fundamentals by coast and species, and monthly 1–10 calendars.",
  openGraph: {
    title: "On This Water — seven saltwater theaters",
    description: "The water, as it is this morning. Live NOAA tides, not a bite.",
    url: `https://${PRODUCT_DOMAIN}`,
    siteName: "On This Water",
    images: [{ url: "/api/og/tide?area=galveston", width: 1200, height: 520, alt: "Galveston tide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "On This Water",
    description: "The water, as it is this morning.",
    images: ["/api/og/tide?area=galveston"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
