export const homeHighlights = [
  {
    kicker: "GameFi Utility",
    title: "Three-into-one burn loop",
    description: "Every fusion needs 3 NFTs of the same tier. Success mints a higher-tier result while failure leaves only the battle log."
  },
  {
    kicker: "Rarity Control",
    title: "Onchain odds shape rarity",
    description: "Tier 1 to Tier 3 have success rates of 80%, 70%, and 60%. The higher you climb, the rarer the result becomes."
  },
  {
    kicker: "Base Native",
    title: "Ready for Base Mini App attribution",
    description: "The app already includes Base metadata, Builder Code wiring, and transaction tracking hooks for attribution-ready flows."
  },
  {
    kicker: "Calm Design",
    title: "A softer fusion experience",
    description: "Instead of a glowing crypto dashboard, the app uses open spacing, rounded cards, and gentle layers to keep NFT actions approachable."
  }
];

export const fusionSteps = [
  {
    index: "01",
    title: "Mint base creatures",
    description: "Start in the lab by minting Tier 1 NFTs and building your first material pool."
  },
  {
    index: "02",
    title: "Select three matching NFTs",
    description: "Only three NFTs from the same tier can be fused together under the contract rules."
  },
  {
    index: "03",
    title: "Wait for the onchain result",
    description: "If the probability check lands, you receive a higher-tier NFT. If not, all three materials are burned."
  }
];

export const probabilityRows = [
  { tier: "Tier 1 → Tier 2", detail: "Burn 3 Tier 1 NFTs for a chance to mint Tier 2.", rate: "80%" },
  { tier: "Tier 2 → Tier 3", detail: "Burn 3 Tier 2 NFTs for a chance to mint Tier 3.", rate: "70%" },
  { tier: "Tier 3 → Tier 4", detail: "Burn 3 Tier 3 NFTs for a chance to mint Tier 4.", rate: "60%" },
  { tier: "Tier 4", detail: "The final rarity class. Tier 4 cannot be fused further.", rate: "MAX" }
];

export const guidePanels = [
  {
    kicker: "Rule 1",
    title: "Mint first, fuse after",
    description: "FusionX uses `mint()` as the starting point. If you have no base NFTs yet, mint a few Tier 1 pieces before you try fusion."
  },
  {
    kicker: "Rule 2",
    title: "Three NFTs must match in tier",
    description: "The contract checks whether all three token ids in `uint256[3]` point to the same tier. If they do not, the call reverts."
  },
  {
    kicker: "Rule 3",
    title: "Low-gas pseudo-randomness decides success",
    description: "The contract derives a random value from `block.timestamp`, the user address, and a token id to keep the probability check lightweight."
  },
  {
    kicker: "Rule 4",
    title: "Tier 4 is the final form",
    description: "A successful Tier 3 fusion can mint Tier 4, and Tier 4 cannot be fused again."
  }
];
