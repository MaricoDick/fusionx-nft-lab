import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fusionx-nft-lab.vercel.app";

export const metadata: Metadata = {
  title: "FusionX NFT Lab",
  description: "用户燃烧多个 NFT 合成高级 NFT，链上概率控制稀有度。",
  applicationName: "FusionX NFT Lab",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "FusionX NFT Lab",
    description: "GameFi + NFT Utility Mini App",
    url: appUrl,
    siteName: "FusionX NFT Lab",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "FusionX NFT Lab" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "FusionX NFT Lab",
    description: "Burn 3 NFTs, fuse rarity, and mint higher tiers on Base.",
    images: ["/og-image.svg"]
  },
  alternates: {
    canonical: appUrl
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="base:app_id" content="69c5fc322f29a15e2b91ecec" />
        <meta
          name="talentapp:project_verification"
          content="7433cbaee5897d6ff2648b1142cadbfc4e595f8971c0b876a6bf19e50870b9fdb98c9bcb77149907a1d39216b706dab80303f1e25e46b983e72fb80a362b454b"
        />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
