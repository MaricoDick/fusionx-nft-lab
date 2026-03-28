import { APP_NAME, APP_URL } from "@/lib/env";

export async function GET() {
  const header = process.env.FARCASTER_HEADER;
  const payload = process.env.FARCASTER_PAYLOAD;
  const signature = process.env.FARCASTER_SIGNATURE;

  const accountAssociation =
    header && payload && signature
      ? {
          header,
          payload,
          signature
        }
      : undefined;

  return Response.json({
    ...(accountAssociation ? { accountAssociation } : {}),
    frame: {
      version: "1",
      name: APP_NAME,
      iconUrl: `${APP_URL}/icon.svg`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/og-image.svg`,
      buttonTitle: "Start Battle",
      splashImageUrl: `${APP_URL}/splash.svg`,
      splashBackgroundColor: "#dff1ff",
      subtitle: "NFT fusion battle mini app",
      description:
        "Burn 3 matching NFTs, battle through onchain probability, and mint higher-tier creatures on Base.",
      primaryCategory: "games",
      tags: ["base", "nft", "gamefi", "fusion", "miniapp"],
      tagline: "Fuse. Battle. Upgrade.",
      heroImageUrl: `${APP_URL}/hero-image.svg`,
      ogTitle: APP_NAME,
      ogDescription: "A playful onchain NFT fusion battle on Base.",
      ogImageUrl: `${APP_URL}/og-image.svg`,
      screenshotUrls: [`${APP_URL}/screenshot-1.svg`, `${APP_URL}/screenshot-2.svg`],
      noindex: false
    }
  });
}
