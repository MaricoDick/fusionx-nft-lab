type TokenRecord = {
  tokenId: number;
  tier: number;
};

const tierDescriptions: Record<number, string> = {
  1: "基础实验体，适合做第一次合成。",
  2: "轻度进阶体，成功率开始收紧。",
  3: "高阶候选体，继续合成更刺激。",
  4: "终阶稀有体，不能再继续向上融合。"
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
