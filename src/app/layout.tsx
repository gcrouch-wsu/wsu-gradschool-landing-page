import type { Metadata } from "next";
import {
  IBM_Plex_Sans,
  Montserrat,
  Source_Serif_4,
  Space_Grotesk,
} from "next/font/google";
import { SiteTheme } from "@/components/SiteTheme";
import { getSiteSettings } from "@/lib/settings";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});

const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-source-serif-4",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: s.headerTitle,
    description: s.headerSubtitle,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${ibmPlexSans.variable} ${spaceGrotesk.variable} ${sourceSerif4.variable} antialiased`}
      >
        <SiteTheme settings={settings} />
        {children}
      </body>
    </html>
  );
}
