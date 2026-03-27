type TokenRecord = {
  tokenId: number;
  tier: number;
};

const tierDescriptions: Record<number, string> = {
  1: "Base creature, ideal for your first fusion attempt.",
  2: "Early upgrade form, where the odds begin to tighten.",
  3: "High-tier candidate, with more risk and more excitement.",
  4: "Final rare form, no longer eligible for upward fusion."
};

export function getTierLabel(tier: number) {
  return `Tier ${tier}`;
}

export function summarizeByTier(tokens: TokenRecord[]) {
  return [1, 2, 3, 4].map((tier) => ({
    tier,
    label: getTierLabel(tier),
    count: tokens.filter((token) => token.tier === tier).length,
    description: tierDescriptions[tier]
  }));
}
