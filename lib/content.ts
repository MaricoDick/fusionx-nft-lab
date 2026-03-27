export const homeHighlights = [
  {
    kicker: "GameFi Utility",
    title: "三合一燃烧机制",
    description: "每次合成都需要 3 枚同阶 NFT。成功时系统会直接 mint 更高阶成果，失败则只留下实验记录。"
  },
  {
    kicker: "Rarity Control",
    title: "链上概率决定稀有度",
    description: "Tier 1 到 Tier 3 分别拥有 80%、70%、60% 的成功率，越高阶越稀有，也越值得认真挑选。"
  },
  {
    kicker: "Base Native",
    title: "适配 Base Mini App 归因",
    description: "页面内已预留 Base App metadata、Builder Code 数据后缀与交易埋点，方便后续做链上归因追踪。"
  },
  {
    kicker: "Calm Design",
    title: "自然柔和的实验室体验",
    description: "不走蓝紫发光仪表盘路线，而是用轻盈留白、柔和圆角和低饱和层次，把 NFT 操作做得更舒适。"
  }
];

export const fusionSteps = [
  { index: "01", title: "Mint 基础实验体", description: "先在实验室铸造 Tier 1 NFT，建立自己的初始素材池。" },
  {
    index: "02",
    title: "选择三枚同阶 NFT",
    description: "进入实验台后，只能从同一个 tier 中勾选 3 枚 NFT，才能满足合约条件。"
  },
  {
    index: "03",
    title: "等待链上结果",
    description: "交易确认后，如果概率命中，就能获得更高阶稀有体；否则本次材料会全部燃烧。"
  }
];

export const probabilityRows = [
  { tier: "Tier 1 → Tier 2", detail: "3 枚 Tier 1 NFT 燃烧后，有机会铸造 Tier 2。", rate: "80%" },
  { tier: "Tier 2 → Tier 3", detail: "3 枚 Tier 2 NFT 燃烧后，有机会铸造 Tier 3。", rate: "70%" },
  { tier: "Tier 3 → Tier 4", detail: "3 枚 Tier 3 NFT 燃烧后，有机会铸造 Tier 4。", rate: "60%" },
  { tier: "Tier 4", detail: "终阶稀有体，保留收藏价值，不再继续向上融合。", rate: "MAX" }
];

export const guidePanels = [
  {
    kicker: "Rule 1",
    title: "先铸造，再合成",
    description: "FusionX 合约提供 mint() 作为起点。没有基础 NFT 时，先铸造几枚 Tier 1，后续才有足够素材做融合。"
  },
  {
    kicker: "Rule 2",
    title: "必须三枚同阶",
    description: "合约会检查 uint256[3] 中三枚 NFT 的 tierOf 是否一致，不一致会直接回退。"
  },
  {
    kicker: "Rule 3",
    title: "链上伪随机决定成功",
    description: "合约基于 block.timestamp、用户地址和 tokenId 计算随机值，低 gas 地完成概率判断。"
  },
  {
    kicker: "Rule 4",
    title: "Tier 4 是顶点",
    description: "当三枚 Tier 3 融合成功后，就会得到 Tier 4；而 Tier 4 不能继续参与合成。"
  }
];
