import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteHeader } from "@/components/site-header";
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

export const metadata: Metadata = {
  title: "Field Brief — Texas, Louisiana, Florida, Bahamas",
  description:
    "Where, when, and why inshore fish should be on the water. Live NOAA tides, a weekly Field Letter, seasonal fundamentals by coast and species, and monthly 1–10 calendars.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">{children}</main>
          <footer className="border-t border-[color:var(--line)] px-4 py-6 text-center text-xs text-[color:var(--cream)]/40">
            Field Brief is a conditions instrument, not a guarantee and not a chart for navigation.
            Verify TPWD, FWC, Bahamas, FKNMS, and NPS rules before you fish. Tight lines.
          </footer>
        </TooltipProvider>
      </body>
    </html>
  );
}
