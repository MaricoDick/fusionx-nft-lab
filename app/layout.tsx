import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { APP_NAME, APP_URL, BASE_APP_ID, TALENT_VERIFICATION } from "@/lib/env";

const metadataBase = new URL(APP_URL);

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Burn multiple NFTs to mint higher-tier outcomes, with rarity shaped by onchain probability.",
  applicationName: APP_NAME,
  metadataBase,
  openGraph: {
    title: APP_NAME,
    description: "GameFi + NFT Utility Mini App",
    url: APP_URL,
    siteName: APP_NAME,
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "FusionX NFT Lab" }]
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: "Burn 3 NFTs, fuse rarity, and mint higher tiers on Base.",
    images: ["/og-image.svg"]
  },
  alternates: {
    canonical: APP_URL
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {BASE_APP_ID ? <meta name="base:app_id" content={BASE_APP_ID} /> : null}
        {TALENT_VERIFICATION ? <meta name="talentapp:project_verification" content={TALENT_VERIFICATION} /> : null}
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
