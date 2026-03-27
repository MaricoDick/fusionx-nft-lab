export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fusionx-nft-lab.vercel.app";

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
      name: "FusionX NFT Lab",
      iconUrl: `${appUrl}/icon.svg`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/og-image.svg`,
      buttonTitle: "Start Battle",
      splashImageUrl: `${appUrl}/splash.svg`,
      splashBackgroundColor: "#dff1ff",
      subtitle: "NFT fusion battle mini app",
      description:
        "Burn 3 matching NFTs, battle through onchain probability, and mint higher-tier creatures on Base.",
      primaryCategory: "games",
      tags: ["base", "nft", "gamefi", "fusion", "miniapp"],
      tagline: "Fuse. Battle. Upgrade.",
      heroImageUrl: `${appUrl}/hero-image.svg`,
      ogTitle: "FusionX NFT Lab",
      ogDescription: "A playful onchain NFT fusion battle on Base.",
      ogImageUrl: `${appUrl}/og-image.svg`,
      screenshotUrls: [`${appUrl}/screenshot-1.svg`, `${appUrl}/screenshot-2.svg`],
      noindex: false
    }
  });
}
