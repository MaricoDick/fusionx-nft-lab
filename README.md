# FusionX NFT Lab

FusionX NFT Lab is a Base Mini App for NFT fusion gameplay. Users mint Tier 1 NFTs, burn 3 NFTs of the same tier, and probabilistically mint a higher-tier NFT onchain.

## Features

- Multi-page Next.js Mini App with mobile-first navigation
- RainbowKit + wagmi wallet connection on Base
- Mint and fuse flows for the FusionX contract
- Base app metadata and Talent verification tags
- ERC-8021 attribution data suffix placeholder wired into wagmi config
- Transaction attribution tracking in `utils/track.js`

## Routes

- `/` home
- `/lab` fusion lab
- `/collection` owned NFTs
- `/guide` gameplay guide

## Local Development

```bash
npm install
npm run build
```

Set environment variables from `.env.example` when needed.
