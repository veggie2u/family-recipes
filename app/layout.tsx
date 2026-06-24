import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Newsreader } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FeatureFlagProvider } from "@/lib/feature-flag-context";
import { getFeatureFlags } from "@/lib/feature-flags";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Family Recipes",
  description:
    "Preserve, organize, and share the recipes that bring your family together.",
};

const manrope = Manrope({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-playfair",
  display: "swap",
  subsets: ["latin"],
});

async function FlaggedProviders({ children }: { children: React.ReactNode }) {
  const flags = await getFeatureFlags();
  return <FeatureFlagProvider flags={flags}>{children}</FeatureFlagProvider>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${newsreader.variable} ${manrope.className} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Suspense>
              <FlaggedProviders>{children}</FlaggedProviders>
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
